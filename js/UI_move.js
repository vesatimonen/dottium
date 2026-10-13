
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

    /* Get clock position */
    let move = uiMovePosition(event);
    let X = move.X;
    let Y = move.Y;

    /* Closest wall */
    let Xwall = Math.round(X);
    let Ywall = Math.round(Y);

    /* Current cell */
    let Xcell = Math.floor(X);
    let Ycell = Math.floor(Y);

    /* Check limits */
    if (Ycell < 0 || Ycell >= globals.game.board.height ||
        Xcell < 0 || Xcell >= globals.game.board.width) {
        return false;
    }

    /* Direction from wall */
    let Xdelta = Math.abs(X - Xwall);
    let Ydelta = Math.abs(Y - Ywall);
    if (Xdelta < Ydelta) {
        /* Vertical wall */
        if (Xwall > 0 && Xwall < globals.game.board.width) {
            globals.game.makeMove("vertical", Xwall, Ycell);
            uiRedraw();
        }
    } else if (Ydelta < Xdelta) {
        /* Horizontal wall, exact tie is skipped */
        if (Ywall > 0 && Ywall < globals.game.board.height) {
            globals.game.makeMove("horizontal", Xcell, Ywall);
            uiRedraw();
        }
    }
}

elements.board.addEventListener("click", uiClick, {passive: true});




