/*****************************************************************************
 * Global variables
 *****************************************************************************/
var globals = {
    game:         undefined,
    boardMaxSize: 9,
    cellSize:     undefined,
};

/*****************************************************************************
 * URL options
 *****************************************************************************/
var options = {
    challenges: [],
    level:      0
};

/*****************************************************************************
 * UI elements
 *****************************************************************************/
const elements = {
    screen:         document.getElementById("game-screen"),
    board:          document.getElementById("game-board"),
    grid:           document.getElementById("game-grid"),

    canvas:         document.getElementById('game-canvas'),
    gameOver:       document.getElementById("game-over-modal"),
    buttonRestart:  document.getElementById("button-restart"),
    buttonUndo:     document.getElementById("button-undo"),

    debug:          document.getElementById("debug-text")
};


