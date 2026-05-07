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

const HOVER_DELAY_MS = 300;

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
  onClick(href: string): void;
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
  let dismissed = false;
  let showTimer: ReturnType<typeof setTimeout> | null = null;

  function clearShowTimer(): void {
    if (showTimer !== null) {
      clearTimeout(showTimer);
      showTimer = null;
    }
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
    if (currentHref !== null) opts.onClick(currentHref);
  });

  dismiss.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    dismissed = true;
    clearShowTimer();
    button.style.display = 'none';
    dismiss.style.display = 'none';
  });

  document.body.appendChild(button);
  document.body.appendChild(dismiss);

  return {
    showFor(link, href) {
      if (dismissed) return;
      clearShowTimer();
      showTimer = setTimeout(() => {
        if (dismissed) return;
        currentHref = href;
        position(link);
        button.style.display = 'block';
        dismiss.style.display = 'block';
      }, HOVER_DELAY_MS);
    },
    hide() {
      clearShowTimer();
      currentHref = null;
      button.style.display = 'none';
      dismiss.style.display = 'none';
    },
    isDismissedForSession() {
      return dismissed;
    },
    destroy() {
      clearShowTimer();
      button.remove();
      dismiss.remove();
    },
  };
}
