/* =========================================================================
   SUAR · what-we-do.projects — Interactive Column Accordion
   Same expand/collapse transition as home.capacity, re-used for the three
   project locations. Data-driven: edit the PROJECTS array.
   `more` = where the "Learn More" link points.
   ========================================================================= */
(function () {
  "use strict";

  var PROJECTS = [
    {
      key: "jambi", num: "01", more: "contact.html",
      titleEn: "Jambi",              titleId: "Jambi",
      subEn:   "Planned biomass pellet facility in Jambi, sited inside Sumatra's palm belt — feedstock at the doorstep.",
      subId:   "Rencana fasilitas pelet biomassa di Jambi, di dalam sabuk sawit Sumatra — bahan baku di depan pintu."
    },
    {
      key: "kalteng", num: "02", more: "contact.html",
      titleEn: "Central Kalimantan", titleId: "Kalimantan Tengah",
      subEn:   "Our Lamandau pilot plant — a 5 TPH facility proving the production line before it scales to full capacity.",
      subId:   "Pabrik pilot Lamandau — fasilitas 5 TPH yang membuktikan lini produksi sebelum ditingkatkan ke kapasitas penuh."
    },
    {
      key: "palembang", num: "03", more: "contact.html",
      titleEn: "Palembang",          titleId: "Palembang",
      subEn:   "Planned facility in South Sumatra, positioned close to concentrated feedstock and export logistics.",
      subId:   "Rencana fasilitas di Sumatra Selatan, dekat bahan baku terkonsentrasi dan logistik ekspor."
    }
  ];

  var root = document.getElementById("proj-selector");
  if (!root) return;

  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion:reduce)").matches;

  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) {
    return ({ "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;" })[c]; }); }

  function bilingual(en, id) {
    return '<span data-i18n-en="">' + esc(en) + '</span>' +
           '<span data-i18n-id="">' + esc(id) + '</span>';
  }

  function panelMarkup(p) {
    return '' +
      '<span class="cs-rest">' +
        '<span class="cs-circle"><span class="cs-num">' + esc(p.num) + '</span></span>' +
        '<span class="cs-label">' + bilingual(p.titleEn, p.titleId) + '</span>' +
      '</span>' +
      '<span class="cs-active">' +
        '<span class="cs-h">' + bilingual(p.titleEn, p.titleId) + '</span>' +
        '<span class="cs-asub">' + bilingual(p.subEn, p.subId) + '</span>' +
        '<a class="cs-more" href="' + esc(p.more || "#") + '">' +
          bilingual("Learn More.", "Selengkapnya.") +
        '</a>' +
      '</span>';
  }

  PROJECTS.forEach(function (p, i) {
    var el = document.createElement("div");
    el.className = "cap-opt";
    el.setAttribute("role", "tab");
    el.setAttribute("tabindex", "-1");
    el.setAttribute("data-index", i);
    el.setAttribute("aria-label", p.titleEn);
    el.innerHTML = panelMarkup(p);
    root.appendChild(el);
  });

  var opts = [].slice.call(root.querySelectorAll(".cap-opt"));
  var active = 0;

  function setActive(i) {
    active = i;
    opts.forEach(function (o, idx) {
      var on = idx === i;
      o.classList.toggle("active", on);
      o.setAttribute("aria-selected", on ? "true" : "false");
      o.tabIndex = on ? 0 : -1;
    });
  }
  setActive(1);   // default: Central Kalimantan (the pilot) open

  opts.forEach(function (o, i) {
    o.addEventListener("click", function () { if (i !== active) setActive(i); });
    o.addEventListener("keydown", function (e) {
      if (e.key === "ArrowRight" || e.key === "ArrowDown") { e.preventDefault(); var n = (active + 1) % opts.length; setActive(n); opts[n].focus(); }
      else if (e.key === "ArrowLeft" || e.key === "ArrowUp") { e.preventDefault(); var pv = (active - 1 + opts.length) % opts.length; setActive(pv); opts[pv].focus(); }
    });
    o.addEventListener("mouseenter", function () {
      if (window.matchMedia("(hover:hover) and (pointer:fine)").matches && i !== active) setActive(i);
    });
  });

  if (reduce) {
    opts.forEach(function (o) { o.classList.add("in"); });
  } else {
    opts.forEach(function (o, i) {
      setTimeout(function () { o.classList.add("in"); }, 150 * i);
    });
  }
})();
