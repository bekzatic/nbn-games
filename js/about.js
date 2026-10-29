/* ==========================================================
   about.html — "Show current time" button
   Author: Nurkhan Nurzhau
   Assignment #5 — Event Handling (example from the task):
   a button with addEventListener shows the current time using
   new Date().toLocaleTimeString(). A switch tells if our office
   (Mon–Fri, 9:00–18:00) is open right now. Sound + small animation.
   ========================================================== */

(function () {
  const btn = document.getElementById('time-btn');
  const output = document.getElementById('time-output');
  const status = document.getElementById('time-status');
  if (!btn) return;

  // is the office open? (switch on the day of the week)
  function officeStatus(date) {
    const hour = date.getHours();
    switch (date.getDay()) {
      case 0:            // Sunday
      case 6:            // Saturday
        return '· weekend, we reply on Monday';
      default:
        return hour >= 9 && hour < 18 ? '· we are online ✅' : '· office closed, we reply tomorrow';
    }
  }

  btn.addEventListener('click', () => {
    const now = new Date();
    output.textContent = now.toLocaleTimeString();
    status.textContent = officeStatus(now);
    output.classList.remove('tick');
    void output.offsetWidth;               // restart the animation
    output.classList.add('tick');
    if (window.SoundFX) SoundFX.play('click');
  });
})();
