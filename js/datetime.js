/* ==========================================================
   Assignment #4 — Task 5: Display Current Date and Time
   Author: Bekzat Amanbek
   Pages: every page — clock block in the footer (.js-datetime).

   How it works:
   1. `new Date()` gives the current date and time.
   2. We build a readable string by hand from the Date methods:
        "October 9, 2026, 10:45:07 AM"
   3. setInterval runs the update every second, so the clock is live.
   ========================================================== */

(function () {
  const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June',
                  'July', 'August', 'September', 'October', 'November', 'December'];
  const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  const pad = n => String(n).padStart(2, '0');

  function format(d) {
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
      el.setAttribute('datetime', now.toISOString());
    });
    document.querySelectorAll('.js-weekday').forEach(el => { el.textContent = DAYS[now.getDay()]; });
  }

  tick();
  setInterval(tick, 1000);
})();
