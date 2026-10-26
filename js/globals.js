/*****************************************************************************
 * Global variables
 *****************************************************************************/
const globals = {
    game:             undefined,
    boardMaxSize:     8,
    boardMargin:      1,    /* Top hint margin, in cells */
    boardMarginLeft:  0.55,  /* Left margin with row hints, in cells */
    boardMarginRight: 0.1,  /* Right margin, in cells */
    cellSize:         undefined,
    frameWidth:       undefined, /* Grid frame line, whole device pixels */
    animating:        false,
};

/*****************************************************************************
 * URL options
 *****************************************************************************/
const options = {
    challenges: [],
    level:      0,
    language:   "ENG",
    gameOverText: "Game over!", /* Changed by language */
    saved:      undefined /* Saved game from storage */
};

/*****************************************************************************
 * UI elements
 *****************************************************************************/
const elements = {
    screen:         document.getElementById("game-screen"),
    board:          document.getElementById("game-board"),
    canvas:         document.getElementById('game-canvas'),
    grid:           document.getElementById("game-grid"),

    instructions:   document.getElementById("game-instructions"),

    buttonRestart:  document.getElementById("button-restart"),
    buttonUndo:     document.getElementById("button-undo"),
    buttonAbout:    document.getElementById("button-about"),
    info:           document.getElementById("game-info"),

    modal:          document.getElementById("game-modal"),
    modalTitle:     document.getElementById("modal-title"),
    modalText:      document.getElementById("modal-text"),

    debug:          document.getElementById("debug-text")
};


