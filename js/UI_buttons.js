
/*****************************************************************************
 * Button handlers
 *****************************************************************************/
function uiUndo(event) {
    /* Ignore during solve animation */
    if (globals.animating) {
        return false;
    }

    /* Make undo if possible */
    globals.game.undoMove()

    /* Refresh board */
    uiRedraw();
}

function uiRestart(event) {
    /* Ignore during solve animation */
    if (globals.animating) {
        return false;
    }

    /* Undo all moves back */
    while (globals.game.undoMove()) {
    }

    /* Redraw UI */
    uiRedraw();

    return false;
}

/*****************************************************************************
 * Register button event handlers
 *****************************************************************************/
/* UNDO */
elements.buttonUndo.addEventListener("click", uiUndo);

/* RESTART */
elements.buttonRestart.addEventListener("click", uiRestart);
