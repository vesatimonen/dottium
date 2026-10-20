/*****************************************************************************
 * Game window handling
 *****************************************************************************/
function windowResize() {
    uiBoardSetup(globals.game.board);

    return false;
}

/* Time of last touch end, for double-tap check */
let windowLastTouchEnd = 0;

/* Block double-tap zoom, buttons still get fast taps */
function windowTouchEnd(event) {
    const now = Date.now();

    if (now - windowLastTouchEnd < 500 && !event.target.closest("button")) {
        event.preventDefault();
    }

    windowLastTouchEnd = now;
}


/*****************************************************************************
 * Window event handlers
 *****************************************************************************/
window.addEventListener("resize", windowResize);
document.addEventListener("touchend", windowTouchEnd, {passive: false});
