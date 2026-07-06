/* =========================================================================
   SUAR website · Atoll-style motion layer
   intro loader · inertia smooth-scroll · line-mask reveals ·
   image clip-reveal · scroll-velocity marquee
   Loads AFTER web-home.js. Self-contained; degrades gracefully.
   ========================================================================= */
(function () {
  "use strict";
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion:reduce)").matches;
  var isTouch = window.matchMedia && window.matchMedia("(hover:none)").matches;

  /* ---------- 1 · INTRO LOADER ---------- */
  function initLoader(done) {
    var el = document.getElementById("loader");
    if (!el || reduce) { if (el) el.classList.add("done"); document.body.classList.remove("loading"); done(); return; }
    var numEl = el.querySelector(".loader-count span");

    // Show the branded intro only once per session. On subsequent in-session
    // navigations, skip the count and reveal fast so internal clicks feel instant.
    var seen = false;
    try { seen = sessionStorage.getItem("suarIntro") === "1"; sessionStorage.setItem("suarIntro", "1"); } catch (e) {}
    if (seen) {
      el.style.transition = "transform .4s cubic-bezier(.76,0,.24,1)";
      if (numEl) numEl.textContent = 100;
      document.body.classList.remove("loading");
      requestAnimationFrame(function () { el.classList.add("done"); });
      setTimeout(done, 120);
      return;
    }

    var start = null, dur = 760, finished = false;
    function finish() {
      if (finished) return; finished = true;
      if (numEl) numEl.textContent = 100;
      el.classList.add("done");
      document.body.classList.remove("loading");
      setTimeout(done, 480);
    }
    function step(t) {
      if (start === null) start = t;
      var p = Math.min(1, (t - start) / dur);
      var eased = 1 - Math.pow(1 - p, 3);
      if (numEl) numEl.textContent = Math.round(eased * 100);
      if (p < 1) requestAnimationFrame(step);
      else finish();
    }
    requestAnimationFrame(step);
    // safety net: rAF is throttled while the tab is backgrounded — never leave
    // the loader (and body overflow:hidden) stuck if the page loaded hidden.
    setTimeout(finish, dur + 1000);
  }

  /* ---------- 2 · LINE-MASK REVEAL (hero + headings) ---------- */
  function wrapLines() {
    // hero headline: split each language span's <br> lines into masked lines
    document.querySelectorAll("[data-line-mask]").forEach(function (host) {
      host.querySelectorAll("span[data-i18n-en], span[data-i18n-id]").forEach(function (span) {
        if (span.dataset.wrapped) return;
        var parts = span.innerHTML.split(/<br[^>]*>/i);
        span.innerHTML = parts.map(function (p) {
          return '<span class="lmask"><span class="lmask-i">' + p + "</span></span>";
        }).join("");
        span.dataset.wrapped = "1";
      });
    });
  }
  function playLines(host, delay) {
    var lines = host.querySelectorAll(".lmask-i");
    lines.forEach(function (l, i) {
      l.style.transitionDelay = (delay + i * 0.09).toFixed(2) + "s";
    });
    host.classList.add("lines-in");
  }

  /* ---------- 3 · IMAGE CLIP-REVEAL ---------- */
  function initImageReveal() {
    var imgs = document.querySelectorAll(".ph");
    if (!imgs.length) return;
    imgs.forEach(function (i) { i.classList.add("clip-reveal"); });
    if (!("IntersectionObserver" in window) || reduce) {
      imgs.forEach(function (i) { i.classList.add("in"); }); return;
    }
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } });
    }, { threshold: 0.18, rootMargin: "0px 0px -6% 0px" });
    requestAnimationFrame(function () { requestAnimationFrame(function () {
      imgs.forEach(function (i) { io.observe(i); });
    }); });
  }

  /* ---------- 4 · SCROLL-VELOCITY MARQUEE ---------- */
  function initMarquee(getVel) {
    var track = document.querySelector(".marquee-track");
    if (!track || reduce) return;
    var base = 0, x = 0, dir = -1, w = 0;
    function measure() { w = track.scrollWidth / 2; }
    measure(); window.addEventListener("resize", measure);
    function loop() {
      var v = getVel ? getVel() : 0;
      var speed = 0.6 + Math.min(7, Math.abs(v) * 0.05);
      dir = v > 0.2 ? -1 : (v < -0.2 ? 1 : dir);
      x += dir * speed;
      if (x <= -w) x += w; if (x > 0) x -= w;
      track.style.transform = "translateX(" + x + "px)";
      requestAnimationFrame(loop);
    }
    track.style.animation = "none";
    loop();
  }

  /* ---------- 5 · INERTIA SMOOTH SCROLL (Lenis-lite) ---------- */
  function initSmooth() {
    // Home page runs a scroll-pinned hero morph that relies on native
    // position:sticky — the transform-based smooth-scroll would break it, so
    // skip it there (touch / reduced-motion already opt out site-wide).
    var isHome = (document.body.getAttribute("data-nav-page") === "index.html");
    var hasStickyMorph = !!document.querySelector(".hero-transition, .video-transition, .story-scroll, .svc-hero-scroll");
    if (reduce || isTouch || isHome || hasStickyMorph) return { vel: function () { return 0; } };
    var nav = document.querySelector(".nav");
    var loader = document.getElementById("loader");
    var wrap = document.createElement("div");
    wrap.id = "smooth-content";
    // move eligible nodes into wrap
    var kids = [].slice.call(document.body.childNodes);
    kids.forEach(function (n) {
      if (n === nav || n === loader || n === wrap) return;
      if (n.nodeType === 1 && (n.tagName === "SCRIPT" || n.tagName === "STYLE")) return;
      wrap.appendChild(n);
    });
    document.body.appendChild(wrap);
    var spacer = document.createElement("div");
    spacer.id = "smooth-spacer";
    document.body.appendChild(spacer);
    document.documentElement.classList.add("has-smooth");

    var target = 0, current = 0, vel = 0;
    var roPending = false;
    function setHeight() { spacer.style.height = wrap.scrollHeight + "px"; }
    function scheduleHeight() { if (roPending) return; roPending = true; requestAnimationFrame(function () { roPending = false; setHeight(); }); }
    setHeight();
    var ro = ("ResizeObserver" in window) ? new ResizeObserver(scheduleHeight) : null;
    if (ro) ro.observe(wrap);
    window.addEventListener("resize", scheduleHeight);

    function raf() {
      target = window.scrollY || window.pageYOffset;
      var prev = current;
      current += (target - current) * 0.085;
      if (Math.abs(target - current) < 0.05) current = target;
      vel = current - prev;
      wrap.style.transform = "translate3d(0," + (-current) + "px,0)";
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);
    return { vel: function () { return vel; }, setHeight: setHeight };
  }

  /* ---------- 6 · FEATURED scroll portfolio ---------- */
  function initFeatured() {
    var sec = document.getElementById("featured");
    if (!sec) return;
    var headline = sec.querySelector(".feat-headline");
    var reveals = [].slice.call(sec.querySelectorAll(".feat-reveal"));
    var paraImgs = [].slice.call(sec.querySelectorAll(".fh-img img, .fr-thumb img"));
    var idxCur = sec.querySelector(".fi-cur");
    var rows = [].slice.call(sec.querySelectorAll(".feat-hero, .feat-row"));
    var navH = (document.querySelector(".nav") || {}).offsetHeight || 64;

    // staggered reveal
    if (!("IntersectionObserver" in window) || reduce) {
      reveals.forEach(function (r) { r.classList.add("in"); });
    } else {
      var io = new IntersectionObserver(function (es) {
        es.forEach(function (e) {
          if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); }
        });
      }, { threshold: 0.16, rootMargin: "0px 0px -8% 0px" });
      reveals.forEach(function (r) { io.observe(r); });
    }
    if (reduce) return;

    // scroll-linked: headline lift + image parallax + index counter
    function loop() {
      var r = sec.getBoundingClientRect();
      var vh = window.innerHeight;
      if (r.bottom > -200 && r.top < vh + 200) {
        if (headline) {
          var p = navH - r.top; // px the section has scrolled past the nav
          if (p > 0) {
            var ty = Math.min(80, p * 0.12);
            var sc = Math.max(0.93, 1 - p * 0.00009);
            headline.style.transform = "translate3d(0," + (-ty) + "px,0) scale(" + sc + ")";
            headline.style.transformOrigin = "left top";
          } else { headline.style.transform = "none"; }
        }
        paraImgs.forEach(function (img) {
          var ir = img.getBoundingClientRect();
          if (ir.bottom < -120 || ir.top > vh + 120) return;
          var center = ir.top + ir.height / 2;
          var off = (center - vh / 2) / vh; // -0.5..0.5
          img.style.transform = "translate3d(0," + (off * -16) + "px,0) scale(1.08)";
        });
        if (idxCur) {
          var best = 0, bestDist = Infinity;
          rows.forEach(function (row, i) {
            var rr = row.getBoundingClientRect();
            var c = rr.top + rr.height / 2;
            var d = Math.abs(c - vh * 0.42);
            if (d < bestDist) { bestDist = d; best = i; }
          });
          var n = ("0" + (best + 1)).slice(-2);
          if (idxCur.textContent !== n) idxCur.textContent = n;
        }
      }
      requestAnimationFrame(loop);
    }
    requestAnimationFrame(loop);
  }

  /* ---------- BOOT ---------- */
  function boot() {
    wrapLines();
    var smooth = initSmooth();
    initImageReveal();
    initMarquee(smooth.vel);
    initFeatured();
    initLoader(function () {
      // reveal hero lines after the curtain lifts
      document.querySelectorAll("[data-line-mask]").forEach(function (h, i) { playLines(h, 0.05 + i * 0.12); });
      document.body.classList.add("loaded");
      if (smooth.setHeight) setTimeout(smooth.setHeight, 60);
    });
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();
