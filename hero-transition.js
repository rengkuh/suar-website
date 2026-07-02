/* =========================================================================
   SUAR · home — HeroTransition driver
   Scroll-driven morph from Artboard 1 (opening) to Artboard 7 (compact).
   Writes a single CSS variable --p (0..1) on #hero-transition each frame;
   all interpolation happens in CSS calc(). Also coordinates the global
   fixed nav: keep it visible (no auto-hide) and hide its brand logo while
   the hero is pinned, since the big hero logo is the brand during the morph.
   ========================================================================= */
(function () {
  "use strict";

  var section = document.getElementById("hero-transition");
  if (!section) return;
  var nav = document.querySelector(".nav");

  function isMobile() { return window.matchMedia("(max-width:900px)").matches; }

  var ticking = false;
  function update() {
    ticking = false;
    if (isMobile()) {                     // mobile = static stacked layout
      section.style.setProperty("--p", "1");
      document.body.classList.remove("hero-active");
      return;
    }
    var travel = section.offsetHeight - window.innerHeight;   // px of scroll the pin spans
    var p = travel > 0 ? (window.scrollY - section.offsetTop) / travel : 0;
    p = Math.max(0, Math.min(1, p));
    section.style.setProperty("--p", p.toFixed(4));

    // global nav: brand hidden + auto-hide suppressed while the hero is pinned
    var pinned = p < 0.999;
    document.body.classList.toggle("hero-active", pinned);
    if (nav && pinned) nav.classList.remove("hide");
  }

  function onScroll() { if (!ticking) { ticking = true; requestAnimationFrame(update); } }
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll, { passive: true });
  update();
})();
