
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

    {info: "INFO: [R01|4-4 M2|011 SHVDR] [O38 I02 T000001 F16 D1.2|3|3333333311111111111111111111111111111111111111111111111111111111] >8x8.23176775.-4547425.00000000004009800260010000000000.-1"},
    {info: "INFO: [R12|3-5 Ma|217 S--DR] [O34 I02 T000001 F22 D1.5|3|3333333333331111112111111111112111111112222111111111121111111112] >8x8.6-2-4246.14722-76.06489d7469dbb9e82b6ee7691d762190.1-3-1222--1-11-421-"},
    {info: "INFO: [R12|3-6 M6|042 S---R] [O30 I10 T000001 F22 D2.2|4|3333444444444444411122222333112221111111222221111333333111112211] >8x8.23433366.--3-33-3.02c44c991779d2d417876dd466311380.42-12112231-21"},
    {info: "INFO: [R06|4-5 M6|051 S---R] [O11 I08 T000001 F16 D2.5|4|4444444444444444444333333331111111111111111344444441112111111121] >8x8.12111131.-2--5-3-.404032304cc798982626d3310c8c0101.-111222"},

    {info: "INFO: [R07|3-6 M5|032 S----] [O27 I07 T000013 F20 D2.3|9|3333333229191111114444933333333333111133331111111111112111111211] >8x8.14445423.6--16-36.000044446375ca58239a39d939013000.-2222-222"},
    {info: "INFO: [R08|3-6 Md|418 SHVDR] [O36 I03 T000051 F16 D3.5|9|3333333311111122233333333111199999919192299119999911111111222111] >8x8.-3-2--74.54677-21.0a2c9c8c56b436714d9c1e95323638a0.-3-2-11--2245---"},
    {info: "INFO: [R04|6-6 M3|021 S---R] [O18 I04 T081260 F17 D4.2|9|9333339911999111111991999999199999391991111991111111211111111111] >8x8.53111142.-2-32353.4206c360081060096009042009c39081.-2222"},
    {info: "INFO: [R02|4-5 M3|021 S----] [O17 I05 T007027 F16 D5.6|9|9999991199999911991111192999919999919111999911999991993311111111] >8x8.22323113.21--1147.0a002c000c8401210003000800020001.-33"},
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
                options.gameOverText            = "Peli päättyi!";
                break;
        }
    }
}


/*****************************************************************************
 * Modal window handling (game over and about)
 *****************************************************************************/
/* Tap that closed modal, its click is not used */
let modalDropClick = false;

function modalVisible() {
    return elements.modal.style.visibility == "visible";
}

/* Show modal in middle of board, empty text hides second line */
function modalShow(title, text, fadeIn) {
    elements.modalTitle.textContent = title;
    elements.modalText.textContent  = text;
    elements.modal.style.visibility = "visible";

    uiButtonsRedraw(globals.game); /* Gray out buttons */

    /* Fade in, or show at once */
    elements.modal.style.animation = "none";
    if (fadeIn) {
        elements.modal.offsetHeight; /* trigger reflow */
        elements.modal.style.animation = "image-appear 0.6s ease-in 0.2s 1 normal both";
    }
}

/* Hide modal, keep board and history, enable buttons again */
function modalHide() {
    elements.modal.style.visibility = "hidden";

    uiButtonsRedraw(globals.game);
}

/* Tap anywhere closes modal, tap does nothing else */
function modalPointerDown(event) {
    if (!modalVisible()) {
        modalDropClick = false; /* New tap, its click is used */
        return;
    }

    event.preventDefault();
    event.stopPropagation(); /* Keep tap off the board */

    modalHide();
    modalDropClick = true;
}

/* Drop click of closing tap, so buttons do not act */
function modalClick(event) {
    if (modalDropClick) {
        modalDropClick = false;
        event.preventDefault();
        event.stopPropagation();
    }
}

/* Capture, so modal sees taps before board and buttons */
document.addEventListener("pointerdown", modalPointerDown, true);
document.addEventListener("click",       modalClick,       true);


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

    /* Debug text, INFO without board part after > */
    if (options.challenges == debugChallengeSet) {
        elements.debug.textContent = options.challenges[level].info.split(/[>$#]/)[0].trim();
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



