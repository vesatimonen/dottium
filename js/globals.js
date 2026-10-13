/*****************************************************************************
 * Global variables
 *****************************************************************************/
const globals = {
    game:         undefined,
    boardMaxSize: 9,
    cellSize:     undefined,
    animating:    false,
};

/*****************************************************************************
 * URL options
 *****************************************************************************/
const options = {
    challenges: [],
    level:      0,
    language:   "ENG"
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


