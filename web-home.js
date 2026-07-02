/* =========================================================================
   SUAR website · shared behaviour
   nav scroll/dark · language toggle · scroll reveal · clip words
   ========================================================================= */
(function () {
  "use strict";

  /* ---------- LANGUAGE ---------- */
  function applyLang(lang) {
    document.body.classList.toggle("lang-id", lang === "id");
    document.querySelectorAll(".lang button").forEach(function (b) {
      b.classList.toggle("active", b.dataset.lang === lang);
    });
    document.documentElement.lang = lang;
    try { localStorage.setItem("suar-lang", lang); } catch (e) {}
  }
  function initLang() {
    var saved = "en";
    try { saved = localStorage.getItem("suar-lang") || "en"; } catch (e) {}
    applyLang(saved);
    document.querySelectorAll(".lang button").forEach(function (b) {
      b.addEventListener("click", function () { applyLang(b.dataset.lang); });
    });
  }

  /* ---------- NAV: hide on scroll down, dark over dark sections ---------- */
  function initNav() {
    var nav = document.querySelector(".nav");
    if (!nav) return;
    var last = 0;
    var darkZones = [];
    function measure() {
      darkZones = [].map.call(document.querySelectorAll("[data-nav-dark]"), function (el) {
        var r = el.getBoundingClientRect();
        var top = r.top + window.scrollY;
        return [top, top + el.offsetHeight];
      });
    }
    measure();
    window.addEventListener("resize", measure);
    window.addEventListener("scroll", function () {
      var y = window.scrollY;
      // keep the nav put while any pinned/morphing section is active
      if (document.body.classList.contains("hero-active") || document.body.classList.contains("pin-active")) {
        nav.classList.remove("hide");
      } else if (y > 200 && y > last) {
        nav.classList.add("hide");
      } else {
        nav.classList.remove("hide");
      }
      last = y;
      // dark detection — nav center line
      var probe = y + 31;
      var onDark = darkZones.some(function (z) { return probe >= z[0] && probe < z[1]; });
      nav.classList.toggle("on-dark", onDark);
    }, { passive: true });
  }

  /* ---------- SCROLL REVEAL ---------- */
  function initReveal() {
    var els = document.querySelectorAll(".reveal, .clipword");
    if (!("IntersectionObserver" in window) || !els.length) {
      els.forEach(function (e) { e.classList.add("in"); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });
    // Defer observing by two frames so the hidden start-state paints first —
    // otherwise above-the-fold elements get .in in the same frame as render
    // and the CSS transition never runs (content stays stuck hidden).
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        els.forEach(function (e) { io.observe(e); });
      });
    });
  }

  /* ---------- ACTIVE NAV LINK ---------- */
  function initActive() {
    var path = location.pathname.split("/").pop() || "index.html";
    document.querySelectorAll(".nav .links a[data-page]").forEach(function (a) {
      if (a.dataset.page === path || (path === "" && a.dataset.page === "index.html")) a.classList.add("active");
    });
  }

  /* ---------- MOBILE NAV (burger injected so every page gets it) ---------- */
  function initBurger() {
    var nav = document.querySelector(".nav");
    var links = document.querySelector(".nav .links");
    if (!nav || !links) return;
    var b = nav.querySelector(".nav-burger");
    if (!b) {
      b = document.createElement("button");
      b.className = "nav-burger";
      b.type = "button";
      b.setAttribute("aria-label", "Menu");
      b.setAttribute("aria-expanded", "false");
      b.innerHTML = "<span></span>";
      nav.appendChild(b);
    }
    function setOpen(open) {
      links.classList.toggle("open", open);
      b.classList.toggle("open", open);
      b.setAttribute("aria-expanded", open ? "true" : "false");
    }
    b.addEventListener("click", function () { setOpen(!links.classList.contains("open")); });
    // close after picking a destination (but not when toggling language)
    links.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", function () { setOpen(false); });
    });
    // reset when returning to desktop width
    window.addEventListener("resize", function () {
      if (window.innerWidth > 900) setOpen(false);
    }, { passive: true });
  }

  /* ---------- ROTATING WORD (footer headline) ---------- */
  function initRotators() {
    var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion:reduce)").matches;
    document.querySelectorAll(".fc-rotate").forEach(function (box) {
      var words = (box.getAttribute("data-words") || "").split(",")
        .map(function (s) { return s.trim(); }).filter(Boolean);
      if (words.length < 2) return;
      box.textContent = "";
      // invisible in-flow sizer keeps the box sized to the current word
      var sizer = document.createElement("span");
      sizer.className = "fc-sizer";
      sizer.textContent = words[0];
      box.appendChild(sizer);
      var els = words.map(function (w, i) {
        var s = document.createElement("span");
        s.className = "w" + (i === 0 ? " is-active" : "");
        s.textContent = w;
        box.appendChild(s);
        return s;
      });
      if (reduce) return;            // honour reduced-motion: show first word, no cycling
      var cur = 0;
      setInterval(function () {
        var next = (cur + 1) % words.length;
        els.forEach(function (s, i) {
          s.classList.toggle("is-active", i === next);
          s.classList.toggle("is-prev", i < next);   // words before current exit upward
        });
        sizer.textContent = words[next];
        cur = next;
      }, 2000);
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    initLang(); initNav(); initReveal(); initActive(); initBurger(); initRotators();
  });
})();
