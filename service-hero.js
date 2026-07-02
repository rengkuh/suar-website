/* =========================================================================
   SUAR · services — hero forklift fly-across
   Vanilla equivalent of the Framer useScroll/useTransform interaction.
   Writes one CSS var --p (0..1) on #svc-hero from scroll progress; CSS calc()
   maps it to the forklift's translateX + opacity. Nav stays put while pinned.
   ========================================================================= */
(function () {
  "use strict";

  var sec = document.getElementById("svc-hero");
  if (!sec) return;
  var nav = document.querySelector(".nav");

  var ticking = false;
  function update() {
    ticking = false;
    var travel = sec.offsetHeight - window.innerHeight;
    var p = travel > 0 ? (window.scrollY - sec.offsetTop) / travel : 0;
    p = Math.max(0, Math.min(1, p));
    sec.style.setProperty("--p", p.toFixed(4));

    var pinned = p > 0 && p < 1;
    document.body.classList.toggle("pin-active", pinned);
    if (nav && pinned) nav.classList.remove("hide");
  }
  function onScroll() { if (!ticking) { ticking = true; requestAnimationFrame(update); } }
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll, { passive: true });
  update();
})();
