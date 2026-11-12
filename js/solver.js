/*****************************************************************************
 * Solver for editor Check, counts solutions and stops at 2
 *****************************************************************************/
const SOLVER_MAX_SOLUTIONS = 2; /* Two is enough to know it is not unique */

/* Result of one solver run */
function solverResult() {
    return {
        count:    0,         /* Solutions found, 0, 1 or 2 */
        solution: undefined, /* First solution, solution[x][y] true for dot */
        visits:   0,         /* Boards visited, bigger = harder */
        stopped:  false      /* Visit limit reached, count is not final */
    };
}

/*****************************************************************************
 * Constraint groups, one per hinted row, col and room
 *****************************************************************************/
/* Group with live counters, cells are y * width + x */
function solverGroup(hint, cells) {
    return {
        hint:  hint,
        cells: cells,
        dots:  0,           /* Dots placed so far */
        open:  cells.length /* Cells not decided yet */
    };
}

/* Add group if it has hint, no hint never limits anything */
function solverGroupAdd(state, hint, cells) {
    if (hint == undefined) {
        return;
    }

    const group = solverGroup(hint, cells);
    state.groups.push(group);

    for (const index of cells) {
        state.cellGroups[index].push(group);
    }

    /* More dots wanted than cells */
    if (hint > cells.length) {
        state.impossible = true;
    }
}

/* Groups and cell to groups lists from board */
function solverGroupsBuild(board) {
    const width  = board.width;
    const height = board.height;
    const state  = {
        width:      width,
        height:     height,
        groups:     [],
        cellGroups: [],   /* Hinted groups of each cell, at most 3 */
        impossible: false /* Some hint can never be met */
    };

    for (let index = 0; index < width * height; index++) {
        state.cellGroups[index] = [];
    }

    /* Rows */
    for (let y = 0; y < height; y++) {
        const cells = [];
        for (let x = 0; x < width; x++) {
            cells.push(y * width + x);
        }
        solverGroupAdd(state, board.rowHints[y], cells);
    }

    /* Cols */
    for (let x = 0; x < width; x++) {
        const cells = [];
        for (let y = 0; y < height; y++) {
            cells.push(y * width + x);
        }
        solverGroupAdd(state, board.colHints[x], cells);
    }

    /* Rooms, ids come from Board */
    const roomCells = [];
    for (let roomId = 0; roomId < board.roomCount; roomId++) {
        roomCells[roomId] = [];
    }
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            roomCells[board.roomId[x][y]].push(y * width + x);
        }
    }
    for (let roomId = 0; roomId < board.roomCount; roomId++) {
        solverGroupAdd(state, board.roomHints[roomId], roomCells[roomId]);
    }

    return state;
}


/*****************************************************************************
 * Solver entry
 *****************************************************************************/
/* Count solutions of board, board is only read */
function solverRun(board, visitLimit) {
    const result = solverResult();
    const state  = solverGroupsBuild(board);

    /* Hint bigger than its cells, no solution */
    if (state.impossible) {
        return result;
    }

    /* Search comes in plan #3 - #4 */

    return result;
}
