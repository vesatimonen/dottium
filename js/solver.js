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

    /* Cell values and undo trail */
    state.cells = new Int8Array(width * height).fill(SOLVER_OPEN);
    state.trail = []; /* Set cells in order, for undo */

    return state;
}


/*****************************************************************************
 * Cell set and undo
 *****************************************************************************/
const SOLVER_OPEN  = -1;
const SOLVER_EMPTY = 0;
const SOLVER_DOT   = 1;

/* Group can still reach its hint */
function solverGroupOk(group) {
    return group.dots <= group.hint && group.dots + group.open >= group.hint;
}

/* Set open cell, false if some group can no longer reach its hint */
function solverCellSet(state, index, value) {
    let ok = true;

    state.cells[index] = value;
    state.trail.push(index);

    for (const group of state.cellGroups[index]) {
        group.open--;
        group.dots += value;
        if (!solverGroupOk(group)) {
            ok = false; /* Keep going, undo needs all counters updated */
        }
    }

    return ok;
}

/* Undo cells back to trail length */
function solverUndo(state, trailLength) {
    while (state.trail.length > trailLength) {
        const index = state.trail.pop();
        const value = state.cells[index];

        for (const group of state.cellGroups[index]) {
            group.open++;
            group.dots -= value;
        }
        state.cells[index] = SOLVER_OPEN;
    }
}


/*****************************************************************************
 * Forced moves
 *****************************************************************************/
/* Set all open cells of group, false on dead end */
function solverGroupFill(state, group, value) {
    for (const index of group.cells) {
        if (state.cells[index] != SOLVER_OPEN) {
            continue;
        }
        if (!solverCellSet(state, index, value)) {
            return false;
        }
    }

    return true;
}

/* Hint met: rest empty, all open needed: rest dots, repeat until no change */
function solverPropagate(state) {
    let changed = true;

    while (changed) {
        changed = false;

        for (const group of state.groups) {
            if (group.open == 0) {
                continue;
            }

            if (group.dots == group.hint) {
                if (!solverGroupFill(state, group, SOLVER_EMPTY)) {
                    return false;
                }
                changed = true;
            } else if (group.dots + group.open == group.hint) {
                if (!solverGroupFill(state, group, SOLVER_DOT)) {
                    return false;
                }
                changed = true;
            }
        }
    }

    return true;
}


/*****************************************************************************
 * Guess and backtrack
 *****************************************************************************/
/* Open cell of most limited group, else any open cell, -1 if board full */
function solverCellPick(state) {
    let best = undefined;

    for (const group of state.groups) {
        if (group.open > 0 && (best == undefined || group.open < best.open)) {
            best = group;
        }
    }

    /* Cells in hinted groups first, free cells last */
    let cells = state.cells.keys();
    if (best != undefined) {
        cells = best.cells;
    }
    for (const index of cells) {
        if (state.cells[index] == SOLVER_OPEN) {
            return index;
        }
    }

    return -1;
}

/* Copy full board as solution[x][y], true for dot */
function solverSolutionSave(state, result) {
    result.solution = array2D(state.width, state.height, false);

    for (let index = 0; index < state.cells.length; index++) {
        const x = index % state.width;
        const y = Math.floor(index / state.width);
        result.solution[x][y] = state.cells[index] == SOLVER_DOT;
    }
}

/* Try dot and empty in picked cell, forced moves after each guess */
function solverSearch(state, result, visitLimit) {
    result.visits++;
    if (result.visits > visitLimit) {
        result.stopped = true;
        return;
    }

    /* Full board is a solution */
    const index = solverCellPick(state);
    if (index < 0) {
        result.count++;
        if (result.count == 1) {
            solverSolutionSave(state, result);
        }
        return;
    }

    for (const value of [SOLVER_DOT, SOLVER_EMPTY]) {
        const trailLength = state.trail.length;

        if (solverCellSet(state, index, value) && solverPropagate(state)) {
            solverSearch(state, result, visitLimit);
        }
        solverUndo(state, trailLength);

        /* Second solution or limit ends search */
        if (result.count >= SOLVER_MAX_SOLUTIONS || result.stopped) {
            return;
        }
    }
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

    /* Forced moves first, dead end means no solution */
    if (!solverPropagate(state)) {
        return result;
    }

    solverSearch(state, result, visitLimit);

    return result;
}
