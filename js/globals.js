/*****************************************************************************
 * Global variables
 *****************************************************************************/
const globals = {
    game:             undefined,
    boardMaxSize:     8,
    boardMargin:      1,         /* Top hint margin, in cells */
    boardMarginLeft:  0.55,      /* Left margin with row hints, in cells */
    boardMarginRight: 0.1,       /* Right margin, in cells */
    cellSize:         undefined,
    frameWidth:       undefined, /* Wall line, whole device pixels */
    borderWidth:      undefined, /* Grid border line, thicker than walls */
    animating:        false,
};

/*****************************************************************************
 * URL options
 *****************************************************************************/
const options = {
    challenges:    [],
    level:         0,
    debug:         false,                                              /* Debug set from ?s=debug */
    manual:        false,                                              /* Manual challenges from ?c= */
    language:      "ENG",
    gameOverText:  "🏆 All solved! 🏆",                                /* Changed by language */
    gameOverLine:  "You solved all {count} puzzles.",                  /* Under game over, {count} = levels */
    solvedText:    "⭐ Solved! ⭐",                                    /* Manual puzzle, game over text */
    waitText:      "A new challenge opens\non the {day} of December!", /* Advent, {day} = next open day */
    christmasText: "🎄 Merry Christmas! 🎄",                           /* Advent, game over text */
    christmasLine: "All {count} days solved.",                         /* Advent, under game over */
    playable:      undefined,                                          /* Open challenge count, undefined = all */
    adventYear:    undefined,                                          /* Advent set year, undefined = not advent */
    reached:       0,                                                  /* Furthest level > may go to, solved + 1 */
    testDay:       undefined,                                          /* Advent test day from ?day=N */
    saved:         undefined                                           /* Saved game from storage */
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
    buttonShare:    document.getElementById("button-share"),
    info:           document.getElementById("game-info"),

    modal:          document.getElementById("game-modal"),
    modalTitle:     document.getElementById("modal-title"),
    modalText:      document.getElementById("modal-text"),

    debug:          document.getElementById("debug-text")
};


