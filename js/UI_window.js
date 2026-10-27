/*****************************************************************************
 * Game window handling
 *****************************************************************************/
function windowResize() {
    uiBoardSetup(globals.game.board);

    return false;
}

/* Time of last touch end, for double-tap check */
let windowLastTouchEnd = 0;

/* Blocked tap gives no click, so send it to the button */
function windowClickButton(target) {
    const button = target.closest("button");

    if (button && !button.disabled) {
        button.click();
    }
}

/* Touch start was blocked, so browser sends no click */
let windowTouchBlocked = false;

/* Block double-tap zoom, buttons get click by hand */
function windowTouchEnd(event) {
    if (windowTouchBlocked) {
        event.preventDefault();
        windowClickButton(event.target);
    }

    windowTouchBlocked = false;
    windowLastTouchEnd = Date.now();
}

/* Block double-tap magnifier, it starts on second touch start */
function windowTouchStart(event) {
    const now = Date.now();

    if (now - windowLastTouchEnd < 500) {
        event.preventDefault();
        windowTouchBlocked = true;
    }
}


/*****************************************************************************
 * Window event handlers
 *****************************************************************************/
window.addEventListener("resize", windowResize);
document.addEventListener("touchstart", windowTouchStart, {passive: false});
document.addEventListener("touchend", windowTouchEnd, {passive: false});
