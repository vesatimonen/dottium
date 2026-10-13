
/*****************************************************************************
 * Move helpers
 *****************************************************************************/
function uiMovePosition(event) {
    let X, Y;

    switch (event.type) {
        case "pointerdown":
        case "pointermove":
            X = event.clientX;
            Y = event.clientY;
            break;
        default:
            return undefined;
    }

    let rect = elements.grid.getBoundingClientRect();
    X -= rect.left;
    Y -= rect.top;
    X = X / globals.cellSize;
    Y = Y / globals.cellSize;

    return {X, Y};
}


/*****************************************************************************
 * Event handlers
 *****************************************************************************/
/* Item being painted, undefined when not painting */
let paintItem = undefined;

function uiPointerDown(event) {
    /* Ignore clicks during solve animation */
    if (globals.animating) {
        return false;
    }

    /* Only main button, and not the game over modal */
    if (event.button != 0 || event.target == elements.gameOver) {
        return false;
    }

    /* Get click position */
    const move = uiMovePosition(event);
    const board = globals.game.board;

    /* Closest cell center */
    let Xcell = Math.floor(move.X);
    let Ycell = Math.floor(move.Y);

    /* Clamp to board, border clicks go to edge cell */
    if (Xcell < 0) {
        Xcell = 0;
    }
    if (Xcell > board.width - 1) {
        Xcell = board.width - 1;
    }
    if (Ycell < 0) {
        Ycell = 0;
    }
    if (Ycell > board.height - 1) {
        Ycell = board.height - 1;
    }

    /* Toggle cell, new item is used for painting */
    paintItem = globals.game.makeMove(Xcell, Ycell);

    /* Keep getting moves outside board until release */
    elements.board.setPointerCapture(event.pointerId);

    uiRedraw();
}

function uiPointerMove(event) {
    /* Not painting or solve animation running */
    if (paintItem == undefined || globals.animating) {
        return false;
    }

    /* Get cell under pointer */
    const move = uiMovePosition(event);
    const Xcell = Math.floor(move.X);
    const Ycell = Math.floor(move.Y);

    /* Paint only changed cells, off board is skipped */
    const oldItem = globals.game.board.getItem(Xcell, Ycell);
    if (oldItem == undefined || oldItem == paintItem) {
        return false;
    }

    globals.game.paintMove(Xcell, Ycell, paintItem);
    uiRedraw();
}

function uiPointerUp(event) {
    /* Stop painting */
    paintItem = undefined;
}

elements.board.addEventListener("pointerdown",   uiPointerDown);
elements.board.addEventListener("pointermove",   uiPointerMove);
elements.board.addEventListener("pointerup",     uiPointerUp);
elements.board.addEventListener("pointercancel", uiPointerUp);




