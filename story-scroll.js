/* =========================================================================
   SUAR · about — Our Story scroll showcase
   Vanilla port of a sticky, scroll-driven story section (no React/Tailwind).
   Scroll progress through the tall wrapper selects the active slide; the text
   slides cross-fade and the right-column images slide vertically to match.
   ========================================================================= */
(function () {
  "use strict";

  var sec = document.getElementById("story-scroll");
  if (!sec) return;
  var slides = [].slice.call(sec.querySelectorAll(".ss-slide"));
  var imgs   = [].slice.call(sec.querySelectorAll(".ss-img"));
  var dots   = [].slice.call(sec.querySelectorAll(".ss-dot"));
  var n = slides.length;
  if (!n) return;

  function setActive(a) {
    slides.forEach(function (s, i) { s.classList.toggle("active", i === a); });
    imgs.forEach(function (im, i) { im.style.transform = "translateY(" + ((i - a) * 100) + "%)"; });
    dots.forEach(function (d, i) { d.classList.toggle("active", i === a); });
  }

  var cur = -1, ticking = false;
  function update() {
    ticking = false;
    var travel = sec.offsetHeight - window.innerHeight;
    var p = travel > 0 ? (window.scrollY - sec.offsetTop) / travel : 0;
    p = Math.max(0, Math.min(0.99999, p));
    var a = Math.min(n - 1, Math.floor(p * n));
    if (a !== cur) { cur = a; setActive(a); }
  }
  function onScroll() { if (!ticking) { ticking = true; requestAnimationFrame(update); } }
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll, { passive: true });

  // pager: jump to a chapter's scroll position
  dots.forEach(function (d) {
    d.addEventListener("click", function () {
      var i = parseInt(d.getAttribute("data-go"), 10) || 0;
      var travel = sec.offsetHeight - window.innerHeight;
      var y = sec.offsetTop + ((i + 0.5) / n) * travel;
      window.scrollTo({ top: y, behavior: "smooth" });
    });
  });

  setActive(0);
  update();
})();
