/*****************************************************************************
 * Editor elements
 *****************************************************************************/
const editorElements = {
    check:  document.getElementById("editor-check"),
    play:   document.getElementById("editor-play"),
    result: document.getElementById("editor-result"),
    text:   document.getElementById("editor-text")
};


/*****************************************************************************
 * Editor state
 *****************************************************************************/
const editor = {
    info:     undefined, /* Current challenge string */
    history:  [],        /* Earlier challenge strings for undo */
    solution: false,     /* Solution dots on board */
    differ:   [],        /* Cells [x, y] that differ in second solution */
    dots:     undefined  /* Test dots dots[x][y], not in link or undo */
};


/*****************************************************************************
 * Modal for help, same as in main.js, which editor does not load
 *****************************************************************************/
/* Tap that closed modal, its click is not used */
let modalDropClick = false;

function modalVisible() {
    return elements.modal.style.visibility == "visible";
}

function modalShow(title, text) {
    elements.modalTitle.textContent = title;
    elements.modalText.textContent  = text;
    elements.modal.style.visibility = "visible";

    uiButtonsRedraw(globals.game); /* Gray out buttons */
}

function modalHide() {
    elements.modal.style.visibility = "hidden";

    uiButtonsRedraw(globals.game);
}

/* Tap anywhere closes modal, tap does nothing else */
function modalPointerDown(event) {
    if (!modalVisible()) {
        modalDropClick = false;
        return;
    }

    event.preventDefault();
    event.stopPropagation(); /* Keep tap off the board */

    modalHide();
    modalDropClick = true;
}

/* Drop click of closing tap, so buttons do not act */
function modalClick(event) {
    if (modalDropClick) {
        modalDropClick = false;
        event.preventDefault();
        event.stopPropagation();
    }
}

/* Capture, so modal sees taps before board and buttons */
document.addEventListener("pointerdown", modalPointerDown, true);
document.addEventListener("click",       modalClick,       true);


/*****************************************************************************
 * Help in modal
 *****************************************************************************/
/* Editor controls, action and result */
const EDITOR_HELP = [
    ["Click edge",          "Increase line number"],
    ["Click room corner",   "Increase room number"],
    ["Click cell",          "Set or clear test dot"],
    ["Click wall",          "Set or clear wall"],
    ["Right click",         "Decrease number"],
    ["Long press",          "Decrease number"],
    ["Solve",               "Show solution"],
    ["Red ring",            "Cell differs in 2nd solution"],
    ["Paste to link box",   "Load challenge"]
];

/* Build help grid, dashes line up in middle column */
function editorHelp() {
    const help = document.createElement("div");
    help.className = "modal-help";

    for (const [action, result] of EDITOR_HELP) {
        for (const part of [action, "–", result]) {
            const cell = document.createElement("span");
            cell.textContent = part;
            help.appendChild(cell);
        }
    }
    return help;
}

function editorAbout() {
    modalShow("DOTTIUM EDITOR", "©\u00A0vesa.timonen[at]kolumbus.fi");
    elements.modalText.prepend(editorHelp()); /* modalShow clears it next time */
}

elements.buttonAbout.addEventListener("click", editorAbout);


/*****************************************************************************
 * Editor game, undo comes from editor history
 *****************************************************************************/
class EditorGame extends Game {
    undoable() {
        return editor.history.length > 0;
    }
}


/*****************************************************************************
 * Challenge helpers
 *****************************************************************************/
/* Empty board, no hints and no walls, rooms "-" so link does not end in dot */
function editorEmptyInfo(width, height) {
    const colHints = "-".repeat(width);
    const rowHints = "-".repeat(height);
    const walls    = "0".repeat(Math.ceil(width * height / 2));

    return width + "x" + height + "." + colHints + "." + rowHints + "." + walls + ".-";
}

/* Public game link, shown in box and copied */
function editorLink(info) {
    return "https://dottium.app/?c=" + info;
}

/* Game next to editor, for Play, web uses folder, local file needs index.html */
function editorPlayLink(info) {
    let page = "index.html";
    if (window.location.protocol == "http:" || window.location.protocol == "https:") {
        page = "./";
    }

    return new URL(page, window.location.href).href + "?c=" + info;
}

/* Same check as challengeValid() in main.js, which editor does not load */
function editorInfoValid(info) {
    const match = info.match(/^([0-9]+)x([0-9]+)\.([0-9-]+)\.([0-9-]+)\.([0-9a-fA-F]+)\.([0-9-]*)$/);
    if (match == null) {
        return false;
    }

    const width  = Number(match[1]);
    const height = Number(match[2]);
    if (width < 1 || height < 1 || width > globals.boardMaxSize || height > globals.boardMaxSize) {
        return false;
    }

    return match[3].length == width &&
           match[4].length == height &&
           match[5].length == Math.ceil(width * height / 2);
}

/* Challenge from link, INFO line or bare string, part after last > like Board.init() */
function editorInfoFromText(text) {
    let info = text.trim();

    const match = info.match(/[?&](?:c|challenge)=([^&#]*)/); /* Short or long option, as in game */
    if (match != null) {
        info = decodeURIComponent(match[1]);
    }

    const parts = info.split(">");
    return parts[parts.length - 1].trim();
}

/* Board sizes with own button, id editor-size-N */
const EDITOR_SIZES = [4, 5, 6, 7, 8];

function editorSizeButton(size) {
    return document.getElementById("editor-size-" + size);
}

/* Mark button of current size */
function editorSizeButtonsRedraw(size) {
    for (const buttonSize of EDITOR_SIZES) {
        editorSizeButton(buttonSize).classList.toggle("selected", buttonSize == size);
    }
}


/*****************************************************************************
 * Challenge encoding, reverse of Board.init()
 *****************************************************************************/
/* Hints to text, '-' means no hint */
function editorHintsText(hints, count) {
    let text = "";

    for (let i = 0; i < count; i++) {
        if (hints[i] == undefined) {
            text += "-";
        } else {
            text += hints[i];
        }
    }

    return text;
}

/* Room hints, trailing '-' cut but one kept, so link does not end in dot */
function editorRoomHintsText(roomHints, roomCount) {
    let text = editorHintsText(roomHints, roomCount).replace(/-+$/, "");

    if (text == "") {
        text = "-";
    }

    return text;
}

/* Wall mask of one cell, outer frame is not saved */
function editorWallMask(width, height, verticalWalls, horizontalWalls, x, y) {
    let mask = 0;

    if (y > 0 && horizontalWalls[x][y] > 0) {
        mask |= WALL_MASK_UP;
    }
    if (x < width - 1 && verticalWalls[x + 1][y] > 0) {
        mask |= WALL_MASK_RIGHT;
    }
    if (y < height - 1 && horizontalWalls[x][y + 1] > 0) {
        mask |= WALL_MASK_DOWN;
    }
    if (x > 0 && verticalWalls[x][y] > 0) {
        mask |= WALL_MASK_LEFT;
    }

    return mask;
}

/* One hex digit per checkered cell, each inner edge touches one of them */
function editorWallsText(width, height, verticalWalls, horizontalWalls) {
    let text = "";

    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            if ((x + y) % 2 == 0) {
                text += editorWallMask(width, height, verticalWalls, horizontalWalls, x, y).toString(16);
            }
        }
    }

    return text;
}

/* Challenge string from board parts, size.cols.rows.walls.rooms */
function editorEncode(width, height, colHints, rowHints, verticalWalls, horizontalWalls, roomsText) {
    return width + "x" + height + "." +
           editorHintsText(colHints, width) + "." +
           editorHintsText(rowHints, height) + "." +
           editorWallsText(width, height, verticalWalls, horizontalWalls) + "." +
           roomsText;
}

/* Copy of 2D array */
function editorArrayCopy(array) {
    return array.map(function (column) { return column.slice(); });
}


/*****************************************************************************
 * Edit functions, each returns new challenge string
 *****************************************************************************/
/* Next hint: no hint, 0, 1 ... max, no hint, back = other way */
function editorHintCycle(hint, max, back) {
    if (back) {
        if (hint == undefined) {
            return max;
        }
        if (hint == 0) {
            return undefined;
        }
        return Math.min(hint, max + 1) - 1;
    }

    if (hint == undefined) {
        return 0;
    }
    if (hint >= max) {
        return undefined;
    }
    return hint + 1;
}

/* Biggest hint, one digit only */
function editorHintMax(cellCount) {
    return Math.min(9, cellCount);
}

function editorColHintEdit(board, x, back) {
    const colHints = board.colHints.slice();
    colHints[x] = editorHintCycle(colHints[x], editorHintMax(board.height), back);

    return editorEncode(board.width, board.height, colHints, board.rowHints,
                        board.verticalWalls, board.horizontalWalls,
                        editorRoomHintsText(board.roomHints, board.roomCount));
}

function editorRowHintEdit(board, y, back) {
    const rowHints = board.rowHints.slice();
    rowHints[y] = editorHintCycle(rowHints[y], editorHintMax(board.width), back);

    return editorEncode(board.width, board.height, board.colHints, rowHints,
                        board.verticalWalls, board.horizontalWalls,
                        editorRoomHintsText(board.roomHints, board.roomCount));
}

function editorRoomHintEdit(board, x, y, back) {
    const roomId    = board.roomId[x][y];
    const roomHints = board.roomHints.slice();
    roomHints[roomId] = editorHintCycle(roomHints[roomId], editorHintMax(board.roomSize[roomId]), back);

    return editorEncode(board.width, board.height, board.colHints, board.rowHints,
                        board.verticalWalls, board.horizontalWalls,
                        editorRoomHintsText(roomHints, board.roomCount));
}

/* First cell of each hinted room, x first like roomsInit() */
function editorRoomAnchors(board) {
    const anchors = [];
    const seen    = [];

    for (let x = 0; x < board.width; x++) {
        for (let y = 0; y < board.height; y++) {
            const roomId = board.roomId[x][y];
            if (seen[roomId]) {
                continue;
            }
            seen[roomId] = true;

            if (board.roomHints[roomId] != undefined) {
                anchors.push({x: x, y: y, hint: board.roomHints[roomId]});
            }
        }
    }

    return anchors;
}

/* Toggle wall, room hints follow their first cell to new rooms */
function editorWallEdit(board, wall) {
    const verticalWalls   = editorArrayCopy(board.verticalWalls);
    const horizontalWalls = editorArrayCopy(board.horizontalWalls);

    if (wall.vertical) {
        verticalWalls[wall.x][wall.y] = 1 - verticalWalls[wall.x][wall.y];
    } else {
        horizontalWalls[wall.x][wall.y] = 1 - horizontalWalls[wall.x][wall.y];
    }

    /* New rooms without hints */
    const newBoard = new Board();
    newBoard.init(editorEncode(board.width, board.height, board.colHints, board.rowHints,
                               verticalWalls, horizontalWalls, "-"));

    /* Move hints, merged rooms keep first hint */
    const roomHints = [];
    for (const anchor of editorRoomAnchors(board)) {
        const roomId = newBoard.roomId[anchor.x][anchor.y];
        if (roomHints[roomId] == undefined) {
            roomHints[roomId] = anchor.hint;
        }
    }

    return editorEncode(board.width, board.height, board.colHints, board.rowHints,
                        verticalWalls, horizontalWalls,
                        editorRoomHintsText(roomHints, newBoard.roomCount));
}


/*****************************************************************************
 * Test dots, kept over edits of same size
 *****************************************************************************/
/* Make test dots fit board, new size starts empty */
function editorDotsFit(board) {
    const dots = editor.dots;

    if (dots == undefined || dots.length != board.width || dots[0].length != board.height) {
        editor.dots = array2D(board.width, board.height, false);
    }
}

/* Put test dots on board */
function editorDotsPlace(board) {
    editorDotsFit(board);

    for (let y = 0; y < board.height; y++) {
        for (let x = 0; x < board.width; x++) {
            if (editor.dots[x][y]) {
                board.setItem(x, y, ITEM_DOT);
            }
        }
    }
}

/* True if some test dot is set */
function editorDotsAny() {
    if (editor.dots == undefined) {
        return false;
    }

    for (const column of editor.dots) {
        if (column.includes(true)) {
            return true;
        }
    }

    return false;
}

/* Set or clear one test dot */
function editorDotToggle(x, y) {
    const board = globals.game.board;

    editor.dots[x][y] = !editor.dots[x][y];
    if (editor.dots[x][y]) {
        board.setItem(x, y, ITEM_DOT);
    } else {
        board.setItem(x, y, ITEM_NONE);
    }

    editorRedraw();
    uiButtonsRedraw(globals.game);
}


/*****************************************************************************
 * Editor redraw
 *****************************************************************************/
/* Hint colors as in game when dots on board, room hint bigger than room red */
function editorHintsMark(board) {
    /* Test dots: game colors and grey crosses, solution keeps hints dark */
    if (editorDotsAny() && !editor.solution) {
        uiHintsUpdate(board);
    } else {
        uiHints = {rows: [], cols: [], rooms: []};
        for (let y = 0; y < board.height; y++) {
            uiHints.rows[y] = HINT_OPEN;
        }
        for (let x = 0; x < board.width; x++) {
            uiHints.cols[x] = HINT_OPEN;
        }
        for (let roomId = 0; roomId < board.roomCount; roomId++) {
            uiHints.rooms[roomId] = HINT_OPEN;
        }
    }

    /* Hint bigger than room is always red */
    for (let roomId = 0; roomId < board.roomCount; roomId++) {
        if (board.roomHints[roomId] > board.roomSize[roomId]) {
            uiHints.rooms[roomId] = HINT_OVER;
        }
    }
}

/* Faint dash in rooms without hint, top-left cell as in UI.js */
function editorRoomPlacesDraw(context, board) {
    const drawn = [];

    context.font = (0.4 * globals.cellSize) + "px Oswald, sans-serif";

    /* Row by row, so first cell is top-left of room */
    for (let y = 0; y < board.height; y++) {
        for (let x = 0; x < board.width; x++) {
            const roomId = board.roomId[x][y];
            if (drawn[roomId]) {
                continue;
            }
            drawn[roomId] = true;

            /* Room has hint, UI.js draws it */
            if (board.roomHints[roomId] != undefined) {
                continue;
            }

            context.fillText("-", globals.cellSize * (x + 0.14), globals.cellSize * (y + 0.155) + 0.23 * globals.cellSize);
        }
    }
}

/* Faint dash in empty edge and room hints, same places as UI.js hints */
function editorHintPlacesDraw(board) {
    const context    = elements.canvas.getContext("2d");
    const marginTop  = Math.round(globals.cellSize * globals.boardMargin);
    const marginLeft = Math.round(globals.cellSize * globals.boardMarginLeft);
    const fontYShift = 0.28 * globals.cellSize;

    uiHintStyleSet(context);
    context.fillStyle = HINT_DONE_COLOR;

    for (let x = 0; x < board.width; x++) {
        if (board.colHints[x] == undefined) {
            context.fillText("-", globals.cellSize * (x + 0.5), 0 - marginTop / 2 + fontYShift + 0.02 * globals.cellSize);
        }
    }

    for (let y = 0; y < board.height; y++) {
        if (board.rowHints[y] == undefined) {
            context.fillText("-", 0 - marginLeft / 2 - 0.04 * globals.cellSize, globals.cellSize * (y + 0.5) + fontYShift);
        }
    }

    editorRoomPlacesDraw(context, board);
}

/* Game board drawing, editor marks go on top */
const uiElementsRedrawGame = uiElementsRedraw;

/* Every redraw adds marks, also the one when Oswald font loads in UI.js */
uiElementsRedraw = function (board) {
    uiElementsRedrawGame(board);
    editorHintPlacesDraw(board);
    editorDifferDraw();
};

/* Draw board with editor hint colors */
function editorRedraw() {
    editorHintsMark(globals.game.board);
    uiElementsRedraw(globals.game.board);
}

/* Load challenge into board and draw it */
function editorShow(info) {
    editor.info = info;
    editor.solution = false;
    editor.differ   = [];
    options.challenges = [{info: info}]; /* One challenge, info line stays empty */

    globals.game.init(0, info);
    editorDotsPlace(globals.game.board);
    uiBoardSetup(globals.game.board);
    editorRedraw();

    editorElements.text.value = editorLink(info);
    editorElements.result.textContent = "";
    editorSizeButtonsRedraw(globals.game.board.width);
}

/* Show changed challenge, old one goes to undo history */
function editorChange(info) {
    if (info == editor.info) {
        return;
    }

    editor.history.push(editor.info);
    editorShow(info);
}


/*****************************************************************************
 * Button handlers
 *****************************************************************************/
/* New empty board */
function editorSizeSet(size) {
    editorChange(editorEmptyInfo(size, size));
}

for (const size of EDITOR_SIZES) {
    editorSizeButton(size).addEventListener("click", function () { editorSizeSet(size); });
}

/* Empty board of same size, can be undone */
function editorRestart() {
    const board = globals.game.board;
    const empty = editorEmptyInfo(board.width, board.height);

    /* Test dots go too, they are not in undo */
    editor.dots = undefined;
    if (editor.info == empty) {
        editorShow(empty);
        return;
    }
    editorChange(empty);
}

/* Back to challenge before last change */
function editorUndo() {
    if (editor.history.length == 0) {
        return;
    }

    editorShow(editor.history.pop());
}

/* Replaces UI.js version: undo needs history, restart needs non-empty board */
function uiButtonsRedraw(game) {
    const board = game.board;
    const empty = editor.info == editorEmptyInfo(board.width, board.height);

    elements.buttonUndo.disabled    = !game.undoable() || modalVisible();
    elements.buttonRestart.disabled = (empty && !editorDotsAny()) || modalVisible();
}

elements.buttonRestart.addEventListener("click", editorRestart);
elements.buttonUndo.addEventListener("click",    editorUndo);

/* Solve: count solutions and show first one */
const EDITOR_SOLVE_LIMIT = 2000000; /* Visits, about 1 s */
const EDITOR_DIFFER_RADIUS = 0.38; /* Red ring, part of cell size */

/* Result text for solver result */
function editorSolveText(result) {
    if (result.stopped) {
        return "Too slow";
    }
    if (result.count == 0) {
        return "No solution";
    }
    if (result.count == 1) {
        return "Unique";
    }
    return "2+ solutions";
}

/* Cells where two solutions differ, as [x, y] */
function editorDifferFind(solution, second) {
    const differ = [];

    for (let y = 0; y < solution[0].length; y++) {
        for (let x = 0; x < solution.length; x++) {
            if (solution[x][y] != second[x][y]) {
                differ.push([x, y]);
            }
        }
    }

    return differ;
}

/* Red ring in cells that differ, canvas keeps grid offset from UI.js */
function editorDifferDraw() {
    const context = elements.canvas.getContext("2d");

    context.beginPath();
    context.lineWidth   = DOT_RING_WIDTH * globals.cellSize;
    context.strokeStyle = HINT_OVER_COLOR;

    for (const [x, y] of editor.differ) {
        const centerX = globals.cellSize * (x + 0.5);
        const centerY = globals.cellSize * (y + 0.5);
        context.moveTo(centerX + EDITOR_DIFFER_RADIUS * globals.cellSize, centerY);
        context.arc(centerX, centerY, EDITOR_DIFFER_RADIUS * globals.cellSize, 0, 2 * Math.PI, false);
    }

    context.stroke();
}

/* Draw solution dots, next edit rebuilds board and clears them */
function editorSolutionDraw(solution) {
    const board = globals.game.board;
    editor.solution = true;

    /* Solution replaces test dots, they come back on next tap */
    for (let y = 0; y < board.height; y++) {
        for (let x = 0; x < board.width; x++) {
            if (solution[x][y]) {
                board.setItem(x, y, ITEM_DOT);
            } else {
                board.setItem(x, y, ITEM_NONE);
            }
        }
    }
    editorRedraw();
}

/* Board without solution dots, result text stays */
function editorSolutionClear() {
    const text = editorElements.result.textContent;

    editorShow(editor.info);
    editorElements.result.textContent = text;
}

function editorSolveRun() {
    const result = solverRun(globals.game.board, EDITOR_SOLVE_LIMIT);

    if (result.second != undefined) {
        editor.differ = editorDifferFind(result.solution, result.second);
    }
    if (result.solution != undefined) {
        editorSolutionDraw(result.solution);
    }
    editorElements.result.textContent = editorSolveText(result);
    editorElements.check.disabled = false;
}

/* Show text first, solver runs after browser has drawn it */
function editorSolve() {
    editorElements.result.textContent = "Solving...";
    editorElements.check.disabled = true;
    setTimeout(editorSolveRun, 30);
}

editorElements.check.addEventListener("click", editorSolve);

/* Open challenge in game next to editor, new tab */
function editorPlay() {
    window.open(editorPlayLink(editor.info), "_blank");
}

editorElements.play.addEventListener("click", editorPlay);


/*****************************************************************************
 * Challenge box handlers
 *****************************************************************************/
/* Select whole link, so copy takes all of it */
function editorTextFocus() {
    setTimeout(function () { editorElements.text.select(); }, 0); /* After click sets cursor */
}

/* Load pasted or typed challenge when it is valid */
function editorTextInput(event) {
    const text = editorElements.text;
    const info = editorInfoFromText(text.value);

    if (!editorInfoValid(info)) {
        editorElements.result.textContent = "Not a valid challenge";
        return;
    }
    if (info == editor.info) {
        editorElements.result.textContent = "";
        return;
    }

    /* Board redraw writes link to box, typing keeps own text and cursor */
    const typed = text.value;
    const start = text.selectionStart;
    const end   = text.selectionEnd;

    editorChange(info);
    editorElements.result.textContent = "";

    if (event.inputType == "insertFromPaste") {
        editorTextFocus(); /* Keep link selected for next paste */
        return;
    }
    text.value = typed;
    text.setSelectionRange(start, end);
}

/* Leaving box shows current board link again */
function editorTextBlur() {
    editorElements.text.value = editorLink(editor.info);
    editorElements.result.textContent = "";
}

editorElements.text.addEventListener("focus", editorTextFocus);
editorElements.text.addEventListener("input", editorTextInput);
editorElements.text.addEventListener("blur",  editorTextBlur);


/*****************************************************************************
 * Board input
 *****************************************************************************/
const EDITOR_EDGE_ZONE  = 0.2; /* Tap this near line sets wall, in cells */
const EDITOR_LONG_PRESS = 500; /* ms, long press goes back */

const EDITOR_CORNER_ZONE = 0.35; /* Room number corner, in cells */

let editorPressTarget = undefined;
let editorPressTimer  = undefined;

/* True if cell is room's first cell row by row, where number is drawn */
function editorRoomFirstCell(board, x, y) {
    const roomId = board.roomId[x][y];

    for (let cellY = 0; cellY < board.height; cellY++) {
        for (let cellX = 0; cellX < board.width; cellX++) {
            if (board.roomId[cellX][cellY] == roomId) {
                return cellX == x && cellY == y;
            }
        }
    }

    return false;
}

/* What is under pointer: col, row, room corner, wall or dot cell, undefined if nothing */
function editorTargetGet(event) {
    const board = globals.game.board;
    const rect  = elements.grid.getBoundingClientRect();
    const X = (event.clientX - rect.left) / globals.cellSize;
    const Y = (event.clientY - rect.top)  / globals.cellSize;

    /* Hint margins */
    if (Y < 0) {
        if (X >= 0 && X < board.width) {
            return {type: "col", x: Math.floor(X)};
        }
        return undefined;
    }
    if (X < 0) {
        if (Y < board.height) {
            return {type: "row", y: Math.floor(Y)};
        }
        return undefined;
    }
    if (X >= board.width || Y >= board.height) {
        return undefined;
    }

    /* Number corner of room wins over walls next to it */
    const cellX = Math.floor(X);
    const cellY = Math.floor(Y);
    if (X - cellX < EDITOR_CORNER_ZONE && Y - cellY < EDITOR_CORNER_ZONE &&
        editorRoomFirstCell(board, cellX, cellY)) {
        return {type: "room", x: cellX, y: cellY};
    }

    /* Nearest inner lines */
    const lineX = Math.round(X);
    const lineY = Math.round(Y);
    let distanceX = Math.abs(X - lineX);
    let distanceY = Math.abs(Y - lineY);
    if (lineX < 1 || lineX > board.width - 1) {
        distanceX = 1;
    }
    if (lineY < 1 || lineY > board.height - 1) {
        distanceY = 1;
    }

    /* Near line is wall, nearer one wins in corner */
    if (distanceX < EDITOR_EDGE_ZONE && distanceX <= distanceY) {
        return {type: "wall", vertical: true, x: lineX, y: Math.floor(Y)};
    }
    if (distanceY < EDITOR_EDGE_ZONE) {
        return {type: "wall", vertical: false, x: Math.floor(X), y: lineY};
    }

    return {type: "dot", x: cellX, y: cellY};
}

/* Make edit for target, back cycles hint other way */
function editorTargetEdit(target, back) {
    const board = globals.game.board;

    switch (target.type) {
        case "col":
            editorChange(editorColHintEdit(board, target.x, back));
            break;
        case "row":
            editorChange(editorRowHintEdit(board, target.y, back));
            break;
        case "wall":
            editorChange(editorWallEdit(board, target));
            break;
        case "room":
            editorChange(editorRoomHintEdit(board, target.x, target.y, back));
            break;
        case "dot":
            editorDotToggle(target.x, target.y); /* Same both ways */
            break;
    }
}

function editorPressCancel() {
    clearTimeout(editorPressTimer);
    editorPressTimer  = undefined;
    editorPressTarget = undefined;
}

/* Right button goes back now, other press waits for release or long press */
function editorPointerDown(event) {
    const target = editorTargetGet(event);
    editorPressCancel();
    if (target == undefined || modalVisible()) {
        return;
    }

    /* First tap on board after Solve only clears solution dots */
    if (editor.solution) {
        editorSolutionClear();
        return;
    }

    if (event.button == 2) {
        editorTargetEdit(target, true);
        return;
    }

    editorPressTarget = target;
    editorPressTimer  = setTimeout(function () {
        const longTarget = editorPressTarget;
        editorPressCancel();
        editorTargetEdit(longTarget, true);
    }, EDITOR_LONG_PRESS);
}

/* Short press goes forward */
function editorPointerUp(event) {
    if (editorPressTarget == undefined) {
        return;
    }

    const target = editorPressTarget;
    editorPressCancel();
    editorTargetEdit(target, false);
}

/* No menu on right click or long press */
function editorContextMenu(event) {
    event.preventDefault();
}

elements.board.addEventListener("pointerdown",   editorPointerDown);
elements.board.addEventListener("pointerup",     editorPointerUp);
elements.board.addEventListener("pointercancel", editorPressCancel);
elements.board.addEventListener("pointerleave",  editorPressCancel);
elements.board.addEventListener("contextmenu",   editorContextMenu);

/* UI_window.js resize sets game hint colors, put editor colors back */
window.addEventListener("resize", editorRedraw);


/*****************************************************************************
 * Editor initialization
 *****************************************************************************/
/* Load ?c= or ?challenge= from address, empty 6x6 if missing or bad */
function editorStart() {
    const info = editorInfoFromText(location.search);

    if (editorInfoValid(info)) {
        editorShow(info);
        return;
    }

    editorShow(editorEmptyInfo(6, 6));
    if (location.search.match(/[?&](?:c|challenge)=/) != null) {
        editorElements.result.textContent = "Not a valid challenge";
    }
}

window.onload = function () {
    globals.game = new EditorGame();

    /* Start with ?c= challenge, else empty 6x6 board */
    editorStart();

    /* Show window */
    elements.screen.style.visibility = "visible";
}
