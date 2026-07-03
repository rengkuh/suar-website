/* =========================================================================
   SUAR · "Setting Us Apart" — FeatureSection
   Scroll-driven expanding feature rows + click-to-open detail view.
   Data-driven: edit the FEATURES array below to change everything.
   Components: FeatureSection · FeatureRow · FeatureTitle · FeatureVisualTab · FeatureDetailPanel
   ========================================================================= */
(function () {
  "use strict";

  /* ----------------------------------------------------------------------
     FEATURE DATA — replace freely. `image`/`detail.hero` = filename in
     ~/site/ (or null for a solid UV tab). `gallery` = number of related
     image placeholders shown in the detail view.
     ---------------------------------------------------------------------- */
  var FEATURES = [
    {
      no: "01", title: "Reliable", category: "Specification you can plan around",
      icon: "icon-reliable.png",
      video: "videos/reliable.mp4", frame: "images/frame-reliable.png",   // ember motion clip + schematic frame overlay
      summary: "Industrial buyers do not have fuel flexibility. A boiler calibrated for a specific calorific range cannot absorb variation batch to batch. That is why every pellet SUAR produces is held to the same specification: consistent heat output, low chlorine and potassium, sulfur levels that coal cannot match. Not because certification requires it. Because the alternative is a partner who cannot plan around you.",
      points: ["Consistent heat output, batch to batch", "Low chlorine and potassium", "Sulfur levels coal cannot match"],
      image: null,
      detail: {
        lead: "Industrial buyers do not have fuel flexibility. A boiler calibrated for a specific calorific range cannot absorb variation batch to batch.",
        body: ["That is why every pellet SUAR produces is held to the same specification: consistent heat output, low chlorine and potassium, sulfur levels that coal cannot match.",
               "Not because certification requires it. Because the alternative is a partner who cannot plan around you."],
        points: ["Consistent heat output across every batch", "Low chlorine and potassium content", "Sulfur levels coal cannot match", "Held to spec by choice, not just to certify"],
        gallery: 3
      }
    },
    {
      no: "02", title: "Traceable", category: "Documented from waste to sack",
      icon: "icon-traceable.png",
      video: "videos/traceable.mp4", frame: "images/frame-trace.png",   // motion clip + certification frame overlay
      summary: "The feedstock starts as waste. Empty fruit bunches pulled from palm oil mills, material that would otherwise decompose in open piles or burn in open fields. From that point forward, every stage is recorded. The batch, the source, the shipment. By the time a sack reaches a buyer, its entire journey is already documented. Knowing what you burn matters as much as how well it burns.",
      points: ["Sourced from palm oil mill residue", "Batch, source and shipment recorded", "Fully documented before delivery"],
      image: null,
      detail: {
        lead: "The feedstock starts as waste. Empty fruit bunches pulled from palm oil mills, material that would otherwise decompose in open piles or burn in open fields.",
        body: ["From that point forward, every stage is recorded. The batch, the source, the shipment. By the time a sack reaches a buyer, its entire journey is already documented.",
               "Knowing what you burn matters as much as how well it burns."],
        points: ["Feedstock from empty fruit bunch residue", "Every stage recorded — batch, source, shipment", "Journey documented before it reaches the buyer", "Provenance treated as part of the product"],
        gallery: 3
      }
    },
    {
      no: "03", title: "Sustainable", category: "Built from what agriculture leaves behind",
      icon: "icon-sustainable.png",
      video: "videos/sustainable.mp4", frame: "images/frame-sustainable.png",   // living moss motion clip + "no waste" frame overlay
      summary: "Indonesia produces more empty fruit bunch residue than almost any country on earth. Most of it releases methane as it rots, or carbon as it burns with no return. SUAR does not begin with extraction. It begins with what agriculture already leaves behind. The pellet at the end of that process is not a compromise on energy output. It is certified solid fuel that replaces coal, built from material that had no better destination.",
      points: ["Starts with residue, not extraction", "Diverts methane and open-field burning", "Certified solid fuel that replaces coal"],
      image: null,
      detail: {
        lead: "Indonesia produces more empty fruit bunch residue than almost any country on earth. Most of it releases methane as it rots, or carbon as it burns with no return.",
        body: ["SUAR does not begin with extraction. It begins with what agriculture already leaves behind.",
               "The pellet at the end of that process is not a compromise on energy output. It is certified solid fuel that replaces coal, built from material that had no better destination."],
        points: ["Begins with residue, not new extraction", "Diverts methane from rotting biomass", "Avoids open-field carbon release", "Certified solid fuel that replaces coal"],
        gallery: 3
      }
    }
  ];

  var section = document.getElementById("setting-us-apart");
  var rowsEl  = document.getElementById("fs-rows");
  if (!section || !rowsEl) return;

  var reduce  = window.matchMedia && window.matchMedia("(prefers-reduced-motion:reduce)").matches;
  function isMobile() { return window.matchMedia("(max-width:900px)").matches; }

  function el(tag, cls, html) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (html != null) n.innerHTML = html;
    return n;
  }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) {
    return ({ "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;" })[c]; }); }

  /* ---------- build FeatureRows ---------- */
  function frameOverlay(f) {
    /* per-feature SUAR technical frame (PNG: lines → bone, bg transparent) */
    return '<img class="fvt-frameimg" src="' + esc(f.frame) + '" alt="" aria-hidden="true">';
  }
  function visualInner(f) {
    var media = "";
    if (f.video) {
      media = '<video class="fvt-video" src="' + esc(f.video) + '" autoplay muted loop playsinline preload="metadata"></video>';
    } else if (f.image) {
      media = '<img class="fvt-img" src="' + esc(f.image) + '" alt="">';
    }
    return media + (f.frame ? frameOverlay(f) : "") +
      (f.video ? "" : '<span class="fvt-no">' + esc(f.no) + '</span>') +
      '<span class="fvt-cue">View detail →</span>';
  }
  function rowMarkup(f, i) {
    var pts = (f.points || []).map(function (p) { return "<li>" + esc(p) + "</li>"; }).join("");
    var icon = f.icon ? '<img class="fr-icon" src="' + esc(f.icon) + '" alt="" aria-hidden="true">' : "";
    return '' +
      '<div class="fr-left">' +
        '<div class="fr-head">' +
          icon +
          '<span class="feature-no mono">' + esc(f.no) + '</span>' +
        '</div>' +
        '<h3 class="feature-title">' + esc(f.title) + '</h3>' +
        '<span class="fr-cat">' + esc(f.category) + '</span>' +
        '<div class="fr-context"><div class="fr-context-inner">' +
          '<p>' + esc(f.summary) + '</p>' +
          (pts ? '<ul>' + pts + '</ul>' : '') +
          '<button class="fr-open" type="button" data-open="' + i + '">View detail →</button>' +
        '</div></div>' +
      '</div>' +
      '<button class="feature-visual-tab" type="button" data-open="' + i + '" ' +
        'aria-label="Open ' + esc(f.title) + ' detail">' + visualInner(f) + '</button>';
  }
  FEATURES.forEach(function (f, i) {
    var row = el("article", "feature-row");
    row.setAttribute("data-index", i);
    row.setAttribute("role", "listitem");
    row.innerHTML = rowMarkup(f, i);
    rowsEl.appendChild(row);
  });
  var rows = [].slice.call(rowsEl.querySelectorAll(".feature-row"));

  /* ---------- active state ---------- */
  var active = 0;
  function setActive(i) {
    active = i;
    rows.forEach(function (r, idx) { r.classList.toggle("active", idx === i); });
  }
  setActive(0);

  /* ---------- scroll-driven active (desktop) ---------- */
  var ticking = false;
  function evalActive() {
    ticking = false;
    if (isMobile() || reduce) return;
    var r0 = section.getBoundingClientRect();
    var vh = window.innerHeight;
    if (r0.bottom < 0 || r0.top > vh) return;           // section off-screen
    var mid = vh * 0.5, best = active, bestD = Infinity;
    rows.forEach(function (row, idx) {
      var rc = row.getBoundingClientRect();
      var c = rc.top + rc.height / 2;
      var d = Math.abs(c - mid);
      if (d < bestD) { bestD = d; best = idx; }
    });
    if (best !== active) setActive(best);
  }
  function onScroll() { if (!ticking) { ticking = true; requestAnimationFrame(evalActive); } }
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", function () {
    if (isMobile()) { /* keep current open on mobile */ } else { onScroll(); }
  }, { passive: true });

  /* ---------- FeatureDetailPanel ---------- */
  var overlay = el("div", "feature-detail");
  overlay.id = "feature-detail";
  overlay.setAttribute("aria-hidden", "true");
  overlay.innerHTML =
    '<div class="fd-bar">' +
      '<button class="fd-back" type="button"><span aria-hidden="true">←</span> Back to Setting Us Apart</button>' +
      '<button class="fd-close" type="button" aria-label="Close detail">Close ✕</button>' +
    '</div>' +
    '<div class="fd-body"></div>';
  document.body.appendChild(overlay);
  var fdBody = overlay.querySelector(".fd-body");

  function detailMarkup(f) {
    var d = f.detail || {};
    var hero = d.hero || f.image;
    var heroInner = hero ? '<img src="' + esc(hero) + '" alt="">' : '<span class="fd-hero-no">' + esc(f.no) + '</span>';
    var body = (d.body || []).map(function (p) { return "<p>" + esc(p) + "</p>"; }).join("");
    var pts = (d.points || []).map(function (p, k) {
      return '<li><span class="pn">' + ("0" + (k + 1)).slice(-2) + '</span><span>' + esc(p) + '</span></li>'; }).join("");
    var gal = "";
    for (var g = 0; g < (d.gallery || 0); g++) gal += '<div class="gph"></div>';
    var dicon = f.icon ? '<img class="fd-icon" src="' + esc(f.icon) + '" alt="" aria-hidden="true">' : "";
    return '' +
      '<span class="fd-eyebrow">Setting Us Apart · ' + esc(f.no) + '</span>' +
      dicon +
      '<h2 class="fd-title">' + esc(f.title) + '</h2>' +
      '<div class="fd-hero">' + heroInner + '</div>' +
      '<div class="fd-grid">' +
        '<div class="fd-text">' +
          (d.lead ? '<p class="fd-lead">' + esc(d.lead) + '</p>' : '') + body +
        '</div>' +
        '<div class="fd-aside">' +
          '<ul class="fd-points">' + pts + '</ul>' +
        '</div>' +
      '</div>' +
      (gal ? '<div class="fd-gallery">' + gal + '</div>' : '');
  }

  var lastFocus = null;
  function openDetail(i) {
    var f = FEATURES[i]; if (!f) return;
    fdBody.innerHTML = detailMarkup(f);
    overlay.scrollTop = 0;
    lastFocus = document.activeElement;
    document.documentElement.classList.add("detail-open");
    overlay.classList.add("open");
    overlay.setAttribute("aria-hidden", "false");
    var back = overlay.querySelector(".fd-back");
    if (back) back.focus();
  }
  function closeDetail() {
    overlay.classList.remove("open");
    overlay.setAttribute("aria-hidden", "true");
    document.documentElement.classList.remove("detail-open");
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }
  overlay.querySelector(".fd-back").addEventListener("click", closeDetail);
  overlay.querySelector(".fd-close").addEventListener("click", closeDetail);
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && overlay.classList.contains("open")) closeDetail();
  });

  /* ---------- row interaction ----------
     Desktop: scroll previews the active row; clicking a row opens its detail.
     Mobile : accordion — tapping a row expands it; the "View detail →" button
              (or the visual tab) opens the full detail. ---------- */
  rows.forEach(function (row, i) {
    row.addEventListener("click", function (e) {
      var opener = e.target.closest("[data-open]");
      if (isMobile()) {
        if (opener) { openDetail(parseInt(opener.getAttribute("data-open"), 10)); return; }
        setActive(active === i ? -1 : i);     // accordion toggle
      } else {
        openDetail(i);
      }
    });
  });

  // first paint
  requestAnimationFrame(function () { requestAnimationFrame(evalActive); });
})();
