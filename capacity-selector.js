/* =========================================================================
   SUAR · home.capacity — Interactive Column Accordion
   Vanilla port (no React/Tailwind), restyled to the design sketch:
   flat UV columns split by hairlines. Each column rests as a circle icon +
   label; the active column expands to a big headline + sub + "Learn More."
   Hover/click activates one column; the rest compress. Same expand
   transition as before — only the layout/visuals changed.
   Data-driven: edit the PANELS array. `icon` = filename in ~/site/,
   `more` = where the Learn More link points.
   ========================================================================= */
(function () {
  "use strict";

  var PANELS = [
    {
      key: "plant", icon: "capico-plant.png", more: "project.html",
      titleEn: "Pilot Plant",        titleId: "Pabrik Pilot",
      subEn:   "5 TPH pilot facility, on process — proving the line before it scales.",
      subId:   "Fasilitas pilot 5 TPH, sedang berjalan — membuktikan lini sebelum ditingkatkan."
    },
    {
      key: "line", icon: "capico-line.png", more: "project.html",
      titleEn: "Production Line",     titleId: "Lini Produksi",
      subEn:   "10 TPH of designed throughput across an integrated line.",
      subId:   "10 TPH throughput terancang pada satu lini terintegrasi."
    },
    {
      key: "mills", icon: "capico-mills.png", more: "project.html",
      titleEn: "Pellet Mills",        titleId: "Mesin Pelet",
      subEn:   "Four parallel pellet mills holding output to one spec.",
      subId:   "Empat mesin pelet paralel menjaga keluaran pada satu spesifikasi."
    },
    {
      key: "sections", icon: "capico-sections.png", more: "project.html",
      titleEn: "Process Sections",    titleId: "Seksi Proses",
      subEn:   "Five integrated sections, from feedstock intake to finishing.",
      subId:   "Lima seksi terintegrasi, dari penerimaan bahan baku hingga penyelesaian."
    },
    {
      key: "pellets", icon: "capico-pellets.png", more: "product.html",
      titleEn: "Finished Pellets",    titleId: "Pelet Jadi",
      subEn:   "Certified solid biomass fuel, ready for industrial offtake.",
      subId:   "Bahan bakar biomassa padat bersertifikat, siap untuk serapan industri."
    }
  ];

  var root = document.getElementById("cap-selector");
  if (!root) return;

  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion:reduce)").matches;

  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) {
    return ({ "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;" })[c]; }); }

  function bilingual(en, id) {
    return '<span data-i18n-en="">' + esc(en) + '</span>' +
           '<span data-i18n-id="">' + esc(id) + '</span>';
  }

  function panelMarkup(p) {
    var icon = p.icon ? '<img src="' + esc(p.icon) + '" alt="" aria-hidden="true">' : '';
    return '' +
      '<span class="cs-rest">' +
        '<span class="cs-circle">' + icon + '</span>' +
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

  PANELS.forEach(function (p, i) {
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
  setActive(PANELS.length - 1);   // default: last panel open (matches reference)

  opts.forEach(function (o, i) {
    o.addEventListener("click", function () { if (i !== active) setActive(i); });
    o.addEventListener("keydown", function (e) {
      if (e.key === "ArrowRight" || e.key === "ArrowDown") { e.preventDefault(); var n = (active + 1) % opts.length; setActive(n); opts[n].focus(); }
      else if (e.key === "ArrowLeft" || e.key === "ArrowUp") { e.preventDefault(); var pv = (active - 1 + opts.length) % opts.length; setActive(pv); opts[pv].focus(); }
    });
    // hover preview on desktop (pointer:fine) — feels alive, like the reference
    o.addEventListener("mouseenter", function () {
      if (window.matchMedia("(hover:hover) and (pointer:fine)").matches && i !== active) setActive(i);
    });
  });

  /* stagger-fade panels in from the left on first paint */
  if (reduce) {
    opts.forEach(function (o) { o.classList.add("in"); });
  } else {
    opts.forEach(function (o, i) {
      setTimeout(function () { o.classList.add("in"); }, 150 * i);
    });
  }
})();
