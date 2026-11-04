/* ==========================================================
   NBN GAMES — Assignment 6, Part 1: jQuery Search
   Pages: catalog.html (Tasks 1–3) and about.html (Task 3, FAQ)

   Task 1  Real-time search + live filter → js/catalog.js
           (.on('keyup') + jQuery .filter() on the game cards)
   Task 2  Autocomplete suggestions — a dropdown under the catalog
           search box, built from the game cards on the page.
           Mouse or ↑ ↓ + Enter to choose, Esc to close.
   Task 3  Search highlighting — every match is wrapped in
           <mark class="hl"> with .html() + RegExp:
           • catalog: game titles and platforms of the cards
           • about:   all FAQ questions and answers
   ========================================================== */

(function ($) {
  'use strict';

  const NBN = window.NBN;

  $(document).ready(function () {
    initAutocomplete();
    initCatalogHighlight();
    initFaqSearch();
  });

  /* ==========================================================
     Task 2 — Autocomplete
     ========================================================== */
  function initAutocomplete() {
    const $input = $('#catalog-search');
    const $list = $('#search-suggestions');
    if (!$input.length || !$list.length) return;

    // 1. collect all games from the cards: title, cover, genre, price, link
    const seen = {};
    const games = $('#catalog-content .game-col').map(function () {
      const $col = $(this);
      const title = $col.find('.card-title').data('hl-original') || $col.find('.card-title').text().trim();
      if (seen[title]) return null;                  // the same game can't be suggested twice
      seen[title] = true;
      const $img = $col.find('img');
      return {
        title: title,
        img: $img.attr('data-src') || $img.attr('src'),
        genre: $col.closest('[data-genre-section]').find('h2 span').last().text(),
        price: $col.find('.add-to-cart-btn').data('price'),
        href: $col.find('a[href^="game.html"]').first().attr('href')
      };
    }).get();

    let items = [];          // suggestions shown now
    let active = -1;         // index of the highlighted suggestion

    const formatPrice = p => Number(p).toLocaleString('ru-RU') + ' ₸';

    function close() {
      $list.prop('hidden', true).empty();
      $input.attr('aria-expanded', 'false').removeAttr('aria-activedescendant');
      items = [];
      active = -1;
    }

    function setActive(index) {
      const $options = $list.children('.ac-item');
      if (!$options.length) return;
      active = (index + $options.length) % $options.length;      // wrap around
      $options.removeClass('is-active').attr('aria-selected', 'false');
      const $current = $options.eq(active).addClass('is-active').attr('aria-selected', 'true');
      $input.attr('aria-activedescendant', $current.attr('id'));
      // keep the active item visible inside the list
      const el = $current[0];
      if (el.scrollIntoView) el.scrollIntoView({ block: 'nearest' });
    }

    function choose(index) {
      const game = items[index];
      if (!game) return;
      close();
      window.Catalog.search(game.title);                       // filter the catalog to this game
      if (window.SoundFX) SoundFX.play('click');
      NBN.notify('Showing “' + game.title + '”', 'info');
    }

    function render(query) {
      const q = query.trim().toLowerCase();
      if (!q) { close(); return; }

      // games whose title starts with the text come first, then "contains"
      items = games
        .filter(g => g.title.toLowerCase().includes(q))
        .sort((a, b) => (b.title.toLowerCase().startsWith(q) - a.title.toLowerCase().startsWith(q)) || a.title.localeCompare(b.title))
        .slice(0, 6);

      $list.empty();
      if (!items.length) {
        $('<li class="ac-empty" role="option" aria-disabled="true"></li>')
          .text('No games found for “' + query.trim() + '”')
          .appendTo($list);
      } else {
        $.each(items, function (i, g) {
          $('<li class="ac-item" role="option" aria-selected="false"></li>')
            .attr('id', 'ac-option-' + i)
            .attr('data-index', i)
            .append($('<img alt="" class="ac-thumb">').attr('src', g.img))
            .append(
              $('<span class="ac-text"></span>')
                .append($('<span class="ac-title"></span>').html(NBN.markText(g.title, query.trim())))
                .append($('<span class="ac-meta"></span>').text(g.genre + ' · ' + formatPrice(g.price)))
            )
            .append($('<a class="ac-open" title="Open game page" aria-label="Open the game page">→</a>').attr('href', g.href))
            .appendTo($list);
        });
        $('<li class="ac-hint" aria-hidden="true">↑ ↓ to move · Enter to choose · Esc to close</li>').appendTo($list);
      }
      active = -1;
      $list.prop('hidden', false);
      $input.attr('aria-expanded', 'true');
    }

    // typing → new suggestions (arrow / enter / escape keys are handled below)
    $input.on('keyup', function (e) {
      if (['ArrowDown', 'ArrowUp', 'Enter', 'Escape', 'Tab'].indexOf(e.key) !== -1) return;
      render($input.val());
    });
    $input.on('focus', function () { if ($input.val().trim()) render($input.val()); });

    $input.on('keydown', function (e) {
      if ($list.prop('hidden')) {
        if (e.key === 'ArrowDown' && $input.val().trim()) { render($input.val()); setActive(0); e.preventDefault(); }
        return;
      }
      switch (e.key) {
        case 'ArrowDown': e.preventDefault(); setActive(active + 1); break;
        case 'ArrowUp':   e.preventDefault(); setActive(active - 1); break;
        case 'Enter':
          if (active >= 0) { e.preventDefault(); choose(active); }
          else close();
          break;
        case 'Escape':
          e.preventDefault();
          e.stopPropagation();          // first Esc only closes the list
          close();
          break;
        case 'Tab': close(); break;
      }
    });

    // click on a suggestion (mousedown, so the input does not lose focus first)
    $list.on('mousedown', '.ac-item', function (e) {
      if ($(e.target).closest('.ac-open').length) return;   // the → link opens the game page
      e.preventDefault();
      choose(Number($(this).attr('data-index')));
    });
    $list.on('mouseenter', '.ac-item', function () { setActive(Number($(this).attr('data-index'))); });

    // click anywhere else → close
    $(document).on('mousedown', function (e) {
      if (!$(e.target).closest('#search-box').length) close();
    });
    // the "search" event fires when the × inside the field clears it
    $input.on('search', function () { if (!$input.val()) close(); });
  }

  /* ==========================================================
     Task 3 — Highlighting in the catalog cards
     ========================================================== */
  function initCatalogHighlight() {
    if (!$('#catalog-content').length) return;
    const $targets = $('#catalog-content .game-col .card-title, #catalog-content .game-col .card-text');

    $(document).on('catalog:refresh', function (e, visible, query) {
      NBN.highlight($targets, (query || '').trim());
    });
    // the page may open with ?q=... already in the address
    NBN.highlight($targets, ($('#catalog-search').val() || '').trim());
  }

  /* ==========================================================
     Task 3 — FAQ search with highlighting (about.html)
     ========================================================== */
  function initFaqSearch() {
    const $input = $('#faq-search');
    const $faq = $('#faq');
    if (!$input.length || !$faq.length) return;

    const $info = $('#faq-search-info');
    const defaultInfo = $info.text();
    const $items = $faq.find('.accordion-item');
    let timer;

    function openPanel($item, open) {
      const $btn = $item.find('.accordion-button');
      const $panel = $item.find('.accordion-collapse');
      $btn.attr('aria-expanded', open ? 'true' : 'false').toggleClass('collapsed', !open);
      if (open) $panel.removeClass('collapse').addClass('show').stop(true, true).slideDown(200);
      else $panel.stop(true, true).slideUp(200, function () { $panel.addClass('collapse').removeClass('show').css('display', ''); });
    }

    function search() {
      const q = $input.val().trim();
      let total = 0;
      let questions = 0;

      $items.each(function () {
        const $item = $(this);
        const inQuestion = NBN.highlight($item.find('.accordion-button'), q);
        const inAnswer = NBN.highlight($item.find('.accordion-body'), q);
        const found = inQuestion + inAnswer;
        total += found;
        if (found) questions++;

        $item.toggleClass('faq-match', !!(q && found))
             .toggleClass('faq-dim', !!(q && !found));
        if (q) openPanel($item, inAnswer > 0);          // show the answers that contain the word
      });

      if (!q) {
        $items.each(function () { openPanel($(this), false); });
        $info.text(defaultInfo);
      } else if (!total) {
        $info.text('No matches for “' + q + '”.');
      } else {
        $info.text(total + (total === 1 ? ' match' : ' matches') + ' in ' + questions + (questions === 1 ? ' question' : ' questions') + '.');
      }
    }

    // small delay → we don't rebuild the FAQ on every single key while typing fast
    $input.on('keyup input search', function () {
      clearTimeout(timer);
      timer = setTimeout(search, 120);
    });
    $input.on('keydown', function (e) {
      if (e.key === 'Escape' && $input.val()) { $input.val(''); search(); }
    });
  }
})(jQuery);
