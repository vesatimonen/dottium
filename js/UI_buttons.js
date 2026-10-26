
/*****************************************************************************
 * Button handlers
 *****************************************************************************/
function uiUndo(event) {
    /* Ignore during solve animation or game over */
    if (uiInputBlocked()) {
        return false;
    }

    /* Make undo if possible */
    globals.game.undoMove();

    /* Refresh board */
    uiRedraw();
}

function uiRestart(event) {
    /* Ignore during solve animation or game over */
    if (uiInputBlocked()) {
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

/* ABOUT, show in modal, tap anywhere closes */
function uiAbout(event) {
    modalShow("DOTTIUM", "© Vesa Timonen", false);
}

elements.buttonAbout.addEventListener("click", uiAbout);
