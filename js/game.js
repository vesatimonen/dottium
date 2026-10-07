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

/* Randomize helpers */
var randomSeed = 0;
function randomOwnSeed(seed) {
    randomSeed = seed;
}
function randomOwn() {
    randomSeed = (randomSeed * 1103515245 + 12345) % 4294967296;
    return ((randomSeed / 65536) % 32768) / 32768;
}

/* Visible board state */
class Board {
    constructor() {
        /* Board configuration */
        this.width     = undefined;
        this.height    = undefined;
        this.targetSum = undefined;
        this.values    = [[undefined]];

        /* Board walls */
        this.horizontalWalls = [undefined];
        this.verticalWalls = [undefined];

        /* Room statistics */
        this.roomId       = [[undefined]];
        this.roomSum      = [undefined];
        this.roomArea     = [undefined];
        this.roomResolved = 0;
        this.roomCount    = 0;
    }

    /* Wall methods */
    arrayIndex(x, y) {
        return (this.width + 1) * y + x;
    }

    getVerticalWall(x, y) {
        return this.verticalWalls[this.arrayIndex(x, y)];
    }

    setVerticalWall(x, y, value) {
        this.verticalWalls[this.arrayIndex(x, y)] = value;
    }

    toggleVerticalWall(x, y) {
        if (this.getVerticalWall(x, y) == 1) {
            this.setVerticalWall(x, y, 0);
        } else {
            this.setVerticalWall(x, y, 1);
        }

        this.updateRoomStatistics();

        return this.getVerticalWall(x, y);
    }

    getHorizontalWall(x, y) {
        return this.horizontalWalls[this.arrayIndex(x, y)];
    }

    setHorizontalWall(x, y, value) {
        this.horizontalWalls[this.arrayIndex(x, y)] = value;
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
        this.roomSum[id] += this.values[x][y];
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
        var roomId = this.roomId[x][y];

        if (roomId == undefined) {
            return false;
        }

        if (this.roomSum[roomId] == this.targetSum && this.roomArea[roomId] == 3) {
            return true;
        } else {
            return false;
        }
    }

    solved() {
        if (this.roomResolved == this.width * this.height / 3) {
            return true;
        } else {
            return false;
        }
    }

    /* Initialize game */
    init(info) {
        /* Parse board configuration */
        var boardInfo   = info.split(/[>$#]/)[1];
        this.width      = parseInt(boardInfo.substr(0,1));
        this.height     = parseInt(boardInfo.substr(2,1));
        this.targetSum  = parseInt(boardInfo.split('=')[1]);
        var boardValues = boardInfo.split('-')[1];

        /* Initialize vertical walls */
        for (let x = 0; x < this.width + 1; x++) {
            for (let y = 0; y < this.height; y++) {
                if (x == 0 || x == this.width) {
                    this.setVerticalWall(x, y, 1);
                } else {
                    this.setVerticalWall(x, y, 0);
                }
            }
        }

        /* Initialize horizontal walls */
        for (let y = 0; y < this.height + 1; y++) {
            for (let x = 0; x < this.width; x++) {
                if (y == 0 || y == this.height) {
                    this.setHorizontalWall(x, y, 1);
                } else {
                    this.setHorizontalWall(x, y, 0);
                }
            }
        }

        /* Initialize board values */
        this.values = array2D(this.width, this.height, 0);
        for (let x = 0; x < this.width; x++) {
            for (let y = 0; y < this.height; y++) {
                this.values[x][y] = parseInt(boardValues[y * this.width + x]);
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
        randomOwnSeed(level);

        /* Initialize board */
        this.board.init(info);
    }

    makeMove(direction, x, y) {
        var polarity = undefined;

        switch (direction) {
            case "vertical":
                polarity = this.board.toggleVerticalWall(x, y);
                break;
            case "horizontal":
                polarity = this.board.toggleHorizontalWall(x, y);
                break;
            default:
                return undefined;
        }

        /* Save move */
        this.moves.push({direction: direction, x: x, y: y});

        return polarity;
    }

    undoMove() {
        /* Check if something to undo */
        if (this.moves.length == 0) {
            return false;
        }

        /* Pop latest move */
        let move = this.moves.pop();

        switch (move.direction) {
            case "vertical":
                this.board.toggleVerticalWall(move.x, move.y);
                break;
            case "horizontal":
                this.board.toggleHorizontalWall(move.x, move.y);
                break;
            default:
                return;
        }

        return true;
    }

    undoable() {
        if (this.moves.length == 0) {
            return false;
        }
        return true;
    }
}



