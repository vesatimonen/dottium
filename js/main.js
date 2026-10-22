
/*****************************************************************************
 * Game levels
 *****************************************************************************/
const defaultChallengeSet = [
    {info: "INFO: [R04|3-5 M0|000 S---R] [O08 I01 T000001 F07 D1.0|1|1111111111111111] >4x4.2411.4121.46300c91.3311"},
    {info: "INFO: [R03|4-6 M0|000 SH---] [O11 I01 T000001 F08 D1.1|2|1111111111112111] >4x4.4322.1-34.08602388.533"},
    {info: "INFO: [R01|4-4 M2|011 SHVDR] [O08 I03 T000001 F08 D1.2|2|2222111111111111] >4x4.1223.132-.04982610.-4"},
    {info: "INFO: [R04|3-3 M4|211 S---R] [O09 I03 T000001 F08 D1.3|2|2221111111111212] >4x4.-21-.-213.46982691.32-22"},

    {info: "INFO: [R04|4-4 M4|220 SHVDR] [O07 I03 T000001 F07 D2.3|3|3333333333111112] >4x4.3--3.3--1.08641920.3112"},
    {info: "INFO: [R03|3-4 M4|202 SHVDR] [O10 I02 T000001 F09 D1.9|3|3333331111221111] >4x4.2--2.3133.0c9c3630.1-2-1"},
    {info: "INFO: [R02|3-3 M2|011 S--DR] [O05 I04 T000001 F09 D1.5|3|3331113111111111] >4x4.1112.31-1.08941620.1-1"},
    {info: "INFO: [R02|4-4 M4|022 S---R] [O06 I04 T000001 F08 D2.2|4|3333444411111111] >4x4.1311.-22-.06b41e90.-1-2"},

    {info: "INFO: [R04|5-6 M3|102 S---R] [O12 I02 T000001 F15 D1.8|3|333311113333333311111222111111111111] >6x6.1-3422.222222.40836035c35c09c201.42-41-"},
    {info: "INFO: [R04|4-5 M5|014 SHVDR] [O16 I04 T000001 F14 D2.0|4|333333333111122111111444441111111111] >6x6.122335.2311-5.064998666999266190.-32-4-2-"},
    {info: "INFO: [R01|6-6 M4|031 SH---] [O09 I03 T000001 F10 D1.8|4|444444444411111111111111111111111111] >6x6.111132.-31--5.00000000004009c908.-4"},
    {info: "INFO: [R05|4-4 M5|104 S---R] [O24 I04 T000001 F14 D2.3|5|555555223333111113333111333111111111] >6x6.554-13.444444.2207796996696dd088.-3-332-2-"},

    {info: "INFO: [R3-5|05 H3|07831 C54.8 U+09.0] [O40 I04 N1.60 T000001 D2.8|4|4444444444444444444444444444444444444441111111111111111211111111] >8x8.66765-34.667-2257.0a08272009b329b10398036000100000.-22112"},
    {info: "INFO: [R3-6|03 H4|04345 C56.5 U+23.8] [O23 I03 N1.20 T000001 D2.2|4|3333333333444444444444444444111111111111111111111111111111112111] >8x8.444-44--.22215533.00a609e002600330003300c800010000.-452"},
    {info: "INFO: [R3-6|08 H9|0a511 C49.0 U+17.1] [O49 I02 N1.75 T000001 D3.3|4|4444444444444444444444444444444444444444444444411111122211112111] >8x8.--5-----.76667746.2000b4006e744a28178a63b954a719a0.14-42-1113"},
    {info: "INFO: [R4-6|13 H7|0a714 C33.3 U+09.0] [O35 I04 N1.50 T000001 D2.9|4|4444444444444444444444444444211112222233333333333331122221111112] >8x8.6-2--4-7.-4243-4-.420433b147989b6422997a241b792130.5132131422533"},

    {info: "INFO: [R3-5|02 H2|07613 C59.9 U+07.9] [O33 I03 N1.51 T000011 D2.4|9|5555555599911111119333333333333331111111111111111111111111111111] >8x8.12444666.1-276773.00000004000240482725e01100000000.-14"},
    {info: "INFO: [R4-5|03 H5|04a01 C58.9 U+16.5] [O45 I02 N1.69 T003135 D3.6|9|9999111111122911111119991111991111991111999991991122333311111111] >8x8.-6666666.12-7--74.00040021300c800120048028104a0218.-322"},
    {info: "INFO: [R3-6|10 H4|09734 C48.9 U+10.3] [O28 I08 N1.42 T000139 D3.3|9|3333333449999992291111129111111111112244991299133333333111111211] >8x8.-1744-42.2255143-.00cc42e827c6e43542ca8cb82479a1a0.-2222222222"},
    {info: "INFO: [R3-6|08 H6|04862 C49.9 U+19.2] [O28 I06 N1.39 T037902 D4.8|9|9999922922999111929999119944444444444444444444444444444444444422] >8x8.-242322-.-56-3435.0208482051bb32dc4889966422318880.3-12241-43"},
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

    /* Set option, short "s" or long "set", before level so storage key is right */
    let setOption = url.searchParams.get("s");
    if (setOption == null) {
        setOption = url.searchParams.get("set");
    }
    if (setOption == "debug") {
        options.challenges = debugChallengeSet;
        globals.storage    = globals.storage + "-debug";
    }

    /* Level option, short "l" or long "level" */
    let levelOption = url.searchParams.get("l");
    if (levelOption == null) {
        levelOption = url.searchParams.get("level");
    }
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

    /* Challenge option, short "c" or long "challenge" */
    let challengeOption = url.searchParams.getAll("c");
    if (challengeOption.length == 0) {
        challengeOption = url.searchParams.getAll("challenge");
    }
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
                elements.gameOver.innerHTML     = "Peli päättyi!";
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



