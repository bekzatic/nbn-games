/* Assignment 6 — Task 0 (backup)
   jQuery is loaded from the CDN (code.jquery.com) in <head>.
   If the CDN is not reachable (no internet, opened from disk offline),
   window.jQuery is undefined here, so we load our local copy of the
   same version from js/vendor/ before script.js runs. */
window.jQuery || document.write('<script src="js/vendor/jquery-4.0.0.min.js"><\/script>');
