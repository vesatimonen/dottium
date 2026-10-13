

/*****************************************************************************
 * Redraw buttons
 *****************************************************************************/
function uiButtonsRedraw(game) {
    if (game.undoable()) {
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
    let gameInfo = document.getElementById("game-info");
    gameInfo.innerHTML = "L" + (game.level + 1) + "/" + options.challenges.length;
}

/*****************************************************************************
 * Redraw cell
 *****************************************************************************/
function uiCellRedraw(board, x, y) {
    /* Get DOM element for counter */
    let cell = document.getElementById("cell-" + x + "-" + y);

    /* No text in cell, items drawn on canvas */
    cell.innerHTML = '';

    /* Set background */
    if (board.resolved(x, y)) {
        cell.style.background = "#67BFEC";
    } else {
        cell.style.background = "none";
    }

}


/* Draw dots as white circle with dark ring, same as code_svg.c */
function uiDotsDraw(context, board) {
    const dotRadius = 0.22 * globals.cellSize;

    context.lineWidth   = 0.05 * globals.cellSize;
    context.strokeStyle = "#202020";
    context.fillStyle   = "#FFFFFF";

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

/* Draw blocks as short line in cell center, same as code_svg.c */
function uiBlocksDraw(context, board) {
    context.beginPath();
    context.lineWidth   = 0.07 * globals.cellSize;
    context.lineCap     = "round";
    context.strokeStyle = "#202020";

    for (let y = 0; y < board.height; y++) {
        for (let x = 0; x < board.width; x++) {
            if (board.getItem(x, y) != ITEM_BLOCK) {
                continue;
            }

            context.moveTo(globals.cellSize * (x + 0.4), globals.cellSize * (y + 0.5));
            context.lineTo(globals.cellSize * (x + 0.6), globals.cellSize * (y + 0.5));
        }
    }

    context.stroke();
}

/* Set text style for hints */
function uiHintStyleSet(context) {
    context.font         = (0.6 * globals.cellSize) + "px Oswald, sans-serif";
    context.fillStyle    = "#202020";
    context.textAlign    = "center";
}

/* Draw col hints centered in top and bottom margin */
function uiColHintsDraw(context, board) {
    const margin     = globals.cellSize * globals.boardMargin;
    const gridHeight = globals.cellSize * board.height;

    const fontYShift  = 0.24 * globals.cellSize;
    const placeYShift = 0.10 * globals.cellSize;

    uiHintStyleSet(context);

    for (let x = 0; x < board.width; x++) {
        /* No hint, nothing to draw */
        if (board.colHints[x] == undefined) {
            continue;
        }

        context.fillText(board.colHints[x], globals.cellSize * (x + 0.5), 0          - margin / 2 + fontYShift + placeYShift);
        context.fillText(board.colHints[x], globals.cellSize * (x + 0.5), gridHeight + margin / 2 + fontYShift - placeYShift);
    }
}

/* Draw row hints centered in left and right margin */
function uiRowHintsDraw(context, board) {
    const margin    = globals.cellSize * globals.boardMargin;
    const gridWidth = globals.cellSize * board.width;

    const fontYShift  = 0.24 * globals.cellSize;
    const placeXShift = 0.20 * globals.cellSize;

    uiHintStyleSet(context);

    for (let y = 0; y < board.height; y++) {
        /* No hint, nothing to draw */
        if (board.rowHints[y] == undefined) {
            continue;
        }

        context.fillText(board.rowHints[y], 0         - margin / 2 + placeXShift, globals.cellSize * (y + 0.5) + fontYShift);
        context.fillText(board.rowHints[y], gridWidth + margin / 2 - placeXShift, globals.cellSize * (y + 0.5) + fontYShift);
    }
}

/* Draw copyright turned up on outer edge of right margin, same as code_svg.c */
function uiCopyrightDraw(context, board) {
    const margin     = globals.cellSize * globals.boardMargin;
    const gridWidth  = globals.cellSize * board.width;
    const gridHeight = globals.cellSize * board.height;

    context.save();
    context.font         = (0.3 * globals.cellSize) + "px Courier New, monospace";
    context.fillStyle    = "#202020";
    context.textAlign    = "center";
    context.textBaseline = "alphabetic";

    /* Turn text to read bottom to top */
    context.translate(gridWidth + margin - 1.0, gridHeight / 2);
    context.rotate(-Math.PI / 2);
    context.fillText("© Vesa Timonen", 0, 0);
    context.restore();
}

/* Draw room hints in top-left corner of room's first cell, same as code_svg.c */
function uiRoomHintsDraw(context, board) {
    const fontYShift = 0.23 * globals.cellSize;
    let roomHintDrawn = [];

    uiHintStyleSet(context);
    context.font = (0.4 * globals.cellSize) + "px Oswald, sans-serif";

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

            context.fillText(board.roomHints[roomId], globals.cellSize * (x + 1 / 6), globals.cellSize * (y + 1 / 6) + fontYShift);
        }
    }
}

function uiElementsRedraw(board) {
    const context = elements.canvas.getContext('2d');

    /* Line style for walls and frame */
    const lineWidth   = 2.0;

    /* Grid size in pixels */
    const gridWidth  = globals.cellSize * board.width;
    const gridHeight = globals.cellSize * board.height;

    /* Canvas fills board with margin, setting size also clears it */
    const pixelRatio = window.devicePixelRatio || 1;
    elements.canvas.width  = elements.canvas.clientWidth  * pixelRatio;
    elements.canvas.height = elements.canvas.clientHeight * pixelRatio;
    context.scale(pixelRatio, pixelRatio);

    /* Grid 0,0 after margin, margin is at negative coordinates */
    const margin = globals.cellSize * globals.boardMargin;
    context.translate(margin, margin);

    /* Draw dots in cell centers */
    const dotRadius = 1.5;
    for (let y = 0; y < board.height; y++) {
        for (let x = 0; x < board.width; x++) {
            context.beginPath();
            context.arc(globals.cellSize * (x + 0.5), globals.cellSize * (y + 0.5), dotRadius, 0, 2 * Math.PI, false);
            context.fillStyle = "#202020";
            context.fill();
        }
    }

    /* Draw blocks */
    uiBlocksDraw(context, board);

    /* Draw dots */
    uiDotsDraw(context, board);

    /* Draw walls */
    context.beginPath();
    context.lineWidth = lineWidth;
    context.lineCap = "round"; /* Smooth wall ends and corners */
    context.strokeStyle = "#202020";

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
    context.rect(0, 0, gridWidth, gridHeight);
    context.stroke();

    /* Draw hints in margin */
    uiColHintsDraw(context, board);
    uiRowHintsDraw(context, board);
    uiRoomHintsDraw(context, board);

    /* Draw copyright on right side */
    uiCopyrightDraw(context, board);
}

/* Redraw when Oswald is loaded, canvas does not do it itself */
document.fonts.load("16px Oswald").then(function () {
    if (globals.game) {
        uiElementsRedraw(globals.game.board);
    }
});

function uiBoardRedraw(board) {
    /* Redraw cell content */
    for (let y = 0; y < board.height; y++) {
        for (let x = 0; x < board.width; x++) {
            /* Redraw item image */
            uiCellRedraw(board, x ,y);
        }
    }

    /* Redraw dots and walls */
    uiElementsRedraw(board);

    /* Redraw info */
    uiInfoRedraw(globals.game);

    /* Redraw buttons */
    uiButtonsRedraw(globals.game);
}


/*****************************************************************************
 * Setup board elements
 *****************************************************************************/
function uiBoardSetup(board) {

    /* Calculate board grid size, margin on both sides takes room too */
    globals.cellSize = Math.floor((elements.screen.clientWidth) / (globals.boardMaxSize + 2 * globals.boardMargin));

    /* Clear elements in board */
    while (elements.grid.firstChild) {
        elements.grid.removeChild(elements.grid.firstChild);
    }

    /* Center the board, margin as padding so canvas covers it */
    elements.board.style.padding = globals.cellSize * globals.boardMargin + "px";
    elements.board.style.width = globals.cellSize * board.width + "px";
    elements.board.style.left  = Math.floor((globals.cellSize * (globals.boardMaxSize - board.width)) / 2) + "px";

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
            newCell.style.lineHeight = globals.cellSize + "px"; /* Center text vertically */
            newCell.style.textAlign  = "center";

            newRow.appendChild(newCell);

        }
    }

    /* Redraw board */
    uiBoardRedraw(board);
}

/*****************************************************************************
 * Refresh board elements and check if game over
 *****************************************************************************/
function uiGridAnimationEnd(event) {
    event.stopPropagation();
    globals.animating = false;

    if (globals.game.level + 1 >= options.challenges.length) {
        /* Show game over modal */
        elements.gameOver.style.visibility = "visible";
        elements.board.style.visibility = "hidden";
    }

    gameStart(globals.game.level + 1); /* Start new level */
    return false;
}


/*****************************************************************************
 * Redraw UI
 *****************************************************************************/
function uiRedraw() {
    /* Redraw game board */
    uiBoardRedraw(globals.game.board);

    /* Check if end of level */
    if (globals.game.board.solved()) {
        /* Start animation */
        globals.animating = true;
        elements.board.addEventListener("animationend", uiGridAnimationEnd);
        elements.board.style.animation = "none";
        elements.board.offsetHeight; /* trigger reflow */
        elements.board.style.animation = "image-appear 0.5s ease-in 0.2s 1 reverse";
    }
}




