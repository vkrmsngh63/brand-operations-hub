// Floating "+ Add" button per COMPETITION_SCRAPING_STACK_DECISIONS.md §5.
//
// One singleton button element is created per page. The orchestrator calls
// `showFor(link)` on hover-in (after a 300ms debounce per §5 guardrail #1)
// and `hide()` on hover-out. The button repositions to the upper-right of
// the link's bounding box; click → callback → URL-add overlay form opens.
//
// Per-session dismiss (§5 guardrail #3): a small × button next to the
// floating button hides BOTH for the rest of the page-load. Page reload
// restores them.
//
// Cursor-traversal grace period (added 2026-05-08-c): hide() schedules a
// short delayed hide rather than hiding immediately, so the cursor can
// traverse the gap between the link's bounding box and the floating
// button without the button vanishing mid-traversal. mouseenter on the
// button cancels the pending hide; mouseleave on the button reschedules
// it. Bug surfaced during Waypoint #1 attempt #3 — see verification
// backlog attempt log + ROADMAP polish backlog.

const HOVER_DELAY_MS = 300;
// Grace period after link-mouseleave before the button hides. Long enough
// for the cursor to traverse the small gap from link bbox to the floating
// "+" button (typically <100ms of cursor travel) but short enough that the
// button still feels responsive when the user genuinely moves away.
const HIDE_GRACE_MS = 150;

export interface FloatingAddButton {
  /** Show the button anchored to the upper-right of `link`. */
  showFor(link: HTMLElement, href: string): void;
  /** Hide the button immediately. */
  hide(): void;
  /**
   * Returns true once the user has clicked the × dismiss for this page.
   * The orchestrator checks this before scheduling new shows so dismissed
   * users don't see the button reappear.
   */
  isDismissedForSession(): boolean;
  /** Removes both elements + any pending hover timers from the DOM. */
  destroy(): void;
}

export interface FloatingAddButtonOptions {
  onClick(href: string, triggerRect: DOMRect | null): void;
}

export function createFloatingAddButton(
  opts: FloatingAddButtonOptions,
): FloatingAddButton {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'plos-cs-add-button';
  button.setAttribute('aria-label', 'Add this URL to PLOS Competition Scraping');
  button.title = 'Add to PLOS Competition Scraping';
  button.textContent = '+';
  button.style.display = 'none';

  const dismiss = document.createElement('button');
  dismiss.type = 'button';
  dismiss.className = 'plos-cs-add-button-dismiss';
  dismiss.setAttribute('aria-label', 'Hide the +Add button for this page');
  dismiss.title = 'Hide for this page';
  dismiss.textContent = '×';
  dismiss.style.display = 'none';

  let currentHref: string | null = null;
  let currentLinkRect: DOMRect | null = null;
  let dismissed = false;
  let showTimer: ReturnType<typeof setTimeout> | null = null;
  let hideTimer: ReturnType<typeof setTimeout> | null = null;

  function clearShowTimer(): void {
    if (showTimer !== null) {
      clearTimeout(showTimer);
      showTimer = null;
    }
  }

  function clearHideTimer(): void {
    if (hideTimer !== null) {
      clearTimeout(hideTimer);
      hideTimer = null;
    }
  }

  function hideNow(): void {
    clearShowTimer();
    clearHideTimer();
    currentHref = null;
    currentLinkRect = null;
    button.style.display = 'none';
    dismiss.style.display = 'none';
  }

  function scheduleHide(): void {
    // If a hide is already pending, let it run rather than restarting it —
    // restarting could indefinitely defer the hide if the cursor jitters.
    if (hideTimer !== null) return;
    hideTimer = setTimeout(() => {
      hideTimer = null;
      hideNow();
    }, HIDE_GRACE_MS);
  }

  function position(link: HTMLElement): void {
    const rect = link.getBoundingClientRect();
    // Upper-right corner of the link bbox per §5 guardrail #4.
    // Pin the button so a 24-px-wide circle sits half over the link's
    // right edge; the dismiss × hangs to the right of the button.
    const top = Math.max(2, rect.top - 8);
    const left = Math.max(2, rect.right - 12);
    button.style.top = `${top}px`;
    button.style.left = `${left}px`;
    dismiss.style.top = `${top + 2}px`;
    dismiss.style.left = `${left + 22}px`;
  }

  function reposition(): void {
    if (currentHref === null) return;
    // The DOM element associated with currentHref may have moved due to
    // host-page reflow; we don't store the link reference because relayout
    // could orphan it. Instead the orchestrator re-anchors on every
    // showFor() call — this function exists only to allow scroll
    // repositioning where we re-read getBoundingClientRect of the
    // element under the cursor (handled by the orchestrator).
  }
  void reposition;

  button.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (currentHref !== null) opts.onClick(currentHref, currentLinkRect);
  });

  dismiss.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    dismissed = true;
    hideNow();
  });

  // Cursor-over-button cancels any pending hide so the user can reach the
  // button after the link's mouseleave fires. Cursor-off-button schedules
  // the same grace timer that link-mouseleave uses. The dismiss × overlaps
  // the "+" by 2px so cursor traversal between the two doesn't fire a
  // mouseleave; we still register listeners on both for safety.
  button.addEventListener('mouseenter', clearHideTimer);
  button.addEventListener('mouseleave', scheduleHide);
  dismiss.addEventListener('mouseenter', clearHideTimer);
  dismiss.addEventListener('mouseleave', scheduleHide);

  document.body.appendChild(button);
  document.body.appendChild(dismiss);

  return {
    showFor(link, href) {
      if (dismissed) return;
      // Cursor is now on a link — cancel any pending hide from a previous
      // mouseleave so the button stays alive across link-to-link traversal.
      clearHideTimer();
      clearShowTimer();
      showTimer = setTimeout(() => {
        if (dismissed) return;
        currentHref = href;
        currentLinkRect = link.getBoundingClientRect();
        position(link);
        button.style.display = 'block';
        dismiss.style.display = 'block';
      }, HOVER_DELAY_MS);
    },
    hide() {
      // Schedule a short delayed hide rather than hiding immediately. The
      // button's own mouseenter cancels this timer so the cursor can
      // traverse from link → button without losing the button.
      scheduleHide();
    },
    isDismissedForSession() {
      return dismissed;
    },
    destroy() {
      clearShowTimer();
      clearHideTimer();
      button.remove();
      dismiss.remove();
    },
  };
}
