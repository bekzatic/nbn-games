/* ==========================================================
   Assignment #4 — Task 2: Accordion for FAQs
   Author: Nurkhan Nurzhau
   Page: about.html → "Questions people ask us" (.js-accordion)

   How it works:
   1. Every answer (.acc-panel) is hidden by default: height 0.
   2. Clicking a question (.acc-trigger) toggles its panel.
      - open:  height goes from 0 to the real content height (scrollHeight)
      - close: height goes back to 0
      The CSS `transition: height` makes it slide smoothly.
   3. Only one answer is open at a time — opening one closes the others.
   4. aria-expanded is updated for screen readers.
   ========================================================== */

(function () {
  document.querySelectorAll('.js-accordion').forEach(acc => {
    const triggers = acc.querySelectorAll('.acc-trigger');

    function setOpen(trigger, open) {
      const panel = document.getElementById(trigger.getAttribute('aria-controls'));
      trigger.setAttribute('aria-expanded', String(open));
      trigger.closest('.acc-item').classList.toggle('is-open', open);

      if (open) {
        panel.hidden = false;
        void panel.offsetHeight; // force reflow so the transition starts from 0
        panel.style.height = panel.scrollHeight + 'px';
        // after the animation let the panel grow if the window is resized
        panel.addEventListener('transitionend', function done() {
          if (trigger.getAttribute('aria-expanded') === 'true') panel.style.height = 'auto';
          panel.removeEventListener('transitionend', done);
        });
      } else {
        // from "auto" we first need a real number, then animate to 0
        panel.style.height = panel.scrollHeight + 'px';
        void panel.offsetHeight; // force reflow, then animate to 0
        panel.style.height = '0px';
        panel.addEventListener('transitionend', function done() {
          if (trigger.getAttribute('aria-expanded') === 'false') panel.hidden = true;
          panel.removeEventListener('transitionend', done);
        });
      }
    }

    triggers.forEach(trigger => {
      // default state: hidden
      const panel = document.getElementById(trigger.getAttribute('aria-controls'));
      panel.style.height = '0px';
      panel.hidden = true;
      trigger.setAttribute('aria-expanded', 'false');

      trigger.addEventListener('click', () => {
        const isOpen = trigger.getAttribute('aria-expanded') === 'true';
        triggers.forEach(t => { if (t !== trigger && t.getAttribute('aria-expanded') === 'true') setOpen(t, false); });
        setOpen(trigger, !isOpen);
      });
    });
  });
})();
