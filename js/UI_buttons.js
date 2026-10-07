
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

var restartTimer;
function uiMouseUp(event) {
    clearInterval(restartTimer);
    return false;
}

function uiMouseDown(event) {
    /* Ignore during solve animation */
    if (globals.animating) {
        return false;
    }

    /* Stop any old timer first */
    clearInterval(restartTimer);

    restartTimer = setInterval(
                        function() {
                            if (globals.game.level == 0) {
                                clearInterval(restartTimer);
                            } else {
                                gameStart(globals.game.level - 1);
                            }
                        },
                        500);
    return false;
}



/*****************************************************************************
 * Register button event handlers
 *****************************************************************************/
/* UNDO */
elements.buttonUndo.addEventListener("click", uiUndo);

/* RESTART */
elements.buttonRestart.addEventListener("click",      uiRestart);
elements.buttonRestart.addEventListener("mouseup",    uiMouseUp);
elements.buttonRestart.addEventListener("mouseleave", uiMouseUp);
elements.buttonRestart.addEventListener("mousedown",  uiMouseDown);
elements.buttonRestart.addEventListener("touchend",   uiMouseUp);
elements.buttonRestart.addEventListener("touchstart", uiMouseDown, {passive: true});
