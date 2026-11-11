
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

/* Controls help, action and result */
const ABOUT_HELP = [
    ["Click",                  "Set dot or clear"],
    ["Double click",           "Set block"],
    ["Long press",             "Set block"],
    ["Drag",                   "Set or clear cells"],
    ["Click edge",             "Set dots to\nempty places"]
];

/* Build help grid, dashes line up in middle column */
function uiAboutHelp() {
    const help = document.createElement("div");
    help.className = "modal-help";

    for (const [action, result] of ABOUT_HELP) {
        for (const part of [action, "–", result]) {
            const cell = document.createElement("span");
            cell.textContent = part;
            help.appendChild(cell);
        }
    }
    return help;
}

/* ABOUT, show in modal, tap anywhere closes */
function uiAbout(event) {
    const text = "No ads, no tracking. Progress is saved only on this device.\n" +
                 "\n" +
                 "©\u00A0vesa.timonen[at]kolumbus.fi";
    modalShow("DOTTIUM", text, false);
    elements.modalText.prepend(uiAboutHelp()); /* modalShow clears it next time */
}

elements.buttonAbout.addEventListener("click", uiAbout);
