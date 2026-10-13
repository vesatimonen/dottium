
/*****************************************************************************
 * Game levels
 *****************************************************************************/
const defaultChallengeSet = [
    {info: "INFO: R21 S3-6 T011324 D999999939199911111911111129111119991111299991199939119922222199991111222211111121 M4.2 >9x9.58623134-.342--6577.462205cb7633717cd4657b11b6c4db4c7d9e20a20.----2--3---3---51-132"},
    {info: "INFO: R21 S3-6 T011324 D999999939199911111911111129111119991111299991199939119922222199991111222211111121 M4.2 >9x9.58623134-.342--6577.462205cb7633717cd4657b11b6c4db4c7d9e20a20.----2--3---3---51-132"},
    {info: "INFO: R21 S3-6 T011324 D999999939199911111911111129111119991111299991199939119922222199991111222211111121 M4.2 >9x9.58623134-.342--6577.462205cb7633717cd4657b11b6c4db4c7d9e20a20.----2--3---3---51-132"},
];

const debugChallengeSet = [
    {info: "INFO: V20-29-19-11-02 C00-00-90 D0000000000000000000000000000 T000001 E135 S00.947 >9x9=4-312431322110003120011020003130321021201000130133143112221101122110102221122211101"},
    {info: "INFO: V36-21-12-12 C00-43-90 D0000010000000000000000000000 T000001 >9x9=3-000103000130322001221021132010130100223100110000100213100103010302031130012102030"},
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
            options.level = JSON.parse(localStorage.getItem(globals.storage));
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
    try {
        localStorage.setItem(globals.storage, JSON.stringify(globals.game.level));
    } catch (error) {
        /* Storage blocked, skip save */
    }

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

    /* Show window */
    elements.screen.style.visibility = "visible";
}



