/* =========================================================================
   SUAR · home — Carbon comparison slider (coal vs EFB pellet)
   Vanilla port of an image-comparison slider (no React). Drag the divider
   (or click/tap the track, or use arrow keys) to wipe between the two
   stacked panels. The "after" layer (EFB) is clipped from the right.
   ========================================================================= */
(function () {
  "use strict";

  var box = document.getElementById("em-compare");
  if (!box) return;
  var after  = box.querySelector(".ec-after");
  var handle = box.querySelector(".ec-handle");
  if (!after || !handle) return;

  var pos = 50;          // 0..100 — % of the EFB (after) panel revealed from the left
  var dragging = false;

  function render() {
    after.style.clipPath = "inset(0 " + (100 - pos) + "% 0 0)";
    handle.style.left = pos + "%";
    box.setAttribute("aria-valuenow", Math.round(pos));
  }
  function set(p) { pos = Math.max(0, Math.min(100, p)); render(); }
  function fromClientX(x) {
    var r = box.getBoundingClientRect();
    return ((x - r.left) / r.width) * 100;
  }

  function pointFromEvent(e) {
    return e.touches && e.touches.length ? e.touches[0].clientX : e.clientX;
  }
  function start(e) {
    dragging = true;
    box.classList.add("dragging", "interacted");   // "interacted" permanently hides the hint
    set(fromClientX(pointFromEvent(e)));
  }
  function move(e) {
    if (!dragging) return;
    set(fromClientX(pointFromEvent(e)));
    if (e.cancelable) e.preventDefault();   // block page scroll while wiping
  }
  function end() {
    dragging = false;
    box.classList.remove("dragging");
  }

  // mouse
  box.addEventListener("mousedown", start);
  window.addEventListener("mousemove", move);
  window.addEventListener("mouseup", end);
  // touch
  box.addEventListener("touchstart", start, { passive: true });
  window.addEventListener("touchmove", move, { passive: false });
  window.addEventListener("touchend", end);
  // keyboard (box is role=slider, tabindex 0)
  box.addEventListener("keydown", function (e) {
    if (e.key === "ArrowLeft")  { set(pos - 4); e.preventDefault(); }
    else if (e.key === "ArrowRight") { set(pos + 4); e.preventDefault(); }
    else if (e.key === "Home")  { set(0);  e.preventDefault(); }
    else if (e.key === "End")   { set(100); e.preventDefault(); }
  });

  set(50);
})();
