/* ==========================================================
   Assignment #5 — jQuery FAQ Accordion
   Uses jQuery for DOM selection, delegated events, and slide
   animations while keeping aria-expanded synchronized.
   ========================================================== */
(function ($) {
  'use strict';

  $(function () {
    const $accordions = $('.js-accordion');

    $accordions.each(function () {
      const $accordion = $(this);

      // jQuery event delegation: works for all FAQ buttons in this accordion.
      $accordion.on('click', '.accordion-button', function () {
        const $button = $(this);
        const panelId = $button.attr('aria-controls');
        const $panel = $('#' + panelId);

        if (!$panel.length || $panel.is(':animated')) return;

        const willOpen = $button.attr('aria-expanded') !== 'true';

        // Close other open answers first (single-open accordion behavior).
        $accordion.find('.accordion-button[aria-expanded="true"]').not($button).each(function () {
          const $otherButton = $(this);
          const otherPanelId = $otherButton.attr('aria-controls');
          const $otherPanel = $('#' + otherPanelId);

          $otherButton
            .attr('aria-expanded', 'false')
            .addClass('collapsed');

          $otherPanel.stop(true, true).slideUp(250, function () {
            $otherPanel.addClass('collapse').removeClass('show').css('display', '');
          });
        });

        if (willOpen) {
          $button.attr('aria-expanded', 'true').removeClass('collapsed');
          $panel
            .stop(true, true)
            .removeClass('collapse')
            .addClass('show')
            .hide()
            .slideDown(250);
        } else {
          $button.attr('aria-expanded', 'false').addClass('collapsed');
          $panel.stop(true, true).slideUp(250, function () {
            $panel.addClass('collapse').removeClass('show').css('display', '');
          });
        }
      });
    });
  });
})(jQuery);
