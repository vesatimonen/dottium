/*****************************************************************************
 * Editor elements
 *****************************************************************************/
const editorElements = {
    check:  document.getElementById("editor-check"),
    play:   document.getElementById("editor-play"),
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

/* Same check as challengeValid() in main.js, which editor does not load */
function editorInfoValid(info) {
    const match = info.match(/^([0-9]+)x([0-9]+)\.([0-9-]+)\.([0-9-]+)\.([0-9a-fA-F]+)\.([0-9-]*)$/);
    if (match == null) {
        return false;
    }

    const width  = Number(match[1]);
    const height = Number(match[2]);
    if (width < 1 || height < 1 || width > globals.boardMaxSize || height > globals.boardMaxSize) {
        return false;
    }

    return match[3].length == width &&
           match[4].length == height &&
           match[5].length == Math.ceil(width * height / 2);
}

/* Challenge from link or bare string, c= part if there is one */
function editorInfoFromText(text) {
    const match = text.trim().match(/[?&]c=([^&#]*)/);
    if (match == null) {
        return text.trim();
    }

    return decodeURIComponent(match[1]);
}

/* Board sizes with own button, id editor-size-N */
const EDITOR_SIZES = [4, 5, 6, 7, 8];

function editorSizeButton(size) {
    return document.getElementById("editor-size-" + size);
}

/* Mark button of current size */
function editorSizeButtonsRedraw(size) {
    for (const buttonSize of EDITOR_SIZES) {
        editorSizeButton(buttonSize).classList.toggle("selected", buttonSize == size);
    }
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

for (const size of EDITOR_SIZES) {
    editorSizeButton(size).addEventListener("click", function () { editorSizeSet(size); });
}

/* Not done yet, see plan #4 and #5 */
editorElements.check.disabled = true;
editorElements.play.disabled  = true;


/*****************************************************************************
 * Challenge box handlers
 *****************************************************************************/
/* Select whole link, so copy takes all of it */
function editorTextFocus() {
    setTimeout(function () { editorElements.text.select(); }, 0); /* After click sets cursor */
}

/* Load pasted or typed challenge when it is valid */
function editorTextInput() {
    const info = editorInfoFromText(editorElements.text.value);

    if (!editorInfoValid(info)) {
        editorElements.result.textContent = "Not a valid challenge";
        return;
    }
    if (info == editor.info) {
        editorElements.result.textContent = "";
        return;
    }

    editor.history.push(editor.info);
    editorShow(info);
    editorElements.result.textContent = "";
    editorTextFocus(); /* Keep link selected for next paste */
}

/* Leaving box shows current board link again */
function editorTextBlur() {
    editorElements.text.value = editorLink(editor.info);
    editorElements.result.textContent = "";
}

editorElements.text.addEventListener("focus", editorTextFocus);
editorElements.text.addEventListener("input", editorTextInput);
editorElements.text.addEventListener("blur",  editorTextBlur);


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
