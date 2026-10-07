
/*****************************************************************************
 * Game levels
 *****************************************************************************/
var defaultChallengeSet = [
    {info: "INFO: V30-19-14-11-07 C00-00-90 D0000000000000000000000000000 T000001 E119 S00.000 #9x9=4-112010420132130020041322013000100440013041330001020201201311120242401031013002023"},
    {info: "INFO: V26-22-18-10-05 C00-00-90 D0000000000000000000000000000 T000001 E131 S00.752 #9x9=4-200234303212010010300211021200412002221111402000132120042110031221021431310133100"},
    {info: "INFO: V25-25-15-11-05 C00-00-90 D0000000000000000000000000000 T000001 E123 S00.206 #9x9=4-311030112201303014213001110003142230130121201122101114140124000003202200302201113"},
    {info: "INFO: V23-30-10-14-04 C00-00-90 D0000000000000000000000000000 T000001 E129 S00.001 #9x9=4-330330112013012111110110220011130140130034101313010223003110312104022001213011141"},
];

var debugChallengeSet = [
    {info: "INFO: V20-29-19-11-02 C00-00-90 D0000000000000000000000000000 T000001 E135 S00.947 #9x9=4-312431322110003120011020003130321021201000130133143112221101122110102221122211101"},
    {info: "INFO: V36-21-12-12 C00-43-90 D0000010000000000000000000000 T000001 #9x9=3-000103000130322001221021132010130100223100110000100213100103010302031130012102030"},
];


/*****************************************************************************
 * Parse URL options
 *****************************************************************************/
var level_option = undefined;
var set_option   = undefined;
function parseOptions() {
    /* Replace special characters in url */
    var newUrl = window.location.href;
    newUrl = newUrl.replace("%23", '#'); /* Replace "%23" -> '#' */
    newUrl = newUrl.replace('#', '>');   /* '#' -> '>' */
    newUrl = newUrl.replace("%3E", '>'); /* Replace "%3E" -> '>' */

    /* Create URL */
    const url = new URL(newUrl);

    /* Level option */
    const levelOption = url.searchParams.get("level");
    if (levelOption == null) {
        /* Read from storage */
        options.level = JSON.parse(localStorage.getItem(globals.storage));
    } else {
        options.level = Number(levelOption - 1);
    }

    /* Challenge option */
    var challengeOption = url.searchParams.getAll("challenge");
    if (challengeOption.length == 0) {
    } else {
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
    }
}


/*****************************************************************************
 * Modal window handling (Game over)
 *****************************************************************************/
function modalClick(event) {
    event.preventDefault();

    elements.gameOver.style.visibility = "hidden";
    elements.board.style.visibility     = "visible";

    gameStart(globals.game.level);
}

elements.gameOver.addEventListener("click",      modalClick);
elements.gameOver.addEventListener("touchend",   modalClick, {passive: true});


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
    document.getElementById("dottium-sum").innerHTML = "4";
    globals.game.init(level, options.challenges[level].info);

    /* Save game point */
    localStorage.setItem(globals.storage, JSON.stringify(globals.game.level));

    /* Debug text */
    if (options.challenges == debugChallengeSet) {
        elements.debug.innerHTML = options.challenges[level].info.split("#")[0];
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



