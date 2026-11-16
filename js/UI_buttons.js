
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

/* < and > around level, go to level before or after */
function uiLevelStep(event) {
    const arrow = event.target.closest(".level-arrow");

    /* Only main button, touch has 0 too */
    if (event.button != 0) {
        return false;
    }

    if (arrow == null || arrow.classList.contains("level-arrow-off") || uiInputBlocked()) {
        return false;
    }

    event.preventDefault(); /* No text select or zoom */
    /* Peek, save stays until first move, back to saved level replays it */
    gameStart(globals.game.level + Number(arrow.dataset.step), true);
    gameRestore();
    return false;
}

/* LEVEL ARROWS, on press, iPad drops click of fast second tap */
elements.info.addEventListener("pointerdown", uiLevelStep);

/* Controls help, action and result */
const ABOUT_HELP = [
    ["Click",                  "Set dot or clear"],
    ["Double click",           "Set cross"],
    ["Long press",             "Set cross"],
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

/* Main page, shared link has no level or day */
const SHARE_URL = "https://dottium.app/";

/* Advent share text, invite to daily puzzle */
function uiShareAdventText(solved, count) {
    const name = "Dottium Advent " + options.adventYear;

    if (solved == 0) {
        return "Join me in " + name + "! 🎄\n";
    }
    if (solved == count) {
        return name + " 🎄\nAll " + count + " days solved! 🎉\nJoin the daily puzzle!\n";
    }
    return name + " 🎄\n" + solved + "/" + count + " days solved. Join the daily puzzle!\n";
}

/* Normal share text, solved level count */
function uiShareLevelText(solved, count) {
    if (solved == 0) {
        return "Join me in Dottium!\n";
    }
    if (solved == count) {
        return "Dottium\nAll " + count + " levels solved! 🎉\n";
    }
    return "Dottium\n" + solved + "/" + count + " solved\n";
}

/* Share text, progress and link */
function uiShareText() {
    const count  = options.challenges.length;
    const solved = Math.min(options.reached, playableCount()); /* Not past open days */

    if (options.adventYear != undefined) {
        return uiShareAdventText(solved, count) + SHARE_URL + "?s=advent-" + options.adventYear;
    }
    return uiShareLevelText(solved, count) + SHARE_URL;
}

/* Copy text, modal shows what was copied */
function uiShareCopy(text) {
    if (navigator.clipboard == undefined) {
        modalShow("SHARE", text, false);
        return;
    }
    navigator.clipboard.writeText(text).then(
        function () { modalShow("COPIED", text, false); },
        function () { modalShow("SHARE", text, false); });
}

/* SHARE, phone share sheet, else copy */
function uiShare(event) {
    const text = uiShareText();

    if (navigator.share == undefined) {
        uiShareCopy(text);
        return;
    }
    navigator.share({text: text}).catch(function (error) {
        /* Cancel is fine, other errors copy */
        if (error.name != "AbortError") {
            uiShareCopy(text);
        }
    });
}

elements.buttonShare.addEventListener("click", uiShare);
