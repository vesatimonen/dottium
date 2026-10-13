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

/* Visible board state */
class Board {
    constructor() {
        /* Board size */
        this.width     = undefined;
        this.height    = undefined;

        /* Board walls */
        this.horizontalWalls = [[undefined]];
        this.verticalWalls   = [[undefined]];

        /* Room statistics */
        this.roomId       = [[undefined]];
        this.roomSum      = [undefined];
        this.roomArea     = [undefined];
        this.roomResolved = 0;
        this.roomCount    = 0;

        /* Board content */
        this.items = [[undefined]];
    }

    /* Wall methods */
    getVerticalWall(x, y) {
        return this.verticalWalls[x][y];
    }

    getHorizontalWall(x, y) {
        return this.horizontalWalls[x][y];
    }

    setHorizontalWall(x, y, value) {
        this.horizontalWalls[x][y] = value;
    }

    toggleHorizontalWall(x, y) {
        if (this.getHorizontalWall(x, y) == 1) {
            this.setHorizontalWall(x, y, 0);
        } else {
            this.setHorizontalWall(x, y, 1);
        }

        this.updateRoomStatistics();

        return this.getHorizontalWall(x, y);
    }

    /* Room functions */
    fillCell(x, y, id) {
        return false; // ???
        /* Out of board */
        if (x < 0 || x >= this.width ||
            y < 0 || y >= this.height) {
            return;
        }

        /* Already filled */
        if (this.roomId[x][y] != 0) {
            return;
        }

        /* Fill this cell */
        this.roomId[x][y] = id;
        this.roomSum[id] += this.items[x][y];
        this.roomArea[id]++;

        /* Fill left */
        if (this.getVerticalWall(x, y) == 0) {
            this.fillCell(x - 1, y, id);
        }

        /* Fill right */
        if (this.getVerticalWall(x + 1, y) == 0) {
            this.fillCell(x + 1, y, id);
        }

        /* Fill up */
        if (this.getHorizontalWall(x, y) == 0) {
            this.fillCell(x, y - 1, id);
        }

        /* Fill down */
        if (this.getHorizontalWall(x, y + 1) == 0) {
            this.fillCell(x, y + 1, id);
        }
    }

    updateRoomStatistics() {
        return false; // ???
        /* Initialize room statistics */
        this.roomId       = array2D(this.width, this.height, 0);
        this.roomResolved = 0;
        this.roomCount    = 0;

        /* Find first free and fill */
        for (let x = 0; x < this.width; x++) {
            for (let y = 0; y < this.height; y++) {
                if (this.roomId[x][y] == 0) {
                    this.roomCount++;

                    this.roomSum[this.roomCount] = 0;
                    this.roomArea[this.roomCount] = 0;
                    this.fillCell(x, y, this.roomCount);

                    if (this.resolved(x, y)) {
                        this.roomResolved++;
                    }

                }
            }
        }
    }

    resolved(x, y) {
        return false; // ???
        var roomId = this.roomId[x][y];

        if (roomId == undefined) {
            return false;
        }

        if (this.roomArea[roomId] == 3) {
            return true;
        } else {
            return false;
        }
    }

    solved() {
        return false; // ???
        if (this.roomResolved == this.width * this.height / 3) {
            return true;
        } else {
            return false;
        }
    }

    /* Initialize game */
    init(info) {
        /* Parse board size */
        var boardInfo   = info.split(/[>$#]/)[1];
        var boardSize   = boardInfo.match(/^(\d+)x(\d+)/); /* WxH, any digits */
        this.width      = parseInt(boardSize[1]);
        this.height     = parseInt(boardSize[2]);
        var boardItems = boardInfo.split('-')[1];

        /* Parse col hints */
        /* Parse row hints */

        /* Parse walls */
        this.verticalWalls   = array2D(this.width + 1, this.height, 0);
        this.horizontalWalls = array2D(this.width, this.height + 1, 0);

        /* Parse room hints */

        /* Initialize board items */
        this.items = array2D(this.width, this.height, 0);
        for (let x = 0; x < this.width; x++) {
            for (let y = 0; y < this.height; y++) {
                this.items[x][y] = parseInt(boardItems[y * this.width + x]);
            }
        }

        /* Update room statistics */
        this.updateRoomStatistics();
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
        var polarity = this.board.toggleHorizontalWall(x, y);

        /* Save move */
        this.moves.push({x: x, y: y});

        return polarity;
    }

    undoMove() {
        /* Check if something to undo */
        if (this.moves.length == 0) {
            return false;
        }

        /* Pop latest move */
        let move = this.moves.pop();
        this.board.toggleHorizontalWall(move.x, move.y);

        return true;
    }

    undoable() {
        if (this.moves.length == 0) {
            return false;
        }
        return true;
    }
}



