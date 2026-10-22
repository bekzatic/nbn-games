/* ==========================================================
   Assignment #4 — Task 2: Accordion for FAQs
   Author: Nurkhan Nurzhau
   Page: about.html → "Questions people ask us" (.js-accordion)

   The markup uses Bootstrap's accordion classes (accordion-item,
   accordion-button, accordion-collapse, collapse, collapsing), but there
   is NO data-bs-toggle: the opening/closing is written by us here.

   How it works:
   1. Every answer starts with the class `collapse` → Bootstrap hides it
      (display: none). That is the default hidden state.
   2. Click on a question:
      - open:  remove `collapse`, add `collapsing` (Bootstrap gives it
               `transition: height .35s`), animate height 0 → scrollHeight,
               then finish with `collapse show`.
      - close: the same in reverse: height scrollHeight → 0.
   3. Only one answer is open at a time.
   4. The button gets/loses the `collapsed` class (Bootstrap turns the
      arrow) and aria-expanded is updated for screen readers.
   ========================================================== */

(function () {
  document.querySelectorAll('.js-accordion').forEach(acc => {
    const buttons = acc.querySelectorAll('.accordion-button');
    const panelOf = btn => document.getElementById(btn.getAttribute('aria-controls'));

    function animate(panel, from, to, done) {
      panel.classList.remove('collapse', 'show');
      panel.classList.add('collapsing');
      panel.style.height = from + 'px';
      void panel.offsetHeight;          // force reflow so the transition starts
      panel.style.height = to + 'px';
      panel.addEventListener('transitionend', function end() {
        panel.removeEventListener('transitionend', end);
        panel.classList.remove('collapsing');
        panel.style.height = '';
        done();
      });
    }

    function open(btn) {
      const panel = panelOf(btn);
      btn.classList.remove('collapsed');
      btn.setAttribute('aria-expanded', 'true');
      panel.classList.remove('collapse');
      const h = panel.scrollHeight;     // real height of the answer
      animate(panel, 0, h, () => panel.classList.add('collapse', 'show'));
    }

    function close(btn) {
      const panel = panelOf(btn);
      btn.classList.add('collapsed');
      btn.setAttribute('aria-expanded', 'false');
      animate(panel, panel.scrollHeight, 0, () => panel.classList.add('collapse'));
    }

    buttons.forEach(btn => {
      btn.addEventListener('click', () => {
        if (panelOf(btn).classList.contains('collapsing')) return; // wait for the animation
        const isOpen = btn.getAttribute('aria-expanded') === 'true';
        buttons.forEach(other => {
          if (other !== btn && other.getAttribute('aria-expanded') === 'true') close(other);
        });
        isOpen ? close(btn) : open(btn);
      });
    });
  });
})();
