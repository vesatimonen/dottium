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

/* Count solutions of board, board is only read */
function solverRun(board, visitLimit) {
    const result = solverResult();

    /* Search comes in plan #2 - #4 */

    return result;
}
