/* Backup copy of jQuery
   jQuery is loaded from the CDN (code.jquery.com) in <head>, right
   before this file. If the CDN is not reachable (no internet, blocked),
   window.jQuery is undefined here, so we load our local copy of the
   same version from js/vendor/.

   Why document.write and not createElement('script'):
   document.write adds the <script> into the HTML that is being read
   right now, so the browser WAITS for it before running the next
   scripts (all of them need jQuery). A script made with createElement
   loads in the background and our scripts would start before jQuery
   exists. This line only runs when the CDN has failed. */
window.jQuery || document.write('<script src="js/vendor/jquery-4.0.0.min.js"><\/script>');
