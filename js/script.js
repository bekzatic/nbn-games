/* ==========================================================
   NBN GAMES — Assignment 6: jQuery (site-wide features)
   Team Next Step: Bekzat Amanbek · Nurkhan Nurzhau · Nursultan Rassulov

   Loaded in <head> right after jQuery on EVERY page.
   Everything that touches the page runs inside $(document).ready(),
   so the DOM is fully built before we select anything.

   Task 0  $(document).ready + console message ............ (bottom)
   Task 4  Scroll progress bar ............................ initScrollProgress()
   Task 5  Animated number counter ........................ initCounters()
   Task 6  Loading spinner on submit ...................... NBN.withSpinner()
   Task 7  Notification system (toasts that fade out) ..... NBN.notify()
   Task 8  "Copy" buttons + "Copied to clipboard!" ........ initCopyButtons()
   Task 9  Image lazy loading ............................. initLazyImages()
   Helper for Task 3 (search highlighting) ................ NBN.highlight()
   ========================================================== */

(function ($) {
  'use strict';

  const NBN = window.NBN = window.NBN || {};
  const reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- small helpers ---------- */
  const escapeHtml = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const escapeRegExp = s => String(s).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  NBN.escapeHtml = escapeHtml;
  NBN.escapeRegExp = escapeRegExp;

  /* ==========================================================
     Task 3 helper — highlight every match of `query` inside elements.
     The original text is saved once with .data(), then the element
     is reset with .html(), the text is split by a RegExp and every
     match is .wrap()-ped in <mark class="hl">. Returns the number of marks.
     (markText() builds the same marks as an HTML string — used by the
     autocomplete list.)
     ========================================================== */
  NBN.markText = function (text, query) {
    if (!query) return escapeHtml(text);
    const re = new RegExp('(' + escapeRegExp(query) + ')', 'gi');
    // split() with a capture group → odd indexes are the matches
    return text.split(re).map((part, i) => (i % 2 ? '<mark class="hl">' + escapeHtml(part) + '</mark>' : escapeHtml(part))).join('');
  };

  NBN.highlight = function ($elements, query) {
    let total = 0;
    const re = query ? new RegExp('(' + escapeRegExp(query) + ')', 'gi') : null;
    $elements.each(function () {
      const $el = $(this);
      if ($el.data('hl-original') === undefined) $el.data('hl-original', $el.text());
      const original = $el.data('hl-original');
      $el.html(escapeHtml(original));                 // .html() — restore the clean text (removes old marks)
      if (!re) return;

      // split() by the RegExp (capture group) → odd pieces are the matches.
      // Every piece becomes a text node; each match is .wrap()-ped in <mark class="hl">.
      $el.empty();
      original.split(re).forEach(function (part, i) {
        if (!part) return;
        const node = document.createTextNode(part);
        $el.append(node);
        if (i % 2) { $(node).wrap('<mark class="hl"></mark>'); total++; }
      });
      // inside a flex box (e.g. the FAQ buttons) loose text + <mark> would lose their spaces → keep them in one span
      if (/flex/.test($el.css('display'))) $el.contents().wrapAll('<span class="hl-line"></span>');
    });
    return total;
  };

  /* ==========================================================
     Task 7 — Notification system
     NBN.notify(text, type) shows a small toast in the corner that
     slides in with .fadeIn(), waits, then disappears with .fadeOut().
     type: 'success' | 'error' | 'info' | 'cart' | 'heart'
     Hovering a toast pauses it; × closes it at once.
     ========================================================== */
  const ICONS = { success: '✓', error: '!', info: 'i', cart: '🛒', heart: '♥', copy: '📋' };
  const TOAST_TIME = 3200;
  let $toastBox = null;

  NBN.notify = function (text, type) {
    type = ICONS[type] ? type : 'info';
    if (!$toastBox) {
      $toastBox = $('<div>', { 'class': 'nbn-toasts', role: 'status', 'aria-live': 'polite' }).appendTo('body');
    }
    // at most 4 toasts on screen — the oldest one leaves first
    const $old = $toastBox.children('.nbn-toast');
    if ($old.length >= 4) $old.first().stop(true).fadeOut(150, function () { $(this).remove(); });

    const $toast = $(
      '<div class="nbn-toast nbn-toast--' + type + '">' +
        '<span class="nbn-toast__icon" aria-hidden="true">' + ICONS[type] + '</span>' +
        '<span class="nbn-toast__text"></span>' +
        '<button type="button" class="nbn-toast__close" aria-label="Close notification">×</button>' +
        '<span class="nbn-toast__timer" aria-hidden="true"></span>' +
      '</div>'
    );
    $toast.find('.nbn-toast__text').text(text);           // .text() → safe, no HTML injection
    $toast.hide().appendTo($toastBox).fadeIn(250);

    // the thin line at the bottom shrinks while the toast is waiting
    const $timer = $toast.find('.nbn-toast__timer');
    $timer.css('width', '100%').animate({ width: 0 }, TOAST_TIME, 'linear');

    let timer;
    const close = () => {
      clearTimeout(timer);
      $toast.stop(true).fadeOut(400, function () { $(this).remove(); });
    };
    const start = ms => { timer = setTimeout(close, ms); };
    start(TOAST_TIME);

    $toast.on('mouseenter', () => { clearTimeout(timer); $timer.stop(true); })
          .on('mouseleave', () => { $timer.animate({ width: 0 }, 1200, 'linear'); start(1200); });
    $toast.find('.nbn-toast__close').on('click', close);
    return $toast;
  };
  window.notify = NBN.notify;

  /* ==========================================================
     Task 6 — Loading spinner on submit
     NBN.withSpinner(button, ms, done):
       1. the button shows a spinner + "Please wait…"
       2. it is disabled → no repeated clicks
       3. after `ms` (a fake server call) it returns to normal and
          the `done` callback runs.
     Forms with data-spinner="Success text" use it automatically.
     ========================================================== */
  NBN.withSpinner = function (button, ms, done) {
    const $btn = $(button);
    if ($btn.data('busy')) return;                         // already waiting
    $btn.data('busy', true).data('label', $btn.html());
    $btn.prop('disabled', true).attr('aria-busy', 'true').addClass('is-loading')
        .html('<span class="spinner-border spinner-border-sm me-2" aria-hidden="true"></span>Please wait…');

    setTimeout(function () {
      $btn.html($btn.data('label')).prop('disabled', false).removeAttr('aria-busy').removeClass('is-loading').data('busy', false);
      if (typeof done === 'function') done();
    }, ms || 1800);
  };

  function initSpinnerForms() {
    $('form[data-spinner]').on('submit', function (e) {
      e.preventDefault();
      const form = this;
      const $form = $(form);
      if (!form.checkValidity()) {                         // let the browser show what is wrong
        form.reportValidity();
        NBN.notify('Please check the form — something is missing.', 'error');
        return;
      }
      NBN.withSpinner($form.find('[type="submit"]'), 1800, function () {
        form.reset();
        if (window.SoundFX) SoundFX.play('success');
        NBN.notify($form.data('spinner') || 'Form submitted successfully!', 'success');
      });
    });
  }

  /* ==========================================================
     Task 4 — Colourful scroll progress bar
     A fixed bar at the very top of the page. On every scroll we
     compute how far the user is:  scrollTop / (page − window) × 100
     and set the bar width with .css(). A small bubble at the tip
     shows the percentage while the user is scrolling.
     ========================================================== */
  function initScrollProgress() {
    const $wrap = $(
      '<div class="scroll-progress" aria-hidden="true">' +
        '<div class="scroll-progress__bar"><span class="scroll-progress__tip">0%</span></div>' +
      '</div>'
    ).prependTo('body');
    const $bar = $wrap.find('.scroll-progress__bar');
    const $tip = $wrap.find('.scroll-progress__tip');
    const $win = $(window);
    let hideTimer;
    let ticking = false;

    function update() {
      ticking = false;
      const max = $(document).height() - $win.height();
      const pct = max > 0 ? Math.min(100, Math.max(0, ($win.scrollTop() / max) * 100)) : 0;
      $bar.css('width', pct + '%');
      $tip.text(Math.round(pct) + '%');
      $wrap.toggleClass('is-done', pct >= 99.5);          // full bar → it glows
    }

    $win.on('scroll', function () {
      if (!ticking) { ticking = true; requestAnimationFrame(update); }
      $wrap.addClass('is-scrolling');
      clearTimeout(hideTimer);
      hideTimer = setTimeout(() => $wrap.removeClass('is-scrolling'), 900);
    });
    $win.on('resize load', update);
    update();
  }

  /* ==========================================================
     Task 5 — Animated number counter
     <span data-count-to="12500" data-suffix="+" data-decimals="0">0</span>
     When the number scrolls into view, jQuery .animate() changes a
     plain object's value from 0 to the target; the `step` callback
     writes every in-between value into the element.
     ========================================================== */
  function formatNumber(value, decimals) {
    return Number(value).toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
  }

  function initCounters() {
    const $counters = $('[data-count-to]');
    if (!$counters.length) return;
    const $win = $(window);

    function runCounter($el) {
      $el.addClass('is-counted');
      const target = parseFloat($el.data('count-to'));
      const decimals = parseInt($el.data('decimals'), 10) || 0;
      const prefix = $el.data('prefix') || '';
      const suffix = $el.data('suffix') || '';
      const write = v => $el.text(prefix + formatNumber(v, decimals) + suffix);

      if (reduceMotion) { write(target); return; }
      $({ value: 0 }).animate({ value: target }, {
        duration: parseInt($el.data('duration'), 10) || 2200,
        easing: 'swing',
        step: now => write(now),
        complete: () => { write(target); $el.addClass('is-finished'); }
      });
    }

    function check() {
      const bottom = $win.scrollTop() + $win.height();
      $counters.not('.is-counted').each(function () {
        const $el = $(this);
        if ($el.offset().top < bottom - 40) runCounter($el);
      });
    }

    $counters.each(function () {                           // start from 0
      const $el = $(this);
      $el.text(($el.data('prefix') || '') + '0' + ($el.data('suffix') || ''));
    });
    $win.on('scroll resize', check);
    check();
  }

  /* ==========================================================
     Task 8 — "Copy" buttons
     <button class="copy-btn" data-copy="NEXTSTEP">📋</button>
     (data-copy="url" copies the address of the current page)
     Click → text goes to the clipboard, the icon becomes ✓ and a
     tooltip "Copied to clipboard!" appears, then everything returns.
     .on('copy') also catches Ctrl+C on the text snippets.
     ========================================================== */
  let copiedByButton = false;

  function copyText(text) {
    if (navigator.clipboard && window.isSecureContext) {
      // modern Clipboard API; if the browser refuses or does not answer quickly
      // (e.g. the page is not focused) → the old way below
      return new Promise((resolve, reject) => {
        let settled = false;
        const fallback = () => {
          if (settled) return;
          settled = true;
          copyTextOld(text).then(resolve, reject);
        };
        const timer = setTimeout(fallback, 700);
        navigator.clipboard.writeText(text).then(() => {
          if (settled) return;
          settled = true;
          clearTimeout(timer);
          resolve();
        }, () => { clearTimeout(timer); fallback(); });
      });
    }
    return copyTextOld(text);
  }

  // old way for http:// or file:// pages: select a hidden textarea and run "copy"
  function copyTextOld(text) {
    return new Promise((resolve, reject) => {
      const $tmp = $('<textarea readonly class="copy-tmp"></textarea>').val(text).appendTo('body');
      $tmp[0].select();
      copiedByButton = true;
      const ok = document.execCommand('copy');
      copiedByButton = false;
      $tmp.remove();
      ok ? resolve() : reject(new Error('copy failed'));
    });
  }

  function showCopied($btn) {
    clearTimeout($btn.data('copy-timer'));
    if ($btn.data('icon') === undefined) $btn.data('icon', $btn.html());
    // icon-only button → "✓", button with a text label → "✓ Copied"
    const hasLabel = $('<div>').html($btn.data('icon')).text().trim().length > 2;
    $btn.addClass('is-copied').html('<span aria-hidden="true">✓</span>' + (hasLabel ? ' Copied' : ''));

    let $tip = $btn.find('.copy-tip');
    if (!$tip.length) $tip = $('<span class="copy-tip" role="status">Copied to clipboard!</span>');
    $tip.appendTo($btn).stop(true).hide().fadeIn(150);

    $btn.data('copy-timer', setTimeout(function () {
      $tip.fadeOut(250, function () {
        $btn.removeClass('is-copied').html($btn.data('icon'));
      });
    }, 1800));
  }

  function initCopyButtons() {
    $(document).on('click', '.copy-btn', function (e) {
      e.preventDefault();
      const $btn = $(this);
      let text = $btn.attr('data-copy');
      if (text === 'url') text = location.href;
      if (!text && $btn.attr('data-copy-target')) text = $($btn.attr('data-copy-target')).text().trim();
      if (!text) return;

      copyText(text).then(function () {
        showCopied($btn);
        if (window.SoundFX) SoundFX.play('click');
        NBN.notify('Copied “' + (text.length > 40 ? text.slice(0, 40) + '…' : text) + '” to clipboard', 'copy');
      }).catch(function () {
        NBN.notify('Could not copy — please select the text and press Ctrl+C', 'error');
      });
    });

    // .on('copy') — the user selected part of a snippet and pressed Ctrl+C / right-click → Copy
    $(document).on('copy', function () {
      if (copiedByButton) return;                          // our own button already reported it
      const sel = window.getSelection();
      const node = sel && sel.anchorNode;
      const el = node && (node.nodeType === 1 ? node : node.parentElement);
      const $snippet = el ? $(el).closest('.copy-snippet') : $();
      if (!$snippet.length || !sel.toString().trim()) return;
      const $btn = $snippet.find('.copy-btn');
      if ($btn.length) showCopied($btn.first());
      NBN.notify('Copied to clipboard!', 'copy');
    });
  }

  /* ==========================================================
     Task 9 — Image lazy loading
     <img class="lazy" src="(tiny placeholder)" data-src="images/real.jpg">
     The real picture is loaded only when the image comes close to
     the screen: on scroll() we compare its .offset().top with the
     window position and then swap .attr('src', data-src).
     ========================================================== */
  function initLazyImages() {
    const $win = $(window);
    const total = $('img.lazy').length;
    if (!total) return;
    let loaded = 0;
    let ticking = false;
    const $status = $('#lazy-status');

    function updateStatus() {
      if ($status.length) $status.text('🖼 ' + loaded + ' / ' + total + ' covers loaded');
    }

    function check() {
      ticking = false;
      const top = $win.scrollTop() - 200;                   // 200px "early start" above…
      const bottom = $win.scrollTop() + $win.height() + 200; // …and below the screen
      $('img.lazy[data-src]').each(function () {
        const $img = $(this);
        if (!$img.is(':visible')) return;                    // hidden by a catalog filter → wait
        const imgTop = $img.offset().top;
        const imgBottom = imgTop + $img.outerHeight();
        if (imgBottom < top || imgTop > bottom) return;      // still far away

        const real = $img.attr('data-src');
        $img.removeAttr('data-src')
            .one('load', function () { $img.addClass('is-loaded'); })
            .one('error', function () { $img.addClass('is-loaded is-broken'); })
            .attr('src', real);
        loaded++;
        console.log('[lazy] loaded ' + real + ' (' + loaded + '/' + total + ')');
      });
      updateStatus();
    }
    const schedule = () => { if (!ticking) { ticking = true; requestAnimationFrame(check); } };

    $win.scroll(schedule);                                      // .scroll() — check on every scroll
    $win.on('resize load', schedule);
    $(document).on('lazy:check catalog:refresh', schedule);   // catalog filters show new cards
    updateStatus();
    check();
  }

  /* ==========================================================
     Task 0 — $(document).ready()
     ========================================================== */
  $(document).ready(function () {
    console.log('jQuery is ready!', 'version ' + $.fn.jquery);

    initScrollProgress();
    initCounters();
    initSpinnerForms();
    initCopyButtons();
    initLazyImages();
  });
})(jQuery);
