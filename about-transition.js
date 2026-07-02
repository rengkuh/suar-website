/* =========================================================================
   SUAR · about — VideoTransition driver
   Scroll-driven morph: the video block expands from the right panel (p=0)
   into a full-width banner (p=1), headline/about fade out, "our story" in.
   Writes a single CSS var --p (0..1) on #video-transition; CSS calc() does
   the interpolation. Keeps the fixed nav visible while pinned.
   ========================================================================= */
(function () {
  "use strict";

  var section = document.getElementById("video-transition");
  if (!section) return;
  var nav = document.querySelector(".nav");

  function isMobile() { return window.matchMedia("(max-width:900px)").matches; }

  var ticking = false;
  function update() {
    ticking = false;
    if (isMobile()) {                       // mobile = static stacked layout
      section.style.setProperty("--p", "1");
      document.body.classList.remove("pin-active");
      return;
    }
    var travel = section.offsetHeight - window.innerHeight;
    var p = travel > 0 ? (window.scrollY - section.offsetTop) / travel : 0;
    p = Math.max(0, Math.min(1, p));
    section.style.setProperty("--p", p.toFixed(4));

    var pinned = p < 0.999;
    document.body.classList.toggle("pin-active", pinned);
    if (nav && pinned) nav.classList.remove("hide");
  }

  function onScroll() { if (!ticking) { ticking = true; requestAnimationFrame(update); } }
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll, { passive: true });
  update();
})();
