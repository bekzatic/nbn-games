/* ==========================================================
   Assignment #5 — Language selector (EN / RU / KZ)
   Author: Bekzat Amanbek
   Pages: every Bootstrap page — "EN / RU / KZ" select in the navbar.

   How it works:
   1. DICTIONARY is an OBJECT: English text → { ru, kz }.
   2. translatePage() walks through all text nodes of the page and
      replaces the ones it knows. The original English text is kept
      in a WeakMap, so switching back to EN always works.
   3. setLanguage() uses a SWITCH to choose the language, the
      <html lang> attribute and the message for the toast.
   4. The choice is saved in localStorage; cards that JavaScript adds
      later (Load more, cart…) are translated by a MutationObserver.
   Game titles, descriptions and form texts stay in English.
   ========================================================== */

(function () {
  const KEY = 'nbn-lang';

  const DICTIONARY = {
    'Home':               { ru: 'Главная',            kz: 'Басты бет' },
    'Catalog':            { ru: 'Каталог',            kz: 'Каталог' },
    'About us':           { ru: 'О нас',              kz: 'Біз туралы' },
    'Contact':            { ru: 'Контакты',           kz: 'Байланыс' },
    'Profile':            { ru: 'Профиль',            kz: 'Профиль' },
    'Store':              { ru: 'Магазин',            kz: 'Дүкен' },
    'Company':            { ru: 'Компания',           kz: 'Компания' },
    'Cart':               { ru: 'Корзина',            kz: 'Себет' },
    'My account':         { ru: 'Мой аккаунт',        kz: 'Менің аккаунтым' },
    'Media queries demo': { ru: 'Демо media queries', kz: 'Media queries демо' },
    'Team Next Step':     { ru: 'Команда Next Step',  kz: 'Next Step командасы' },
    '🎨 Change background': { ru: '🎨 Сменить фон',    kz: '🎨 Фонды өзгерту' },
    '✉️ Subscribe':       { ru: '✉️ Подписаться',     kz: '✉️ Жазылу' },
    'Add to cart':        { ru: 'В корзину',          kz: 'Себетке қосу' },
    'Details':            { ru: 'Подробнее',          kz: 'Толығырақ' },
    'See all →':          { ru: 'Смотреть все →',     kz: 'Барлығын көру →' },
    'Open catalog →':     { ru: 'Открыть каталог →',  kz: 'Каталогты ашу →' },
    'Browse catalog':     { ru: 'Открыть каталог',    kz: 'Каталогты ашу' },
    'Games bring us together': { ru: 'Игры объединяют нас', kz: 'Ойындар бізді біріктіреді' },
    'Featured games':     { ru: 'Рекомендуемые игры', kz: 'Ұсынылатын ойындар' },
    'Popular games':      { ru: 'Популярные игры',    kz: 'Танымал ойындар' },
    'Load more games':    { ru: 'Показать ещё игры',  kz: 'Тағы ойын көрсету' },
    'Recently viewed':    { ru: 'Недавно просмотренные', kz: 'Жақында қаралғандар' },
    'Clear history':      { ru: 'Очистить историю',   kz: 'Тарихты тазалау' },
    'Why NBN Games':      { ru: 'Почему NBN Games',   kz: 'Неге NBN Games' },
    'Game catalog':       { ru: 'Каталог игр',        kz: 'Ойындар каталогы' },
    'Genres':             { ru: 'Жанры',              kz: 'Жанрлар' },
    'Platform':           { ru: 'Платформа',          kz: 'Платформа' },
    'Price':              { ru: 'Цена',               kz: 'Бағасы' },
    'All games':          { ru: 'Все игры',           kz: 'Барлық ойындар' },
    'All platforms':      { ru: 'Все платформы',      kz: 'Барлық платформалар' },
    'All prices':         { ru: 'Любая цена',         kz: 'Кез келген баға' },
    'Proceed to checkout': { ru: 'Оформить заказ',    kz: 'Тапсырыс беру' },
    'Continue shopping':  { ru: 'Продолжить покупки', kz: 'Сатып алуды жалғастыру' },
    'Promo code':         { ru: 'Промокод',           kz: 'Промокод' },
    'Total':              { ru: 'Итого',              kz: 'Барлығы' },
    'System requirements': { ru: 'Системные требования', kz: 'Жүйелік талаптар' },
    'About the game':     { ru: 'Об игре',            kz: 'Ойын туралы' },
    'Rate this game':     { ru: 'Оцените игру',       kz: 'Ойынды бағалаңыз' },
    'Get in touch':       { ru: 'Связаться с нами',   kz: 'Бізбен байланысу' },
    'Our principles':     { ru: 'Наши принципы',      kz: 'Біздің қағидаларымыз' }
  };

  const LANGS = ['en', 'ru', 'kz'];
  const original = new WeakMap();     // text node → its English text
  let current = 'en';

  function load() {
    try { return localStorage.getItem(KEY) || 'en'; } catch (e) { return 'en'; }
  }

  // translate one text node into the current language
  function translateNode(node) {
    if (!original.has(node)) {
      const text = node.nodeValue.trim();
      if (!DICTIONARY[text]) return;          // we don't know this text — leave it
      original.set(node, text);
    }
    const en = original.get(node);
    const value = current === 'en' ? en : DICTIONARY[en][current];
    // keep the spaces around the text (they matter between inline elements)
    node.nodeValue = node.nodeValue.replace(node.nodeValue.trim(), value);
  }

  function translatePage(root) {
    const walker = document.createTreeWalker(root || document.body, NodeFilter.SHOW_TEXT);
    let node;
    while ((node = walker.nextNode())) {
      if (node.parentElement && !node.parentElement.closest('script, style, .lang-select')) translateNode(node);
    }
  }

  function setLanguage(lang, withEffects) {
    let htmlLang;
    let message;
    switch (lang) {
      case 'ru':
        htmlLang = 'ru'; message = 'Язык: русский 🇷🇺';
        break;
      case 'kz':
        htmlLang = 'kk'; message = 'Тіл: қазақша 🇰🇿';
        break;
      default:
        lang = 'en'; htmlLang = 'en'; message = 'Language: English 🇬🇧';
    }
    current = lang;
    document.documentElement.lang = htmlLang;
    translatePage();
    document.querySelectorAll('.lang-select').forEach(sel => { sel.value = lang; });
    try { localStorage.setItem(KEY, lang); } catch (e) { /* ignore */ }
    if (withEffects) {
      if (window.SoundFX) SoundFX.play('toggle');
      if (window.showToast) showToast(message);
    }
  }

  // create the selector in the navbar (before the theme button)
  function addSelector() {
    const anchor = document.querySelector('[data-theme-toggle]');
    if (!anchor) return;
    const select = document.createElement('select');
    select.className = 'form-select form-select-sm lang-select w-auto';
    select.setAttribute('aria-label', 'Language');
    LANGS.forEach(code => {
      const option = document.createElement('option');
      option.value = code;
      option.textContent = code.toUpperCase();
      select.appendChild(option);
    });
    select.addEventListener('change', () => setLanguage(select.value, true));
    anchor.parentElement.insertBefore(select, anchor);
  }

  document.addEventListener('DOMContentLoaded', () => {
    addSelector();
    setLanguage(load(), false);

    // new cards / buttons added by other scripts get translated too
    new MutationObserver(records => {
      if (current === 'en') return;
      records.forEach(r => r.addedNodes.forEach(n => {
        if (n.nodeType === Node.TEXT_NODE) translateNode(n);
        else if (n.nodeType === Node.ELEMENT_NODE) translatePage(n);
      }));
    }).observe(document.body, { childList: true, subtree: true });
  });
})();
