
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
    /* Get clock position */
    move = uiMovePosition(event);
    X = move.X;
    Y = move.Y;

    /* Closest wall */
    Xwall = Math.round(X);
    Ywall = Math.round(Y);

    /* Current cell */
    Xcell = Math.floor(X);
    Ycell = Math.floor(Y);

    /* Check limits */
    if (Ycell < 0 || Ycell >= globals.game.board.height ||
        Xcell < 0 || Xcell >= globals.game.board.width) {
        return false;
    }

    /* Direction from wall */
    Xdelta = Math.abs(X - Xwall);
    Ydelta = Math.abs(Y - Ywall);
    if (Xdelta < Ydelta) {
        if (Ydelta - Xdelta > 0.0) {
            /* Vertical wall */
            if (Xwall > 0 && Xwall < globals.game.board.width) {
                globals.game.makeMove("vertical", Xwall, Ycell);
                uiRedraw();
            }
        }
    } else {
        if (Xdelta - Ydelta > 0.0) {
            /* Horizontal wall */
            if (Ywall > 0 && Ywall < globals.game.board.height) {
                globals.game.makeMove("horizontal", Xcell, Ywall);
                uiRedraw();
            }
        }
    }
}

elements.board.addEventListener("click", uiClick, {passive: true});




