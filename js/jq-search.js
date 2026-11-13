/* ==========================================================
   jQuery search features
   Pages: catalog.html (autocomplete + highlighting) and about.html (FAQ search)

   - Live filter of the catalog cards → js/catalog.js
   - Autocomplete: a dropdown with up to 6 games under the catalog
     search box. Mouse or ↑ ↓ + Enter to choose, Esc to close.
   - Highlighting: every match is wrapped in <mark class="hl">
     (NBN.highlight in js/script.js: .html() + RegExp + .wrap()):
       • catalog: game titles on the cards
       • about:   all FAQ questions and answers
   ========================================================== */

(function () {
  'use strict';

  $(document).ready(function () {
    initAutocomplete();
    initCatalogHighlight();
    initFaqSearch();
  });

  /* ==========================================================
     Autocomplete under the catalog search box
     ========================================================== */
  function initAutocomplete() {
    const $input = $('#catalog-search');
    const $list = $('#search-suggestions');
    if (!$input.length || !$list.length) return;

    // the list of games comes from the same data as the cards (data/games.json)
    let games = [];
    NBN.loadGames().then(function (data) {
      games = data.map(g => ({ title: g.title, developer: g.developer, img: g.img, genre: g.genreLabel, price: g.price, href: 'game.html?id=' + g.id }));
    }).catch(function () { /* the catalog already shows the error message */ });

    let items = [];          // suggestions shown now
    let active = -1;         // index of the highlighted suggestion

    function close() {
      $list.prop('hidden', true).empty();
      $input.attr('aria-expanded', 'false').removeAttr('aria-activedescendant');
      items = [];
      active = -1;
    }

    // moves the highlight to suggestion number `index` (wraps around at the ends)
    function setActive(index) {
      const $options = $list.children('.ac-item');
      if (!$options.length) return;
      active = (index + $options.length) % $options.length;
      $options.removeClass('is-active').attr('aria-selected', 'false');
      const $current = $options.eq(active).addClass('is-active').attr('aria-selected', 'true');
      $input.attr('aria-activedescendant', $current.attr('id'));
      $current[0].scrollIntoView({ block: 'nearest' });       // keep it visible inside the list
    }

    function choose(index) {
      const game = items[index];
      if (!game) return;
      close();
      window.Catalog.search(game.title);                       // filter the catalog to this game
      if (window.SoundFX) SoundFX.play('click');
      NBN.notify('Showing “' + game.title + '”', 'info');
    }

    // builds the dropdown for the typed text
    function render(query) {
      const q = query.trim().toLowerCase();
      if (!q) { close(); return; }

      // games whose title STARTS with the text come first, then the ones that only contain it
      items = games
        .filter(g => g.title.toLowerCase().includes(q) || g.developer.toLowerCase().includes(q))   // like the catalog search
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
            .attr({ id: 'ac-option-' + i, 'data-index': i })
            .append($('<img alt="" class="ac-thumb">').attr('src', g.img))
            .append(
              $('<span class="ac-text"></span>')
                .append($('<span class="ac-title"></span>').html(NBN.markText(g.title, query.trim())))
                // found by the developer (not the title)? → show the developer, so the user sees why
                .append($('<span class="ac-meta"></span>').text(g.genre + (g.title.toLowerCase().includes(q) ? '' : ' · ' + g.developer) + ' · ' + NBN.formatPrice(g.price)))
            )
            // "→" opens the game page; a <span>, not a link: an option must not contain another control
            .append($('<span class="ac-open" title="Open game page" aria-hidden="true">→</span>').attr('data-href', g.href))
            .appendTo($list);
        });
        $('<li class="ac-hint" aria-hidden="true">↑ ↓ to move · Enter to choose · Esc to close</li>').appendTo($list);
      }
      active = -1;
      $list.prop('hidden', false);
      $input.attr('aria-expanded', 'true');
    }

    // typing → new suggestions (arrow / enter / escape keys are handled in keydown)
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
          e.stopPropagation();          // the first Esc only closes the list (the second clears the search)
          close();
          break;
        case 'Tab': close(); break;
      }
    });

    // delegated events: the <li> items are created again on every key
    // (mousedown, so the input does not lose focus before we read the choice)
    $list.on('mousedown', '.ac-item', function (e) {
      e.preventDefault();
      const $open = $(e.target).closest('.ac-open');
      if ($open.length) { location.href = $open.attr('data-href'); return; }   // → opens the game page
      choose(Number($(this).attr('data-index')));
    });
    $list.on('mouseenter', '.ac-item', function () { setActive(Number($(this).attr('data-index'))); });

    // click anywhere else → close
    $(document).on('mousedown', function (e) {
      if (!$(e.target).closest('#search-box').length) close();
    });
  }

  /* ==========================================================
     Highlighting inside the catalog cards
     catalog.js triggers "catalog:refresh" after every filter change
     (and once after the cards are built), with the search text.
     ========================================================== */
  function initCatalogHighlight() {
    if (!$('#catalog-content').length) return;
    $(document).on('catalog:refresh', function (e, visible, query) {
      // looked up every time: the cards are created by catalog.js after the data loads
      NBN.highlight($('#catalog-content .card-title'), (query || '').trim());   // the titles (the meta line has icons)
    });
  }

  /* ==========================================================
     FAQ search with highlighting (about.html)
     ========================================================== */
  function initFaqSearch() {
    const $input = $('#faq-search');
    const $faq = $('#faq');
    if (!$input.length || !$faq.length) return;

    const $info = $('#faq-search-info');
    const defaultInfo = $info.text();
    const $items = $faq.find('.accordion-item');     // cached once: the FAQ does not change
    let timer;

    function openPanel($item, open) {
      const $btn = $item.find('.accordion-button');
      const $panel = $item.find('.accordion-collapse');
      $btn.attr('aria-expanded', open ? 'true' : 'false').toggleClass('collapsed', !open);
      if (open) $panel.removeClass('collapse').addClass('show').stop(true, true).slideDown(200);
      else $panel.stop(true, true).slideUp(200, function () { $panel.addClass('collapse').removeClass('show').css('display', ''); });
    }

    // highlights the text in every question + answer and opens the answers that contain it
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
        if (q) openPanel($item, inAnswer > 0);
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
})();
