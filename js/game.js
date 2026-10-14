/* Create and initialize 2D array */
function array2D(width, height, value) {
    let arr = [];

    // creating two dimensional array
    for (let i = 0; i < width; i++) {
        arr[i] = [];
    }

    // inserting elements to array
    for (let i = 0; i < width; i++) {
        for(let j = 0; j < height; j++) {
            arr[i][j] = value;
        }
    }

    return arr;
}

/* Wall mask bits, same as dottium-ai */
const WALL_MASK_UP    = 0x01;
const WALL_MASK_RIGHT = 0x02;
const WALL_MASK_DOWN  = 0x04;
const WALL_MASK_LEFT  = 0x08;

/* Cell items, same as dottium-ai */
const ITEM_NONE  = 0;
const ITEM_DOT   = 1;
const ITEM_BLOCK = 2;

/* Parse hint string, '-' means no hint */
function parseHints(text) {
    let hints = [];

    for (let i = 0; i < text.length; i++) {
        if (text[i] == '-') {
            hints[i] = undefined;
        } else {
            hints[i] = parseInt(text[i]);
        }
    }

    return hints;
}

/* Dot count matches hint, no hint matches any count */
function hintMatch(count, hint) {
    return hint == undefined || count == hint;
}

/* Hint status for drawing */
const HINT_OPEN = 0; /* Fewer dots than hint, or no hint */
const HINT_DONE = 1; /* Dots match hint */
const HINT_OVER = 2; /* More dots than hint */

/* Compare dot count to hint */
function hintStatus(count, hint) {
    if (hint == undefined || count < hint) {
        return HINT_OPEN;
    }
    if (count == hint) {
        return HINT_DONE;
    }
    return HINT_OVER;
}

/* Visible board state */
class Board {
    constructor() {
        /* Board size */
        this.width     = undefined;
        this.height    = undefined;

        /* col/row hints */
        this.colHints = [undefined];
        this.rowHints = [undefined];

        /* Board walls */
        this.horizontalWalls = [[undefined]];
        this.verticalWalls   = [[undefined]];

        /* Rooms info */
        this.roomCount = 0;
        this.roomId    = [[undefined]];
        this.roomHints = [undefined];
        this.roomSize  = [undefined];

        /* Board content */
        this.items = [[undefined]];

        /* Dot counts */
        this.roomDotCount = [undefined];
        this.rowDotCount  = [undefined];
        this.colDotCount  = [undefined];
    }

    /* Item methods */
    getItem(x, y) {
        /* Check limits */
        if (x < 0 || x >= this.width ||
            y < 0 || y >= this.height) {
            return undefined;
        }

        return this.items[x][y];
    }

    setItem(x, y, item) {
        /* Check limits */
        if (x < 0 || x >= this.width ||
            y < 0 || y >= this.height) {
            return false;
        }

        /* Check item value */
        if (item != ITEM_NONE && item != ITEM_DOT && item != ITEM_BLOCK) {
            return false;
        }

        const roomId = this.roomId[x][y];

        /* Remove old dot from counts */
        if (this.items[x][y] == ITEM_DOT) {
            this.roomDotCount[roomId]--;
            this.rowDotCount[y]--;
            this.colDotCount[x]--;
        }

        this.items[x][y] = item;

        /* Add new dot to counts */
        if (item == ITEM_DOT) {
            this.roomDotCount[roomId]++;
            this.rowDotCount[y]++;
            this.colDotCount[x]++;
        }

        return true;
    }

    /* Wall methods */
    getVerticalWall(x, y) {
        return this.verticalWalls[x][y];
    }

    getHorizontalWall(x, y) {
        return this.horizontalWalls[x][y];
    }

    /* Set walls using mask */
    setWall(x, y, mask) {
        if ((mask & WALL_MASK_UP) > 0 && y > 0) {
            this.horizontalWalls[x][y] = 1;
        }
        if ((mask & WALL_MASK_RIGHT) > 0 && x < this.width - 1) {
            this.verticalWalls[x + 1][y] = 1;
        }
        if ((mask & WALL_MASK_DOWN) > 0 && y < this.height - 1) {
            this.horizontalWalls[x][y + 1] = 1;
        }
        if ((mask & WALL_MASK_LEFT) > 0 && x > 0) {
            this.verticalWalls[x][y] = 1;
        }
    }

    /* Fill room from cell, same as challenge_room_fill() */
    roomFill(x, y, roomId) {
        /* Check limits */
        if (x < 0 || x >= this.width ||
            y < 0 || y >= this.height) {
            return;
        }

        /* Already filled */
        if (this.roomId[x][y] != undefined) {
            return;
        }

        /* Fill this cell */
        this.roomId[x][y] = roomId;
        this.roomSize[roomId]++;

        /* Continue fill to neighbours */
        if (this.verticalWalls[x + 1][y] == 0) {
            this.roomFill(x + 1, y, roomId);
        }
        if (this.verticalWalls[x][y] == 0) {
            this.roomFill(x - 1, y, roomId);
        }
        if (this.horizontalWalls[x][y + 1] == 0) {
            this.roomFill(x, y + 1, roomId);
        }
        if (this.horizontalWalls[x][y] == 0) {
            this.roomFill(x, y - 1, roomId);
        }
    }

    /* Find rooms, same as challenge_rooms_init() */
    roomsInit() {
        /* Reset room layout */
        this.roomId    = array2D(this.width, this.height, undefined);
        this.roomSize  = [];
        this.roomCount = 0;

        /* Go through rooms and fill them, x first keeps C id order */
        for (let x = 0; x < this.width; x++) {
            for (let y = 0; y < this.height; y++) {
                if (this.roomId[x][y] == undefined) {
                    this.roomSize[this.roomCount] = 0;
                    this.roomFill(x, y, this.roomCount);
                    this.roomCount++;
                }
            }
        }
    }

    /* Hint status of row, col and room */
    rowStatus(y) {
        return hintStatus(this.rowDotCount[y], this.rowHints[y]);
    }

    colStatus(x) {
        return hintStatus(this.colDotCount[x], this.colHints[x]);
    }

    roomStatus(roomId) {
        return hintStatus(this.roomDotCount[roomId], this.roomHints[roomId]);
    }

    /* Solved when every row, col and room matches its hint */
    solved() {
        for (let y = 0; y < this.height; y++) {
            if (!hintMatch(this.rowDotCount[y], this.rowHints[y])) {
                return false;
            }
        }

        for (let x = 0; x < this.width; x++) {
            if (!hintMatch(this.colDotCount[x], this.colHints[x])) {
                return false;
            }
        }

        for (let roomId = 0; roomId < this.roomCount; roomId++) {
            if (!hintMatch(this.roomDotCount[roomId], this.roomHints[roomId])) {
                return false;
            }
        }

        return true;
    }

    /* Initialize game */
    init(info) {
        /* Parse board size */
        const infoSplit = info.split(/[>$#]/);
        const boardInfo = infoSplit[infoSplit.length - 1]; /* Part after '>', or all if no prefix */
        const boardSize = boardInfo.match(/^(\d+)x(\d+)/); /* WxH, any digits */
        const infoParts = boardInfo.split('.'); /* size.cols.rows.walls.rooms */
        this.width      = parseInt(boardSize[1]);
        this.height     = parseInt(boardSize[2]);

        /* Parse col hints */
        this.colHints = parseHints(infoParts[1]);

        /* Parse row hints */
        this.rowHints = parseHints(infoParts[2]);

        /* Parse walls, one hex digit per checkered cell */
        this.verticalWalls   = array2D(this.width + 1, this.height, 0);
        this.horizontalWalls = array2D(this.width, this.height + 1, 0);
        const wallText = infoParts[3];
        let wallIndex  = 0;
        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                if ((x + y) % 2 == 0) {
                    this.setWall(x, y, parseInt(wallText[wallIndex], 16));
                    wallIndex++;
                }
            }
        }

        /* Initialize rooms */
        this.roomsInit();

        /* Parse room hints, index is room id */
        this.roomHints = parseHints(infoParts[4]);

        /* Initialize board content */
        this.items = array2D(this.width, this.height, ITEM_NONE);

        /* Clear dot counts, board is empty */
        this.roomDotCount = new Array(this.roomCount).fill(0);
        this.rowDotCount  = new Array(this.height).fill(0);
        this.colDotCount  = new Array(this.width).fill(0);
    }
}

/* Game state */
class Game {
    constructor() {
        /* Game board */
        this.board = new Board();

        /* Game move history */
        this.moves = [];

        /* Game level */
        this.level = 0;
    }

    init(level, info) {
        /* Clear move history */
        this.moves = [];

        /* Set level */
        this.level = level;

        /* Initialize board */
        this.board.init(info);
    }

    makeMove(x, y) {
        const oldItem = this.board.getItem(x, y);
        let newItem;

        /* Cycle NONE -> DOT -> BLOCK -> NONE */
        if (oldItem == ITEM_NONE) {
            newItem = ITEM_DOT;
        } else if (oldItem == ITEM_DOT) {
            newItem = ITEM_BLOCK;
        } else {
            newItem = ITEM_NONE;
        }

        return this.paintMove(x, y, newItem);
    }

    /* Set cell to item, used when painting */
    paintMove(x, y, item) {
        const oldItem = this.board.getItem(x, y);

        /* Off board */
        if (oldItem == undefined) {
            return undefined;
        }

        /* Same item, nothing to save */
        if (oldItem == item) {
            return item;
        }

        /* Bad item, nothing changed */
        if (!this.board.setItem(x, y, item)) {
            return oldItem;
        }

        /* Save move, old item for undo, new item for replay */
        this.moves.push({x: x, y: y, oldItem: oldItem, newItem: item});

        return item;
    }

    undoMove() {
        /* Check if something to undo */
        if (this.moves.length == 0) {
            return false;
        }

        /* Pop latest move */
        const move = this.moves.pop();
        this.board.setItem(move.x, move.y, move.oldItem);

        return true;
    }

    undoable() {
        if (this.moves.length == 0) {
            return false;
        }
        return true;
    }
}



