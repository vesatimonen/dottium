/*****************************************************************************
 * Editor elements
 *****************************************************************************/
const editorElements = {
    size4:  document.getElementById("editor-size-4"),
    size6:  document.getElementById("editor-size-6"),
    size8:  document.getElementById("editor-size-8"),
    check:  document.getElementById("editor-check"),
    play:   document.getElementById("editor-play"),
    copy:   document.getElementById("editor-copy"),
    load:   document.getElementById("editor-load"),
    result: document.getElementById("editor-result"),
    text:   document.getElementById("editor-text")
};


/*****************************************************************************
 * Editor state
 *****************************************************************************/
const editor = {
    info:    undefined, /* Current challenge string */
    history: []         /* Earlier challenge strings for undo */
};


/*****************************************************************************
 * Stubs for main.js functions that UI.js uses
 *****************************************************************************/
/* Editor has no modal */
function modalVisible() {
    return false;
}


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
function editorEmptyInfo(size) {
    const hints = "-".repeat(size);
    const walls = "0".repeat(Math.ceil(size * size / 2));

    return size + "x" + size + "." + hints + "." + hints + "." + walls + ".-";
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

/* Challenge from link or bare string, c= part if there is one */
function editorInfoFromText(text) {
    const match = text.trim().match(/[?&]c=([^&#]*)/);
    if (match == null) {
        return text.trim();
    }

    return decodeURIComponent(match[1]);
}

/* Mark button of current size */
function editorSizeButtonsRedraw(size) {
    editorElements.size4.classList.toggle("selected", size == 4);
    editorElements.size6.classList.toggle("selected", size == 6);
    editorElements.size8.classList.toggle("selected", size == 8);
}


/*****************************************************************************
 * Editor redraw
 *****************************************************************************/
/* Load challenge into board and draw it */
function editorShow(info) {
    editor.info = info;
    options.challenges = [{info: info}]; /* One challenge, info line stays empty */

    globals.game.init(0, info);
    uiBoardSetup(globals.game.board);

    editorElements.text.value = editorLink(info);
    editorSizeButtonsRedraw(globals.game.board.width);
}


/*****************************************************************************
 * Button handlers
 *****************************************************************************/
/* New empty board, old one goes to undo history */
function editorSizeSet(size) {
    editor.history.push(editor.info);
    editorShow(editorEmptyInfo(size));
}

editorElements.size4.addEventListener("click", function () { editorSizeSet(4); });
editorElements.size6.addEventListener("click", function () { editorSizeSet(6); });
editorElements.size8.addEventListener("click", function () { editorSizeSet(8); });

/* Not done yet, see plan #3 - #6 */
editorElements.check.disabled = true;
editorElements.play.disabled  = true;
editorElements.copy.disabled  = true;
editorElements.load.disabled  = true;


/*****************************************************************************
 * Editor initialization
 *****************************************************************************/
window.onload = function () {
    globals.game = new EditorGame();

    /* Start with empty 6x6 board */
    editorShow(editorEmptyInfo(6));

    /* Show window */
    elements.screen.style.visibility = "visible";
}
