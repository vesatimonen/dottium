
/*****************************************************************************
 * Move helpers
 *****************************************************************************/
function uiMovePosition(event) {
    let X, Y;

    switch (event.type) {
        case "pointerdown":
        case "pointermove":
            X = event.clientX;
            Y = event.clientY;
            break;
        default:
            return undefined;
    }

    let rect = elements.grid.getBoundingClientRect();
    X -= rect.left;
    Y -= rect.top;
    X = X / globals.cellSize;
    Y = Y / globals.cellSize;

    return {X, Y};
}


/*****************************************************************************
 * Event handlers
 *****************************************************************************/
/* Item being painted, undefined when not painting */
let paintItem = undefined;

/* Last cell under pointer while painting */
let paintLastX = undefined;
let paintLastY = undefined;

/* Press point, drag starts after moving this far, in cells */
const DRAG_THRESHOLD = 0.3;
let paintStartX = undefined;
let paintStartY = undefined;
let paintDragging = false;

/* Last tapped cell, fast tap on it cycles on to block */
let tapLastX = undefined;
let tapLastY = undefined;

/* Paint one cell, returns true if changed */
function uiPaintCell(x, y) {
    const oldItem = globals.game.board.getItem(x, y);

    /* Off board or already painted */
    if (oldItem == undefined || oldItem == paintItem) {
        return false;
    }

    /* Dot drag skips blocked cells, real or grey done block */
    if (paintItem == ITEM_DOT) {
        if (oldItem == ITEM_BLOCK || uiCellDoneBlock(globals.game.board, x, y)) {
            return false;
        }
    }

    /* Block drag skips dots and grey done blocks */
    if (paintItem == ITEM_BLOCK) {
        if (oldItem == ITEM_DOT || uiCellDoneBlock(globals.game.board, x, y)) {
            return false;
        }
    }

    globals.game.paintMove(x, y, paintItem);
    return true;
}

/* Paint all cells on line, so fast swipes skip nothing */
function uiPaintLine(fromX, fromY, toX, toY) {
    const steps = Math.max(Math.abs(toX - fromX), Math.abs(toY - fromY));
    let changed = false;

    for (let step = 1; step <= steps; step++) {
        const x = Math.round(fromX + (toX - fromX) * step / steps);
        const y = Math.round(fromY + (toY - fromY) * step / steps);

        if (uiPaintCell(x, y)) {
            changed = true;
        }
    }

    return changed;
}

function uiPointerDown(event) {
    /* Ignore clicks during solve animation or game over */
    if (uiInputBlocked()) {
        return false;
    }

    /* Only main button */
    if (event.button != 0) {
        return false;
    }

    /* Get click position */
    const move = uiMovePosition(event);
    const board = globals.game.board;

    /* Cell under pointer */
    const Xcell = Math.floor(move.X);
    const Ycell = Math.floor(move.Y);

    /* Ignore presses in hint margin */
    if (Xcell < 0 || Xcell > board.width - 1 ||
        Ycell < 0 || Ycell > board.height - 1) {
        return false;
    }

    /* Fast tap on same cell cycles, else dot or clear */
    let fastTap = false;
    if (uiHintsWaiting() && Xcell == tapLastX && Ycell == tapLastY) {
        fastTap = true;
    }
    tapLastX = Xcell;
    tapLastY = Ycell;

    /* Change cell, new item is used for painting */
    paintItem = globals.game.makeMove(Xcell, Ycell, fastTap);
    paintLastX = Xcell;
    paintLastY = Ycell;

    /* Remember press point for drag threshold */
    paintStartX = move.X;
    paintStartY = move.Y;
    paintDragging = false;

    /* Keep getting moves outside board until release */
    elements.board.setPointerCapture(event.pointerId);

    uiRedraw(paintItem != ITEM_NONE); /* Clear shows hints now, add after pause */
}

function uiPointerMove(event) {
    /* Not painting, solve animation running or game over */
    if (paintItem == undefined || uiInputBlocked()) {
        return false;
    }

    /* Button released where we did not see it, stop painting */
    if (event.buttons == 0) {
        paintItem = undefined;
        return false;
    }

    /* Get cell under pointer */
    const move = uiMovePosition(event);
    const Xcell = Math.floor(move.X);
    const Ycell = Math.floor(move.Y);

    /* Small finger slide is not a drag */
    if (!paintDragging) {
        if (Math.hypot(move.X - paintStartX, move.Y - paintStartY) < DRAG_THRESHOLD) {
            return false;
        }
        paintDragging = true;
    }

    /* Still in same cell */
    if (Xcell == paintLastX && Ycell == paintLastY) {
        return false;
    }

    /* Paint from last cell to this one */
    const changed = uiPaintLine(paintLastX, paintLastY, Xcell, Ycell);
    paintLastX = Xcell;
    paintLastY = Ycell;

    if (changed) {
        uiRedraw(paintItem != ITEM_NONE); /* Clear shows hints now, add after pause */
    }
}

function uiPointerUp(event) {
    /* Stop painting */
    paintItem = undefined;
}

/* Stop iOS magnifier and text select on board, modal closes on pointerdown */
function uiTouchStart(event) {
    event.preventDefault();
}

elements.board.addEventListener("pointerdown",   uiPointerDown);
elements.board.addEventListener("pointermove",   uiPointerMove);
elements.board.addEventListener("pointerup",     uiPointerUp);
elements.board.addEventListener("pointercancel", uiPointerUp);
elements.board.addEventListener("lostpointercapture", uiPointerUp); /* Release outside window */
elements.board.addEventListener("touchstart",    uiTouchStart, {passive: false});




