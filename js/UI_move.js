
/*****************************************************************************
 * Move helpers
 *****************************************************************************/
function uiMovePosition(event) {
    let X, Y;

    switch (event.type) {
        case "click":
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
function uiClick(event) {
    /* Ignore clicks during solve animation */
    if (globals.animating) {
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

    globals.game.makeMove(Xcell, Ycell);
    uiRedraw();
}

elements.board.addEventListener("click", uiClick, {passive: true});




