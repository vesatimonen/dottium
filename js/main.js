
/*****************************************************************************
 * Game levels
 *****************************************************************************/
const defaultChallengeSet = [
    {info: "INFO: [R0-0|00 H2|23200 C16.0 U-00.8] [O09 I01 N1.50 T000001 D1.0|1|1111111111111111] >4x4.1242.3411.00000000.-"},
    {info: "INFO: [R0-0|00 H2|14200 C16.0 U+01.2] [O09 I02 N1.67 T000001 D1.0|1|1111111111111111] >4x4.3312.-324.00000000.-"},
    {info: "INFO: [R3-5|04 H4|15200 C06.9 U-00.5] [O10 I02 N1.58 T000001 D1.5|2|2221111211112222] >4x4.3-3-.2--3.26a06b18.3214"},
    {info: "INFO: [R3-4|02 H2|15300 C11.6 U-01.2] [O09 I03 N1.57 T000001 D1.3|2|2221111111221111] >4x4.3-23.1332.22b86e00.3-2"},

    {info: "INFO: [R3-3|02 H3|04400 C13.2 U+03.5] [O07 I02 N1.40 T000001 D1.2|3|3111111221111111] >4x4.122-.232-.24190208.-11"},
    {info: "INFO: [R3-5|03 H3|24300 C06.0 U-04.2] [O11 I03 N1.78 T000001 D1.6|3|2222222213111111] >4x4.-332.223-.4cc84b11.-351"},
    {info: "INFO: [R4-4|01 H4|05100 C14.6 U+04.6] [O12 I01 N1.73 T000001 D1.2|3|3311111111111111] >4x4.--1-.3333.40c04710.-2"},
    {info: "INFO: [R3-5|03 H3|06300 C11.5 U+00.1] [O08 I03 N1.59 T000001 D2.0|4|4333333111112111] >4x4.313-.3-12.44591920.-122"},

    {info: "INFO: [R3-6|08 H4|05650 C21.5 U+05.5] [O18 I04 N1.48 T000001 D2.4|3|333333333333111221112222113333333333] >6x6.3-23-5.-4333-.222cc82de8ec364118.34121223"},
    {info: "INFO: [R3-4|05 H6|06510 C27.8 U+10.9] [O11 I04 N1.11 T000001 D2.7|3|333333333333333333333333333333111111] >6x6.-2----.123212.222c884b23890e6020.2-3231"},
    {info: "INFO: [R4-6|02 H4|02810 C31.9 U+12.2] [O13 I06 N1.32 T000001 D2.4|4|333333333111144444444444111111111111] >6x6.222223.-5-2-4.0000000406c4221380.-34"},
    {info: "INFO: [R6-6|01 H2|03720 C34.3 U+07.7] [O12 I04 N1.29 T000001 D2.6|5|555555333333333333333331111111111111] >6x6.121224.-22314.0c0480610000000000.3-"},



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
                elements.instructions.innerHTML = "Aseta ruudukkoon täpliä niin, että jokaisen rivin, sarakkeen ja alueen täplien määrä vastaa sille annettua lukua. Jos lukua ei ole, täpliä voi olla kuinka monta tahansa tai ei yhtään. Ratkaisuja on vain yksi.";
                elements.gameOver.innerHTML     = "Ratkaistu!";
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

    /* Keep board and history, just enable buttons again */
    uiButtonsRedraw(globals.game);
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



