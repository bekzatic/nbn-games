/* ==========================================================
   script.js — site-wide jQuery features (every page)
   Team Next Step: Bekzat Amanbek · Nurkhan Nurzhau · Nursultan Rassulov

   Loaded right after jQuery. Everything that touches the page runs
   inside $(document).ready(), so the HTML is fully built first.
   Other scripts use the helpers through the global NBN object.

   NBN.highlight() / markText()  search highlighting (<mark class="hl">)
   NBN.notify()                  toast notifications that fade out
   NBN.withSpinner()             "Please wait…" spinner on a submit button
   initScrollProgress()          colourful progress bar at the top
   initCounters()                numbers that count up when they appear
   initCopyButtons()             "Copy" buttons → ✓ + "Copied to clipboard!"
   initLazyImages()              pictures load only when they come into view
   ========================================================== */

(function () {
  'use strict';

  const NBN = window.NBN = window.NBN || {};
  const reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- small helpers ---------- */
  // text → safe HTML: < > & " ' become entities, so data can never add tags
  const escapeHtml = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  // user text → literal RegExp: "C++" must search for "C++", not mean "one or more C"
  const escapeRegExp = s => String(s).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  NBN.escapeHtml = escapeHtml;

  /* ==========================================================
     Search highlighting
     NBN.highlight($elements, query) — marks every match inside the
     elements and returns how many marks were added:
       1. the original text is saved once with .data();
       2. .html() resets the element to that clean text;
       3. the text is split by a RegExp; every match becomes a text
          node that is .wrap()-ped in <mark class="hl">.
     NBN.markText(text, query) builds the same marks as an HTML string
     (used by the autocomplete list).
     ========================================================== */
  NBN.markText = function (text, query) {
    if (!query) return escapeHtml(text);
    const re = new RegExp('(' + escapeRegExp(query) + ')', 'gi');
    // split() with a capture group keeps the matches: odd indexes are the matches
    return text.split(re).map((part, i) => (i % 2 ? '<mark class="hl">' + escapeHtml(part) + '</mark>' : escapeHtml(part))).join('');
  };

  NBN.highlight = function ($elements, query) {
    let total = 0;
    const re = query ? new RegExp('(' + escapeRegExp(query) + ')', 'gi') : null;
    $elements.each(function () {
      const $el = $(this);
      if ($el.data('hl-original') === undefined) $el.data('hl-original', $el.text());
      const original = $el.data('hl-original');
      $el.html(escapeHtml(original));                 // restore the clean text (removes old marks)
      if (!re) return;

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
     Toast notifications
     NBN.notify(text, type) adds a small message in the corner that
     appears with .fadeIn(), waits 3.2 s and disappears with .fadeOut().
     type: 'success' | 'error' | 'info' | 'cart' | 'heart' | 'copy'
     Hovering a toast pauses it; × closes it at once.
     ========================================================== */
  const ICONS = { success: '✓', error: '!', info: 'i', cart: '🛒', heart: '♥', copy: '📋' };
  const TOAST_TIME = 3200;
  let $toastBox = null;

  NBN.notify = function (text, type) {
    type = ICONS[type] ? type : 'info';
    if (!$toastBox) {         // the container is created the first time it is needed
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

  /* ==========================================================
     Loading spinner on submit
     NBN.withSpinner(button, ms, done):
       1. the button shows a spinner + "Please wait…";
       2. it is disabled → no repeated clicks;
       3. after `ms` milliseconds (a pretend server call) it returns
          to normal and the `done` callback runs.
     ========================================================== */
  NBN.withSpinner = function (button, ms, done) {
    const $btn = $(button);
    if ($btn.data('busy')) return;                         // already waiting → ignore the click
    $btn.data('busy', true).data('label', $btn.html());    // remember the original label
    $btn.prop('disabled', true).attr('aria-busy', 'true').addClass('is-loading')
        .html('<span class="spinner-border spinner-border-sm me-2" aria-hidden="true"></span>Please wait…');

    setTimeout(function () {
      $btn.html($btn.data('label')).prop('disabled', false).removeAttr('aria-busy').removeClass('is-loading').data('busy', false);
      if (typeof done === 'function') done();
    }, ms || 1800);
  };

  /* ==========================================================
     Scroll progress bar
     A fixed bar at the very top of the page. On every scroll:
       percent = scrollTop / (page height − window height) × 100
     and the width is set with .css(). A bubble at the tip shows the
     percentage while the user is scrolling.
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
      // requestAnimationFrame: recalculate at most once per screen frame, not on every scroll event
      if (!ticking) { ticking = true; requestAnimationFrame(update); }
      $wrap.addClass('is-scrolling');
      clearTimeout(hideTimer);
      hideTimer = setTimeout(() => $wrap.removeClass('is-scrolling'), 900);
    });
    $win.on('resize load', update);
    update();
  }

  /* ==========================================================
     Animated number counter
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
      $el.addClass('is-counted');                          // count every number only once
      const target = parseFloat($el.data('count-to'));
      const decimals = parseInt($el.data('decimals'), 10) || 0;
      const prefix = $el.data('prefix') || '';
      const suffix = $el.data('suffix') || '';
      const write = v => $el.text(prefix + formatNumber(v, decimals) + suffix);

      if (reduceMotion) { write(target); return; }
      // .animate() can change any object, not only CSS: here { value } goes 0 → target
      $({ value: 0 }).animate({ value: target }, {
        duration: parseInt($el.data('duration'), 10) || 2200,
        easing: 'swing',
        step: now => write(now),
        complete: () => { write(target); $el.addClass('is-finished'); }
      });
    }

    // start every counter whose top is above the bottom of the window
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
     "Copy" buttons
     <button class="copy-btn" data-copy="NEXTSTEP">📋</button>
     (data-copy="url" copies the address of the current page)
     Click → the text goes to the clipboard, the icon becomes ✓ and a
     tooltip "Copied to clipboard!" appears, then everything returns.
     .on('copy') also reacts to Ctrl+C on the text snippets.
     ========================================================== */
  let copiedByButton = false;

  // copies text; returns a Promise (resolved = copied, rejected = failed)
  function copyText(text) {
    if (navigator.clipboard && window.isSecureContext) {
      // modern Clipboard API; if the browser refuses or does not answer
      // quickly (e.g. the page is not focused) → the old way below
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
      copiedByButton = true;                               // our own copy → the 'copy' handler below ignores it
      const ok = document.execCommand('copy');
      copiedByButton = false;
      $tmp.remove();
      ok ? resolve() : reject(new Error('copy failed'));
    });
  }

  // ✓ + tooltip on the button for 1.8 s, then the original icon comes back
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
    // one delegated handler for every .copy-btn on the page
    $(document).on('click', '.copy-btn', function (e) {
      e.preventDefault();
      const $btn = $(this);
      let text = $btn.attr('data-copy');
      if (text === 'url') text = location.href;
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
     Image lazy loading
     <img class="lazy" src="(tiny placeholder)" data-src="images/real.jpg">
     The real picture is loaded only when the image comes close to
     the screen: on .scroll() we compare its .offset().top with the
     window position and then swap .attr('src', data-src).
     The images are counted on every check, because the catalog cards
     are created by JavaScript after the page has loaded.
     ========================================================== */
  function initLazyImages() {
    const $win = $(window);
    const $status = $('#lazy-status');
    let ticking = false;

    function updateStatus() {
      const total = $('img.lazy').length;
      const waiting = $('img.lazy[data-src]').length;     // data-src is removed once the picture is loaded
      if ($status.length) $status.text(total ? '🖼 ' + (total - waiting) + ' / ' + total + ' covers loaded' : '');
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
        $img.removeAttr('data-src')                          // never load the same picture twice
            .one('load', function () { $img.addClass('is-loaded'); })
            .one('error', function () { $img.addClass('is-loaded is-broken'); })
            .attr('src', real);
      });
      updateStatus();
    }
    // like the progress bar: at most one check per screen frame
    const schedule = () => { if (!ticking) { ticking = true; requestAnimationFrame(check); } };

    $win.scroll(schedule);                                      // .scroll() — check on every scroll
    $win.on('resize load', schedule);
    $(document).on('catalog:refresh', schedule);              // new / filtered catalog cards
    check();
  }

  /* ==========================================================
     Start: $(document).ready() runs when the HTML is ready
     ========================================================== */
  $(document).ready(function () {
    console.log('jQuery is ready!');

    initScrollProgress();
    initCounters();
    initCopyButtons();
    initLazyImages();
  });
})();
