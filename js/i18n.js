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
    'Our principles':     { ru: 'Наши принципы',      kz: 'Біздің қағидаларымыз' },
    // catalog: genres, price filter, sort options
    'Action':             { ru: 'Экшен',              kz: 'Экшн' },
    'Adventure':          { ru: 'Приключения',        kz: 'Шытырман оқиға' },
    'Strategy':           { ru: 'Стратегии',          kz: 'Стратегия' },
    'Simulation':         { ru: 'Симуляторы',         kz: 'Симулятор' },
    'Sport':              { ru: 'Спорт',              kz: 'Спорт' },
    'Racing':             { ru: 'Гонки',              kz: 'Жарыс' },
    'Under ₸5,000':       { ru: 'До ₸5 000',          kz: '₸5 000-ға дейін' },
    'Sort: by genre (default)': { ru: 'Сортировка: по жанрам', kz: 'Сұрыптау: жанр бойынша' },
    'Price: low → high':  { ru: 'Цена: по возрастанию', kz: 'Баға: арзаннан қымбатқа' },
    'Price: high → low':  { ru: 'Цена: по убыванию',  kz: 'Баға: қымбаттан арзанға' },
    'Name: A → Z':        { ru: 'Название: A → Z',    kz: 'Атауы: A → Z' },
    'Reset filters':      { ru: 'Сбросить фильтры',   kz: 'Сүзгілерді тазалау' },
    '🕒 Show current time': { ru: '🕒 Показать время', kz: '🕒 Уақытты көрсету' },
    'Our time now:':      { ru: 'Сейчас у нас:',      kz: 'Қазір бізде:' }
  };

  /* Texts with a number inside, e.g. the catalog counter "12 games".
     Each pattern: a regular expression + a function that builds the translation. */
  const PATTERNS = [
    {
      re: /^(\d+) games?$/,
      ru: n => `${n} ${ruPlural(n, 'игра', 'игры', 'игр')}`,
      kz: n => `${n} ойын`
    }
  ];

  // Russian plural: 1 игра, 2 игры, 5 игр, 21 игра, 11 игр
  function ruPlural(n, one, few, many) {
    const mod10 = n % 10;
    const mod100 = n % 100;
    if (mod10 === 1 && mod100 !== 11) return one;
    if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return few;
    return many;
  }

  // English text → text in the current language (or null if we don't know it)
  function lookup(en) {
    if (DICTIONARY[en]) return current === 'en' ? en : DICTIONARY[en][current];
    for (const p of PATTERNS) {
      const m = en.match(p.re);
      if (m) return current === 'en' ? en : p[current](Number(m[1]));
    }
    return null;
  }

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
      if (!text || lookup(text) === null) return;   // we don't know this text — leave it
      original.set(node, text);
    }
    const value = lookup(original.get(node));
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
