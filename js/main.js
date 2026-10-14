
/*****************************************************************************
 * Game levels
 *****************************************************************************/
const defaultChallengeSet = [
    {info: "INFO: [R3-6|09 H6|06810 C26.7 U2.2] [O15 I03 N1.38 T000001 B01|2 D2.8|3|333333333333333333333333333333331112] >6x6.25-213.12-242.0ca2e84ce53c1bc211.532-1--2-"},
    {info: "INFO: [R3-6|08 H7|05710 C26.6 U7.6] [O21 I02 N1.53 T000001 B01|2 D2.4|4|444444444444444441111111111111111211] >6x6.-4--35.4-4445.2c4c314b8db4099290.1311--3-"},
    {info: "INFO: [R3-6|09 H7|03920 C25.7 U7.7] [O19 I04 N1.45 T000065 B02|3 D3.7|9|333333333333399229119911119444444411] >6x6.-34443.244-4-.488e6049c369072938.-22--215-"},
];

const debugChallengeSet = [
    {info: "INFO: [R3-6|09 H6|06810 C26.7 U2.2] [O15 I03 N1.38 T000001 B01|2 D2.8|3|333333333333333333333333333333331112] >6x6.25-213.12-242.0ca2e84ce53c1bc211.532-1--2-"},
    {info: "INFO: [R3-6|08 H7|05710 C26.6 U7.6] [O21 I02 N1.53 T000001 B01|2 D2.4|4|444444444444444441111111111111111211] >6x6.-4--35.4-4445.2c4c314b8db4099290.1311--3-"},
];


/*****************************************************************************
 * Parse URL options
 *****************************************************************************/
function parseOptions() {
    /* Replace special characters in url */
    let newUrl = window.location.href;
    newUrl = newUrl.replace("%3E", '>'); /* Replace "%3E" -> '>' */

    /* Create URL */
    const url = new URL(newUrl);

    /* Set option, before level so storage key is right */
    const setOption = url.searchParams.get("set");
    if (setOption == "debug") {
        options.challenges = debugChallengeSet;
        globals.storage    = globals.storage + "-debug";
    }

    /* Level option */
    const levelOption = url.searchParams.get("level");
    if (levelOption == null) {
        /* Read from storage */
        try {
            const saved = JSON.parse(localStorage.getItem(globals.storage));

            if (typeof saved == "number") {
                options.level = saved; /* Old save, level only */
            } else if (saved != null) {
                options.level = saved.level;
                options.saved = saved;
            }
        } catch (error) {
            options.level = 0; /* Bad or blocked storage */
        }
    } else {
        options.level = Number(levelOption - 1);
    }

    /* Challenge option */
    const challengeOption = url.searchParams.getAll("challenge");
    if (challengeOption.length > 0) {
        options.challenges = [];
        for (let index = 0; index < challengeOption.length; index++) {
            /* Convert URL special characters */
            challengeOption[index] = challengeOption[index].replace("%3E",'>');

            /* Insert it to manual challenges table */
            options.challenges.push({info: challengeOption[index]});
        }

        /* Set manual challenges to be played */
        globals.storage = globals.storage + "-manual";
        options.level   = 0;
    }

    const languageOption = url.searchParams.get("language");
    if (languageOption != null) {
        switch (languageOption) {
            case "FIN":
                options.language = languageOption;
                elements.instructions.innerHTML = "Aseta ruudukkoon täpliä niin, että jokaisen rivin, sarakkeen ja alueen täplien määrä vastaa sille annettua lukua. Jos lukua ei ole, täpliä voi olla kuinka monta tahansa tai ei yhtään.";
                break;
        }
    }
}


/*****************************************************************************
 * Modal window handling (Game over)
 *****************************************************************************/
function modalClick(event) {
    event.preventDefault();
    event.stopPropagation(); /* Keep click off the board */

    elements.gameOver.style.visibility = "hidden";
    elements.board.style.visibility     = "visible";

    gameStart(globals.game.level);
}

elements.gameOver.addEventListener("click",      modalClick);


/*****************************************************************************
 * Game save and restore
 *****************************************************************************/
/* Save level, challenge and move history */
function gameSave() {
    const game = globals.game;
    const saved = {
        level:     game.level,
        challenge: options.challenges[game.level].info,
        moves:     game.moves
    };

    try {
        localStorage.setItem(globals.storage, JSON.stringify(saved));
    } catch (error) {
        /* Storage blocked, skip save */
    }
}

/* Replay saved moves if save is for this challenge */
function gameRestore() {
    const game  = globals.game;
    const saved = options.saved;

    /* No save, or save for other challenge */
    if (saved == undefined ||
        saved.level != game.level ||
        saved.challenge != options.challenges[game.level].info ||
        !Array.isArray(saved.moves)) {
        return;
    }

    /* Replay in order, rebuilds board, counts and undo history */
    for (let index = 0; index < saved.moves.length; index++) {
        const move = saved.moves[index];

        /* Skip broken move, getItem needs whole numbers */
        if (move == null || !Number.isInteger(move.x) || !Number.isInteger(move.y)) {
            continue;
        }

        game.paintMove(move.x, move.y, move.newItem);
    }

    uiRedraw();
}


/*****************************************************************************
 * Game initialization
 *****************************************************************************/
function gameStart(level) {
    /* Check level value */
    if (level == undefined || isNaN(level) || level < 0) {
        level = 0;
    }
    if (level >= options.challenges.length) {
        level = options.challenges.length - 1;
    }

    /* Initialize game */
    globals.game.init(level, options.challenges[level].info);

    /* Save game point */
    gameSave();

    /* Debug text */
    if (options.challenges == debugChallengeSet) {
//        elements.debug.innerHTML = options.challenges[level].info.split(/[>$#]/)[0];
    }

    /* Setup board */
    uiBoardSetup(globals.game.board);
}



window.onload = function () {
    options.challenges = defaultChallengeSet;
    globals.storage = "dottium/game-level";

    /* Parse options */
    parseOptions();

    /* Start game */
    globals.game = new Game();
    gameStart(options.level);

    /* Put back saved board */
    gameRestore();

    /* Show window */
    elements.screen.style.visibility = "visible";
}



