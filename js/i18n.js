/* ==========================================================
   Language selector (EN / RU / KZ)
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
    'Change background':  { ru: 'Сменить фон',        kz: 'Фонды өзгерту' },
    'Subscribe':          { ru: 'Подписаться',        kz: 'Жазылу' },
    'Deals':              { ru: 'Скидки',             kz: 'Жеңілдіктер' },
    'Contacts':           { ru: 'Контакты',           kz: 'Байланыс' },
    'Settings':           { ru: 'Настройки',          kz: 'Баптаулар' },
    'Language':           { ru: 'Язык',               kz: 'Тіл' },
    'Sound & music':      { ru: 'Звук и музыка',      kz: 'Дыбыс және музыка' },
    'Wishlist':           { ru: 'Избранное',          kz: 'Таңдаулылар' },
    'In wishlist':        { ru: 'В избранном',        kz: 'Таңдаулыларда' },
    'Copy link':          { ru: 'Скопировать ссылку', kz: 'Сілтемені көшіру' },
    'New fact':           { ru: 'Новый факт',         kz: 'Жаңа факт' },
    'Digital game keys for PC, PlayStation and Xbox — instant delivery and honest prices for gamers in Kazakhstan.': { ru: 'Цифровые ключи игр для PC, PlayStation и Xbox — мгновенная доставка и честные цены для геймеров Казахстана.', kz: 'PC, PlayStation және Xbox ойындарының цифрлық кілттері — Қазақстан геймерлеріне жедел жеткізу және әділ баға.' },
    'Add to cart':        { ru: 'В корзину',          kz: 'Себетке қосу' },
    'Get for free':       { ru: 'Получить бесплатно', kz: 'Тегін алу' },
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
    'Rating: high → low': { ru: 'Рейтинг: сначала лучшие', kz: 'Рейтинг: ең жоғарысы бірінші' },
    'Reset filters':      { ru: 'Сбросить фильтры',   kz: 'Сүзгілерді тазалау' },
    'Show current time':  { ru: 'Показать время',     kz: 'Уақытты көрсету' },
    'Our time now:':      { ru: 'Сейчас у нас:',      kz: 'Қазір бізде:' },
    // live prices from the CheapShark API (js/deals-api.js)
    'Live deals':         { ru: 'Скидки дня',         kz: 'Күннің жеңілдіктері' },
    'Biggest discounts right now · prices in USD · data: CheapShark': { ru: 'Самые большие скидки прямо сейчас · цены в USD · данные: CheapShark', kz: 'Қазіргі ең үлкен жеңілдіктер · бағалар USD-мен · деректер: CheapShark' },
    'Prices in other stores': { ru: 'Цены в других магазинах', kz: 'Басқа дүкендердегі бағалар' },
    'Prices in USD · data: CheapShark': { ru: 'Цены в USD · данные: CheapShark', kz: 'Бағалар USD-мен · деректер: CheapShark' },
    'Loading deals…':     { ru: 'Загружаем скидки…',  kz: 'Жеңілдіктер жүктелуде…' },
    'Looking for prices in other stores…': { ru: 'Ищем цены в других магазинах…', kz: 'Басқа дүкендердегі бағаларды іздеп жатырмыз…' },
    'Could not load the deals. Check your internet connection.': { ru: 'Не удалось загрузить скидки. Проверьте подключение к интернету.', kz: 'Жеңілдіктерді жүктеу мүмкін болмады. Интернет байланысын тексеріңіз.' },
    'Could not load prices from other stores.': { ru: 'Не удалось загрузить цены из других магазинов.', kz: 'Басқа дүкендердің бағаларын жүктеу мүмкін болмады.' },
    'No deals right now — try again later.': { ru: 'Сейчас скидок нет — попробуйте позже.', kz: 'Қазір жеңілдік жоқ — кейінірек қайталап көріңіз.' },
    'This game was not found in other stores.': { ru: 'Эта игра не найдена в других магазинах.', kz: 'Бұл ойын басқа дүкендерден табылмады.' },
    'Retry':              { ru: 'Повторить',          kz: 'Қайталау' },
    'View deal ↗':        { ru: 'Открыть скидку ↗',   kz: 'Жеңілдікті ашу ↗' },
    'Go to store ↗':      { ru: 'В магазин ↗',        kz: 'Дүкенге өту ↗' },
    'Best price':         { ru: 'Лучшая цена',        kz: 'Ең тиімді баға' },
    'Free':               { ru: 'Бесплатно',          kz: 'Тегін' },
    // forms: field names and hints
    'Phone':              { ru: 'Телефон',            kz: 'Телефон' },
    'All fields are required. Password: at least 8 characters with a letter, a digit and a special character (e.g. !, #, ?).': { ru: 'Все поля обязательны. Пароль: минимум 8 символов, буква, цифра и спецсимвол (например !, #, ?).', kz: 'Барлық өрістер міндетті. Құпиясөз: кемінде 8 таңба, әріп, сан және арнайы таңба (мысалы !, #, ?).' },
    'At least 8 characters with a letter, a digit and a special character.': { ru: 'Минимум 8 символов: буква, цифра и спецсимвол.', kz: 'Кемінде 8 таңба: әріп, сан және арнайы таңба.' },
    'Password strength: —':      { ru: 'Надёжность пароля: —',       kz: 'Құпиясөз беріктігі: —' },
    'Password strength: weak':   { ru: 'Надёжность пароля: слабый',  kz: 'Құпиясөз беріктігі: әлсіз' },
    'Password strength: medium': { ru: 'Надёжность пароля: средний', kz: 'Құпиясөз беріктігі: орташа' },
    'Password strength: strong': { ru: 'Надёжность пароля: надёжный', kz: 'Құпиясөз беріктігі: мықты' },
    // form errors (js/validators.js + the form scripts)
    'Please enter your name.':   { ru: 'Введите ваше имя.',          kz: 'Атыңызды енгізіңіз.' },
    'Name must be at least 2 characters.': { ru: 'Имя должно содержать минимум 2 символа.', kz: 'Аты кемінде 2 таңбадан тұруы керек.' },
    'Email is required.':        { ru: 'Введите email.',             kz: 'Email енгізіңіз.' },
    'Enter a valid email, e.g. name@example.com.': { ru: 'Введите корректный email, например name@example.com.', kz: 'Дұрыс email енгізіңіз, мысалы name@example.com.' },
    'An account with this email already exists.': { ru: 'Аккаунт с таким email уже существует.', kz: 'Бұл email-мен аккаунт бар.' },
    'Phone number is required.': { ru: 'Введите номер телефона.',    kz: 'Телефон нөмірін енгізіңіз.' },
    'Enter a Kazakhstan number: +7 7XX XXX XX XX.': { ru: 'Введите номер Казахстана: +7 7XX XXX XX XX.', kz: 'Қазақстан нөмірін енгізіңіз: +7 7XX XXX XX XX.' },
    'Password is required.':     { ru: 'Введите пароль.',            kz: 'Құпиясөзді енгізіңіз.' },
    'Use 8+ characters with a letter, a digit and a special character.': { ru: 'Нужно минимум 8 символов: буква, цифра и спецсимвол.', kz: 'Кемінде 8 таңба қажет: әріп, сан және арнайы таңба.' },
    'Please repeat your password.': { ru: 'Повторите пароль.',       kz: 'Құпиясөзді қайталаңыз.' },
    'Passwords do not match.':   { ru: 'Пароли не совпадают.',       kz: 'Құпиясөздер сәйкес келмейді.' },
    'You must accept the terms to continue.': { ru: 'Чтобы продолжить, примите условия.', kz: 'Жалғастыру үшін шарттарды қабылдаңыз.' },
    'Enter an amount.':          { ru: 'Введите сумму.',             kz: 'Соманы енгізіңіз.' },
    'Enter an amount between 100 and 500 000 ₸.': { ru: 'Введите сумму от 100 до 500 000 ₸.', kz: '100-ден 500 000 ₸-ге дейінгі соманы енгізіңіз.' },
    'Enter your current password.': { ru: 'Введите текущий пароль.', kz: 'Қазіргі құпиясөзді енгізіңіз.' },
    'Current password is incorrect.': { ru: 'Текущий пароль неверный.', kz: 'Қазіргі құпиясөз қате.' },
    'Enter a new password.':     { ru: 'Введите новый пароль.',      kz: 'Жаңа құпиясөзді енгізіңіз.' },
    'The new password must be different.': { ru: 'Новый пароль должен отличаться от текущего.', kz: 'Жаңа құпиясөз қазіргіден өзгеше болуы керек.' },
    'Please repeat the new password.': { ru: 'Повторите новый пароль.', kz: 'Жаңа құпиясөзді қайталаңыз.' },
    'The new passwords do not match.': { ru: 'Новые пароли не совпадают.', kz: 'Жаңа құпиясөздер сәйкес келмейді.' },
    'Please write a message.':   { ru: 'Напишите сообщение.',        kz: 'Хабарлама жазыңыз.' },
    'The message is too short — at least 10 characters.': { ru: 'Сообщение слишком короткое — минимум 10 символов.', kz: 'Хабарлама тым қысқа — кемінде 10 таңба.' },
    'Enter a promo code.':       { ru: 'Введите промокод.',          kz: 'Промокодты енгізіңіз.' },
    'Unknown promo code.':       { ru: 'Неизвестный промокод.',      kz: 'Белгісіз промокод.' },
    'Please tick this box to place the order.': { ru: 'Отметьте этот пункт, чтобы оформить заказ.', kz: 'Тапсырыс беру үшін осы белгіні қойыңыз.' },
    // home hero + the Deals page (deals.html)
    "Today's deals":      { ru: 'Скидки дня',         kz: 'Күннің жеңілдіктері' },
    'A digital game store for students and young gamers in Kazakhstan: find a game for PC, PlayStation or Xbox, compare its price with other stores and get the key in a minute. Prices in tenge, interface in English, Russian and Kazakh.': { ru: 'Магазин цифровых игр для студентов и молодых геймеров Казахстана: найдите игру для PC, PlayStation или Xbox, сравните цену с другими магазинами и получите ключ за минуту. Цены в тенге, интерфейс на английском, русском и казахском.', kz: 'Қазақстандағы студенттер мен жас геймерлерге арналған цифрлық ойындар дүкені: PC, PlayStation немесе Xbox ойынын табыңыз, бағасын басқа дүкендермен салыстырыңыз және кілтті бір минутта алыңыз. Бағалар теңгемен, интерфейс ағылшын, орыс және қазақ тілдерінде.' },
    'Game deals':         { ru: 'Скидки на игры',     kz: 'Ойындарға жеңілдіктер' },
    'Live prices · CheapShark API': { ru: 'Живые цены · CheapShark API', kz: 'Нақты бағалар · CheapShark API' },
    'The biggest discounts on PC games from 30+ stores, updated live. Choose a store, a price limit or the sort order and grab a key before the sale ends.': { ru: 'Самые большие скидки на PC-игры из 30+ магазинов в реальном времени. Выберите магазин, предел цены или сортировку и успейте купить ключ до конца акции.', kz: '30+ дүкеннен PC ойындарына ең үлкен жеңілдіктер, нақты уақытта. Дүкенді, баға шегін немесе сұрыптауды таңдап, акция біткенше кілтті алыңыз.' },
    'All deals':          { ru: 'Все скидки',         kz: 'Барлық жеңілдіктер' },
    'All stores':         { ru: 'Все магазины',       kz: 'Барлық дүкендер' },
    'Max price':          { ru: 'Макс. цена',         kz: 'Ең жоғары баға' },
    'Any price':          { ru: 'Любая цена',         kz: 'Кез келген баға' },
    'Under $5':           { ru: 'До $5',              kz: '$5-ға дейін' },
    'Under $10':          { ru: 'До $10',             kz: '$10-ға дейін' },
    'Under $20':          { ru: 'До $20',             kz: '$20-ға дейін' },
    'Sort by':            { ru: 'Сортировка',         kz: 'Сұрыптау' },
    'Biggest discount':   { ru: 'Самая большая скидка', kz: 'Ең үлкен жеңілдік' },
    'Lowest price':       { ru: 'Самая низкая цена',  kz: 'Ең төмен баға' },
    'Best deal rating':   { ru: 'Лучшие предложения', kz: 'Ең тиімді ұсыныстар' },
    'Newest':             { ru: 'Новые',              kz: 'Жаңалары' },
    'Show more deals':    { ru: 'Показать ещё скидки', kz: 'Тағы жеңілдік көрсету' },
    'No deals match these filters — try another store or price.': { ru: 'Под эти фильтры скидок нет — попробуйте другой магазин или цену.', kz: 'Бұл сүзгілерге жеңілдік жоқ — басқа дүкен немесе баға таңдаңыз.' },
    'Prices in USD · data: CheapShark · a click opens the store on CheapShark in a new tab': { ru: 'Цены в USD · данные: CheapShark · клик открывает магазин через CheapShark в новой вкладке', kz: 'Бағалар USD-мен · деректер: CheapShark · басу дүкенді CheapShark арқылы жаңа бетте ашады' }
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
        htmlLang = 'ru'; message = 'Язык: русский';
        break;
      case 'kz':
        htmlLang = 'kk'; message = 'Тіл: қазақша';
        break;
      default:
        lang = 'en'; htmlLang = 'en'; message = 'Language: English';
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

  // create the selector: inside the ⚙ Settings menu (#lang-slot), or before the theme button on older pages
  function addSelector() {
    const slot = document.getElementById('lang-slot');
    const anchor = document.querySelector('[data-theme-toggle]');
    if (!slot && !anchor) return;
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
    if (slot) slot.appendChild(select);
    else anchor.parentElement.insertBefore(select, anchor);
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
