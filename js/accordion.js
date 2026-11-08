/* ==========================================================
   FAQ accordion (about.html → "Questions people ask us")
   Author: Nurkhan Nurzhau

   The markup uses Bootstrap's accordion classes, but there is NO
   data-bs-toggle: opening and closing is our own jQuery code.
   - One delegated click handler per accordion (works for every question).
   - .slideDown() / .slideUp() animate the answer.
   - aria-expanded is kept up to date for screen readers.
   - Only one answer is open at a time.
   ========================================================== */
(function () {
  'use strict';

  // closes one answer: the arrow turns back and the panel slides up
  function closePanel($button, $panel) {
    $button.attr('aria-expanded', 'false').addClass('collapsed');
    $panel.stop(true, true).slideUp(250, function () {
      $panel.addClass('collapse').removeClass('show').css('display', '');
    });
  }

  // opens one answer: Bootstrap's .collapse would hide it, so we remove it first
  function openPanel($button, $panel) {
    $button.attr('aria-expanded', 'true').removeClass('collapsed');
    $panel.stop(true, true).removeClass('collapse').addClass('show').hide().slideDown(250);
  }

  $(function () {
    $('.js-accordion').each(function () {
      const $accordion = $(this);

      // event delegation: ONE handler on the accordion for all its question buttons
      $accordion.on('click', '.accordion-button', function () {
        const $button = $(this);
        const $panel = $('#' + $button.attr('aria-controls'));
        if (!$panel.length || $panel.is(':animated')) return;   // ignore clicks during the animation

        const willOpen = $button.attr('aria-expanded') !== 'true';

        // close the other open answer first (only one is open at a time)
        $accordion.find('.accordion-button[aria-expanded="true"]').not($button).each(function () {
          const $other = $(this);
          closePanel($other, $('#' + $other.attr('aria-controls')));
        });

        if (willOpen) openPanel($button, $panel);
        else closePanel($button, $panel);
      });
    });
  });
})();
