/* ==========================================================
   Live date and time in the footer
   Author: Bekzat Amanbek
   Pages: every page — clock block in the footer (.js-datetime).

   How it works:
   1. `new Date()` gives the current date and time.
   2. We build a readable string by hand from the Date methods, in
      the language of the page (<html lang>, set by js/i18n.js):
        EN "October 9, 2026, 10:45:07 AM"
        RU "9 октября 2026, 10:45:07"
        KZ "2026 ж. 9 қазан, 10:45:07"
   3. setInterval runs the update every second, so the clock is live
      (and switches language right after the language changes).
   ========================================================== */

(function () {
  const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June',
                  'July', 'August', 'September', 'October', 'November', 'December'];
  const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const MONTHS_RU = ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'];
  const MONTHS_KZ = ['қаңтар', 'ақпан', 'наурыз', 'сәуір', 'мамыр', 'маусым', 'шілде', 'тамыз', 'қыркүйек', 'қазан', 'қараша', 'желтоқсан'];
  const DAYS_RU = ['Воскресенье', 'Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота'];
  const DAYS_KZ = ['Жексенбі', 'Дүйсенбі', 'Сейсенбі', 'Сәрсенбі', 'Бейсенбі', 'Жұма', 'Сенбі'];
  const lang = () => document.documentElement.lang;            // 'en' | 'ru' | 'kk'

  const pad = n => String(n).padStart(2, '0');

  function format(d) {
    const time24 = `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
    if (lang() === 'ru') return `${d.getDate()} ${MONTHS_RU[d.getMonth()]} ${d.getFullYear()}, ${time24}`;
    if (lang() === 'kk') return `${d.getFullYear()} ж. ${d.getDate()} ${MONTHS_KZ[d.getMonth()]}, ${time24}`;
    let hours = d.getHours();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12 || 12; // 0 → 12
    return `${MONTHS[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}, ` +
           `${hours}:${pad(d.getMinutes())}:${pad(d.getSeconds())} ${ampm}`;
  }

  function tick() {
    const now = new Date();
    document.querySelectorAll('.js-datetime').forEach(el => {
      el.textContent = format(now);
    });
    const days = lang() === 'ru' ? DAYS_RU : lang() === 'kk' ? DAYS_KZ : DAYS;
    document.querySelectorAll('.js-weekday').forEach(el => { el.textContent = days[now.getDay()]; });
  }

  tick();
  setInterval(tick, 1000);

  // the year in "© 2026 NBN Games" — taken from the same Date, so it never gets old
  document.querySelectorAll('.js-year').forEach(el => { el.textContent = new Date().getFullYear(); });
})();
