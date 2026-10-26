
/*****************************************************************************
 * Canvas element sizes, part of cell size
 *****************************************************************************/
const DOT_RADIUS       = 0.26; /* White dot */
const DOT_RING_WIDTH   = 0.05; /* Dark ring around dot */
const BLOCK_LINE_WIDTH = 0.06; /* Block cross thickness */
const BLOCK_HALF_LEN   = 0.15; /* Block cross line half length from center */
const GRID_DOT_RADIUS  = 0.03; /* Small dot in every cell */
const FRAME_WIDTH      = 0.04; /* Grid frame */

/* Title, buttons, info and instructions grow with board */
const ELEMENT_SCALE_BASE_CELL = 50;  /* Cell size where scale is 1 */
const ELEMENT_SCALE_MAX       = 1.3; /* Biggest scale */

/*****************************************************************************
 * Canvas colors
 *****************************************************************************/
/* Dark color for walls, dots, blocks and text */
const INK_COLOR       = "#1C2B3A";
const HINT_DONE_COLOR = INK_COLOR + "33"; /* Ink with 20% alpha */
const DOT_FILL_COLOR  = "#FFFFFF";        /* Inside of dot */
const HINT_OVER_COLOR = "#F00000";        /* Hint broken */
const NO_HINT_ROOM_COLOR = "#FFFFFF20";

/*****************************************************************************
 * Redraw buttons
 *****************************************************************************/
function uiButtonsRedraw(game) {
    /* Disabled when nothing to undo, or game over modal shows */
    if (game.undoable() && !uiInputBlocked()) {
        elements.buttonUndo.disabled    = false;
        elements.buttonRestart.disabled = false;
    } else {
        elements.buttonUndo.disabled    = true;
        elements.buttonRestart.disabled = true;
    }
}

/*****************************************************************************
 * Redraw level elements
 *****************************************************************************/
function uiInfoRedraw(game) {
    elements.info.textContent = "L" + (game.level + 1) + "/" + options.challenges.length;
}


/* Draw dots as white circle with dark ring, same as code_svg.c */
function uiDotsDraw(context, board) {
    const dotRadius = DOT_RADIUS * globals.cellSize;

    context.lineWidth   = DOT_RING_WIDTH * globals.cellSize;
    context.strokeStyle = INK_COLOR;
    context.fillStyle   = DOT_FILL_COLOR;

    for (let y = 0; y < board.height; y++) {
        for (let x = 0; x < board.width; x++) {
            if (board.getItem(x, y) != ITEM_DOT) {
                continue;
            }

            context.beginPath();
            context.arc(globals.cellSize * (x + 0.5), globals.cellSize * (y + 0.5), dotRadius, 0, 2 * Math.PI, false);
            context.fill();
            context.stroke();
        }
    }
}

/* Add block cross in cell center to path, each line as long as old dash */
function uiBlockLineAdd(context, x, y) {
    const offset  = BLOCK_HALF_LEN / Math.SQRT2; /* Diagonal x and y offset */
    const centerX = x + 0.5;
    const centerY = y + 0.5;

    context.moveTo(globals.cellSize * (centerX - offset), globals.cellSize * (centerY - offset));
    context.lineTo(globals.cellSize * (centerX + offset), globals.cellSize * (centerY + offset));
    context.moveTo(globals.cellSize * (centerX - offset), globals.cellSize * (centerY + offset));
    context.lineTo(globals.cellSize * (centerX + offset), globals.cellSize * (centerY - offset));
}

/* Draw blocks as cross in cell center */
function uiBlocksDraw(context, board) {
    context.beginPath();
    context.lineWidth   = BLOCK_LINE_WIDTH * globals.cellSize;
    context.lineCap     = "round";
    context.strokeStyle = INK_COLOR;

    for (let y = 0; y < board.height; y++) {
        for (let x = 0; x < board.width; x++) {
            if (board.getItem(x, y) != ITEM_BLOCK) {
                continue;
            }

            uiBlockLineAdd(context, x, y);
        }
    }

    context.stroke();
}

/* Hint status shown on screen, updated late so quick taps do not flash */
const HINT_DELAY = 400; /* ms */
let uiHints = undefined;
let uiHintTimer = undefined;

/* Take hint status from board now */
function uiHintsUpdate(board) {
    clearTimeout(uiHintTimer);
    uiHintTimer = undefined;

    uiHints = {rows: [], cols: [], rooms: []};
    for (let y = 0; y < board.height; y++) {
        uiHints.rows[y] = board.rowStatus(y);
    }
    for (let x = 0; x < board.width; x++) {
        uiHints.cols[x] = board.colStatus(x);
    }
    for (let roomId = 0; roomId < board.roomCount; roomId++) {
        uiHints.rooms[roomId] = board.roomStatus(roomId);
    }
}

/* True while hint wait runs after last change */
function uiHintsWaiting() {
    return uiHintTimer != undefined;
}

/* Take hint status after short pause, new change restarts wait */
function uiHintsUpdateLater() {
    clearTimeout(uiHintTimer);
    uiHintTimer = setTimeout(function () {
        uiHintsUpdate(globals.game.board);
        uiElementsRedraw(globals.game.board);
    }, HINT_DELAY);
}

/* True if empty cell is in done row, col or room */
function uiCellDoneBlock(board, x, y) {
    if (board.getItem(x, y) != ITEM_NONE) {
        return false;
    }

    return uiHints.rooms[board.roomId[x][y]] == HINT_DONE ||
           uiHints.rows[y] == HINT_DONE ||
           uiHints.cols[x] == HINT_DONE;
}

/* Draw grey block in empty cells of done rows, cols and rooms */
function uiDoneBlocksDraw(context, board) {
    context.beginPath();
    context.lineWidth   = BLOCK_LINE_WIDTH * globals.cellSize; /* Same as real block */
    context.lineCap     = "round";
    context.strokeStyle = HINT_DONE_COLOR;

    for (let y = 0; y < board.height; y++) {
        for (let x = 0; x < board.width; x++) {
            if (uiCellDoneBlock(board, x, y)) {
                uiBlockLineAdd(context, x, y);
            }
        }
    }

    context.stroke();
}

/* Set text style for hints */
function uiHintStyleSet(context) {
    context.font         = (0.7 * globals.cellSize) + "px Oswald, sans-serif";
    context.fillStyle    = INK_COLOR;
    context.textAlign    = "center";
}

/* Hint color by status: dark open, faded done, red over */
function uiHintStatusSet(context, status, fontSize) {
    switch (status) {
        case HINT_DONE:
            context.fillStyle = HINT_DONE_COLOR;
            break;
        case HINT_OVER:
            context.fillStyle = HINT_OVER_COLOR;
            break;
        default:
            context.fillStyle = INK_COLOR;
    }

    context.font = fontSize + "px Oswald, sans-serif";
}

/* Draw col hints centered in top and bottom margin */
function uiColHintsDraw(context, board) {
    const margin     = Math.round(globals.cellSize * globals.boardMargin);
    const gridHeight = globals.cellSize * board.height;

    const fontYShift  = 0.28 * globals.cellSize; /* 0.4 of font size */
    const placeYShift = 0.02 * globals.cellSize;

    uiHintStyleSet(context);

    for (let x = 0; x < board.width; x++) {
        /* No hint, nothing to draw */
        if (board.colHints[x] == undefined) {
            continue;
        }

        uiHintStatusSet(context, uiHints.cols[x], 0.7 * globals.cellSize);
        context.fillText(board.colHints[x], globals.cellSize * (x + 0.5), 0          - margin / 2 + fontYShift + placeYShift);
        /* Bottom hint off, top only, uncomment to bring back */
//        context.fillText(board.colHints[x], globals.cellSize * (x + 0.5), gridHeight + margin / 2 + fontYShift - placeYShift);
    }
}

/* Draw row hints centered in left and right margin */
function uiRowHintsDraw(context, board) {
    const margin    = Math.round(globals.cellSize * globals.boardMarginLeft);
    const gridWidth = globals.cellSize * board.width;

    const fontYShift  = 0.28 * globals.cellSize;
    const placeXShift = -0.04 * globals.cellSize;

    uiHintStyleSet(context);

    for (let y = 0; y < board.height; y++) {
        /* No hint, nothing to draw */
        if (board.rowHints[y] == undefined) {
            continue;
        }

        uiHintStatusSet(context, uiHints.rows[y], 0.7 * globals.cellSize);
        context.fillText(board.rowHints[y], 0         - margin / 2 + placeXShift, globals.cellSize * (y + 0.5) + fontYShift);
        /* Right hint off, left only, uncomment to bring back */
//        context.fillText(board.rowHints[y], gridWidth + margin / 2 - placeXShift, globals.cellSize * (y + 0.5) + fontYShift);
    }
}

/* Lighten rooms with no hint, UI only, SVG stays black and white */
function uiNoHintRoomsDraw(context, board) {
    /* All cells in one path, so cell edges do not show as seams */
    context.beginPath();
    for (let y = 0; y < board.height; y++) {
        for (let x = 0; x < board.width; x++) {
            if (board.roomHints[board.roomId[x][y]] == undefined) {
                context.rect(globals.cellSize * x, globals.cellSize * y, globals.cellSize, globals.cellSize);
            }
        }
    }

    context.fillStyle = NO_HINT_ROOM_COLOR;
    context.fill();
}

/* Draw copyright turned up on outer edge of right margin, same as code_svg.c */
function uiCopyrightDraw(context, board) {
    const margin     = Math.round(globals.cellSize * globals.boardMargin);
    const gridWidth  = globals.cellSize * board.width;
    const gridHeight = globals.cellSize * board.height;

    context.save();
    context.font         = (0.3 * globals.cellSize) + "px Courier New, monospace";
    context.fillStyle    = INK_COLOR;
    context.textAlign    = "center";
    context.textBaseline = "alphabetic";

    /* Turn text to read bottom to top */
    context.translate(gridWidth + margin * 0.3, gridHeight / 2); /* Close to board, right hints are off */
    context.rotate(-Math.PI / 2);
    context.fillText("© Vesa Timonen", 0, 0);
    context.restore();
}

/* Draw room hints in top-left corner of room's first cell, same as code_svg.c */
function uiRoomHintsDraw(context, board) {
    const fontYShift = 0.23 * globals.cellSize;
    let roomHintDrawn = [];

    uiHintStyleSet(context);

    /* Row by row, so first cell is top-left of room */
    for (let y = 0; y < board.height; y++) {
        for (let x = 0; x < board.width; x++) {
            const roomId = board.roomId[x][y];

            /* Hint already drawn for this room */
            if (roomHintDrawn[roomId]) {
                continue;
            }
            roomHintDrawn[roomId] = true;

            /* No hint, nothing to draw */
            if (board.roomHints[roomId] == undefined) {
                continue;
            }

            uiHintStatusSet(context, uiHints.rooms[roomId], 0.4 * globals.cellSize);
            context.fillText(board.roomHints[roomId], globals.cellSize * (x + 0.14), globals.cellSize * (y + 0.155) + fontYShift);
        }
    }
}

function uiElementsRedraw(board) {
    const context = elements.canvas.getContext('2d');

    /* Grid size in pixels */
    const gridWidth  = globals.cellSize * board.width;
    const gridHeight = globals.cellSize * board.height;

    /* Canvas fills board with margin, setting size also clears it */
    const pixelRatio = window.devicePixelRatio || 1;
    const canvasRect = elements.canvas.getBoundingClientRect(); /* Exact size, not rounded */
    elements.canvas.width  = Math.round(canvasRect.width  * pixelRatio);
    elements.canvas.height = Math.round(canvasRect.height * pixelRatio);
    context.scale(pixelRatio, pixelRatio);

    /* Grid 0,0 after margin, margin is at negative coordinates */
    const margin  = Math.round(globals.cellSize * globals.boardMargin);
    const marginLeft = Math.round(globals.cellSize * globals.boardMarginLeft);
    context.translate(marginLeft, margin);

    /* Lighten rooms with no hint, under everything else */
    uiNoHintRoomsDraw(context, board);

    /* Draw grid dots in cell centers, only in cells with nothing else */
    for (let y = 0; y < board.height; y++) {
        for (let x = 0; x < board.width; x++) {
            if (board.getItem(x, y) != ITEM_NONE || uiCellDoneBlock(board, x, y)) {
                continue;
            }

            context.beginPath();
            context.arc(globals.cellSize * (x + 0.5), globals.cellSize * (y + 0.5), GRID_DOT_RADIUS * globals.cellSize, 0, 2 * Math.PI, false);
            context.fillStyle = INK_COLOR;
            context.fill();
        }
    }

    /* Draw blocks */
    uiBlocksDraw(context, board);

    /* Draw grey blocks where hint is done */
    uiDoneBlocksDraw(context, board);

    /* Draw dots */
    uiDotsDraw(context, board);

    /* Odd width lines move half pixel to sit on whole pixels */
    context.save();
    const lineShift = uiLineShift(globals.frameWidth);
    context.translate(lineShift, lineShift);

    /* Draw walls */
    context.beginPath();
    context.lineWidth = globals.frameWidth; /* Snapped to device pixels, sharp */
    context.lineCap = "round"; /* Smooth wall ends and corners */
    context.strokeStyle = INK_COLOR;

    /* Draw vertical walls */
    for (let x = 0; x < board.width + 1; x++) {
        for (let y = 0; y < board.height; y++) {
            if (board.getVerticalWall(x, y) > 0) {
                context.moveTo(globals.cellSize * x, globals.cellSize * y);
                context.lineTo(globals.cellSize * x, globals.cellSize * (y + 1));
            }
        }
    }

    /* Draw horizontal walls */
    for (let y = 0; y < board.height + 1; y++) {
        for (let x = 0; x < board.width; x++) {
            if (board.getHorizontalWall(x, y) > 0) {
                context.moveTo(globals.cellSize * x, globals.cellSize * y);
                context.lineTo(globals.cellSize * (x + 1), globals.cellSize * y);
            }
        }
    }

    context.stroke();

    /* Draw frame on grid edge */
    context.beginPath();
    context.lineWidth = globals.frameWidth; /* Same as modal and buttons */
    context.rect(0, 0, gridWidth, gridHeight);
    context.stroke();
    context.restore(); /* Hints use unshifted grid */

    /* Draw hints in margin */
    uiColHintsDraw(context, board);
    uiRowHintsDraw(context, board);
    uiRoomHintsDraw(context, board);

    /* Copyright off, uncomment to bring back */
//    uiCopyrightDraw(context, board);
}

/* Redraw when Oswald is loaded, canvas does not do it itself */
document.fonts.load("16px Oswald").then(function () {
    if (globals.game) {
        uiElementsRedraw(globals.game.board);
    }
});

function uiBoardRedraw(board) {
    /* Redraw dots and walls */
    uiElementsRedraw(board);

    /* Redraw info */
    uiInfoRedraw(globals.game);

    /* Redraw buttons */
    uiButtonsRedraw(globals.game);
}


/*****************************************************************************
 * Scale for page elements, never smaller than 1
 *****************************************************************************/
function uiElementScale(cellSize) {
    const scale = cellSize / ELEMENT_SCALE_BASE_CELL;

    if (scale < 1) {
        return 1;
    }
    if (scale > ELEMENT_SCALE_MAX) {
        return ELEMENT_SCALE_MAX;
    }
    return scale;
}


/*****************************************************************************
 * Frame line width snapped to whole device pixels, at least 1
 *****************************************************************************/
function uiFrameWidth(cellSize) {
    const pixelRatio  = window.devicePixelRatio || 1;
    const framePixels = Math.max(1, Math.round(FRAME_WIDTH * cellSize * pixelRatio));

    return framePixels / pixelRatio;
}


/*****************************************************************************
 * Half device pixel shift for odd width lines, else zero
 *****************************************************************************/
function uiLineShift(lineWidth) {
    const pixelRatio = window.devicePixelRatio || 1;
    const linePixels = Math.round(lineWidth * pixelRatio);

    if (linePixels % 2 === 1) {
        return 0.5 / pixelRatio;
    }
    return 0;
}


/*****************************************************************************
 * Setup board elements
 *****************************************************************************/
function uiBoardSetup(board) {

    /* Calculate board grid size, margin on both sides takes room too */
    globals.cellSize = Math.floor((elements.screen.clientWidth) / (globals.boardMaxSize + globals.boardMarginLeft + globals.boardMarginRight));

    /* Modal and buttons use same line as grid frame */
    globals.frameWidth = uiFrameWidth(globals.cellSize);
    document.documentElement.style.setProperty("--frame-width", globals.frameWidth + "px");

    /* Title, buttons, info and instructions grow with board */
    document.documentElement.style.setProperty("--element-scale", uiElementScale(globals.cellSize));

    /* Clear elements in board */
    while (elements.grid.firstChild) {
        elements.grid.removeChild(elements.grid.firstChild);
    }

    /* Whole pixel margins keep canvas size whole, no stretch blur */
    const margin      = Math.round(globals.cellSize * globals.boardMargin);
    const marginLeft  = Math.round(globals.cellSize * globals.boardMarginLeft);
    const marginRight = Math.round(globals.cellSize * globals.boardMarginRight);

    /* Center the board, margin as padding so canvas covers it */
    elements.board.style.padding = margin + "px";
    elements.board.style.paddingLeft   = marginLeft + "px";
    elements.board.style.paddingRight  = marginRight + "px";
    elements.board.style.paddingBottom = "2px"; /* No bottom hints, keep room for frame line */
    elements.board.style.width = globals.cellSize * board.width + "px";
    elements.board.style.left  = Math.floor((globals.cellSize * (globals.boardMaxSize - board.width)) / 2) + "px";

    /* Center modal on grid frame, not on board with margins */
    elements.modal.style.left = marginLeft + globals.cellSize * board.width  / 2 + "px";
    elements.modal.style.top  = margin + globals.cellSize * board.height / 2 + "px";

    /* Create grid and add cells */
    for (let y = 0; y < board.height; y++) {
        /* Create row */
        let newRow = document.createElement("div");
        newRow.className = "grid-row";
        elements.grid.appendChild(newRow);

        for (let x = 0; x < board.width; x++) {
            /* Create cell */
            let newCell = document.createElement("div");
            newCell.className    = "grid-cell";
            newCell.id           = "cell-" + x + "-" + y;

            newCell.style.width      = globals.cellSize + "px";
            newCell.style.height     = globals.cellSize + "px";

            newRow.appendChild(newCell);

        }
    }

    /* Redraw board, new board shows hints now */
    uiHintsUpdate(board);
    uiBoardRedraw(board);
}

/* No input during solve animation or while modal shows */
function uiInputBlocked() {
    return globals.animating || modalVisible();
}

/*****************************************************************************
 * Refresh board elements and check if game over
 *****************************************************************************/
function uiGridAnimationEnd(event) {
    event.stopPropagation();
    globals.animating = false;

    gameStart(globals.game.level + 1); /* Start new level */
    return false;
}


/*****************************************************************************
 * Redraw UI
 *****************************************************************************/
function uiRedraw(hintsLater) {
    const board = globals.game.board;

    /* Hints now, or after pause when tapping board, solved shows now */
    if (hintsLater && !board.solved()) {
        uiHintsUpdateLater();
    } else {
        uiHintsUpdate(board);
    }

    /* Redraw game board */
    uiBoardRedraw(board);

    /* Save after every change */
    gameSave();

    /* Check if end of level */
    if (globals.game.board.solved()) {
        /* Last level, fade in game over modal, board stays */
        if (globals.game.level + 1 >= options.challenges.length) {
            modalShow(options.gameOverText, "", true); /* Fade in, a bit faster than level change */
            return;
        }

        /* Start animation to next level, block input and gray buttons */
        globals.animating = true;
        uiButtonsRedraw(globals.game);
        elements.board.addEventListener("animationend", uiGridAnimationEnd);
        elements.board.style.animation = "none";
        elements.board.offsetHeight; /* trigger reflow */
        elements.board.style.animation = "image-appear 1.0s ease-in 0.4s 1 reverse"; /* 2x slower */
    }
}




