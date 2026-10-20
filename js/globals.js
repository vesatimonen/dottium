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
    animating:        false,
};

/*****************************************************************************
 * URL options
 *****************************************************************************/
const options = {
    challenges: [],
    level:      0,
    language:   "ENG",
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

    gameOver:       document.getElementById("game-over-modal"),

    debug:          document.getElementById("debug-text")
};


