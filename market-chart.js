/* =========================================================================
   SUAR · partnership — Biomass price index chart (vanilla SVG, no deps)
   Toggles: pellet type (EFB / Wood) × range (Monthly / Yearly).
   Three series: Asia (Japan & Korea CIF), EU (ARA CIF), Local (FOB Sumatra).
   All values normalised to US$/tonne (EU converted ~1.08). INDICATIVE data,
   anchored to public references — edit DATA to update. Not a live feed.
   ========================================================================= */
(function () {
  "use strict";

  var MONTHS = ["Jul","Aug","Sep","Oct","Nov","Dec","Jan","Feb","Mar","Apr","May","Jun"];
  var YEARS  = ["2021","2022","2023","2024","2025","2026"];

  var DATA = {
    efb: {
      monthly: {
        asia:  [104,106,108,110,113,116,118,120,117,114,113,115],
        eu:    [150,152,154,158,162,165,167,168,164,161,162,164],
        local: [90,91,93,95,97,98,100,101,99,98,99,100]
      },
      yearly: {
        asia:  [78,86,100,116,112,118],
        eu:    [108,124,172,188,172,165],
        local: [58,66,80,94,96,100]
      }
    },
    wood: {
      monthly: {
        asia:  [116,118,120,124,130,136,140,137,131,126,122,122],
        eu:    [232,238,246,256,268,276,272,262,256,251,255,273],
        local: [94,95,97,100,103,105,106,104,101,99,98,98]
      },
      yearly: {
        asia:  [128,138,166,182,150,128],
        eu:    [176,208,318,300,272,266],
        local: [68,78,98,110,102,98]
      }
    }
  };

  var SERIES = [
    { key: "asia",  color: "#5F52AA", en: "Asia · Japan & Korea", id: "Asia · Jepang & Korea", ja: "アジア · 日本・韓国" },
    { key: "eu",    color: "#E0A200", en: "Europe · EU (ARA)",    id: "Eropa · UE (ARA)",       ja: "欧州 · EU（ARA）" },
    { key: "local", color: "#1f8a5b", en: "Local · Indonesia",     id: "Lokal · Indonesia",      ja: "国内 · インドネシア" }
  ];

  var wrap = document.getElementById("mc-canvas");
  if (!wrap) return;
  var legendEl = document.getElementById("mc-legend");

  var state = { type: "wood", range: "monthly" };

  var W = 560, H = 380, PL = 52, PR = 18, PT = 18, PB = 34;
  var plotW = W - PL - PR, plotH = H - PT - PB;

  function niceBounds(min, max) {
    var pad = (max - min) * 0.15 || 10;
    var lo = Math.max(0, Math.floor((min - pad) / 20) * 20);
    var hi = Math.ceil((max + pad) / 20) * 20;
    return [lo, hi];
  }

  function currentLabels() { return state.range === "monthly" ? MONTHS : YEARS; }

  function render() {
    var d = DATA[state.type][state.range];
    var labels = currentLabels();
    var n = labels.length;
    var all = [];
    SERIES.forEach(function (s) { all = all.concat(d[s.key]); });
    var b = niceBounds(Math.min.apply(null, all), Math.max.apply(null, all));
    var lo = b[0], hi = b[1];

    function x(i) { return PL + (n === 1 ? plotW / 2 : (i / (n - 1)) * plotW); }
    function y(v) { return PT + plotH - ((v - lo) / (hi - lo)) * plotH; }

    var svg = '<svg viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="Biomass price index chart">';

    // horizontal gridlines + Y labels
    var steps = 4;
    for (var g = 0; g <= steps; g++) {
      var val = lo + (hi - lo) * (g / steps);
      var gy = y(val);
      svg += '<line x1="' + PL + '" y1="' + gy.toFixed(1) + '" x2="' + (W - PR) + '" y2="' + gy.toFixed(1) + '" class="mc-grid"/>';
      svg += '<text x="' + (PL - 10) + '" y="' + (gy + 4).toFixed(1) + '" class="mc-ylab" text-anchor="end">' + Math.round(val) + '</text>';
    }
    // X labels
    for (var i = 0; i < n; i++) {
      svg += '<text x="' + x(i).toFixed(1) + '" y="' + (H - 10) + '" class="mc-xlab" text-anchor="middle">' + labels[i] + '</text>';
    }
    // series lines + end dots
    SERIES.forEach(function (s) {
      var arr = d[s.key];
      var pts = arr.map(function (v, i) { return x(i).toFixed(1) + "," + y(v).toFixed(1); }).join(" ");
      svg += '<polyline points="' + pts + '" fill="none" stroke="' + s.color + '" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round" vector-effect="non-scaling-stroke"/>';
      var li = arr.length - 1;
      svg += '<circle cx="' + x(li).toFixed(1) + '" cy="' + y(arr[li]).toFixed(1) + '" r="3.5" fill="' + s.color + '"/>';
    });
    svg += '</svg>';
    wrap.innerHTML = svg;

    // legend with latest values
    if (legendEl) {
      var idLang = document.body.classList.contains("lang-id");
      var jaLang = document.body.classList.contains("lang-ja");
      legendEl.innerHTML = SERIES.map(function (s) {
        var arr = d[s.key];
        var last = arr[arr.length - 1];
        var name = jaLang ? s.ja : idLang ? s.id : s.en;
        return '<span class="mc-leg"><span class="mc-dot" style="background:' + s.color + '"></span>' +
          '<span class="mc-leg-name"><span data-i18n-en="">' + s.en + '</span><span data-i18n-id="">' + s.id + '</span><span data-i18n-ja="">' + s.ja + '</span></span>' +
          '<span class="mc-leg-val">US$ ' + last + '</span></span>';
      }).join("");
    }
  }

  // toggle handlers
  document.querySelectorAll(".mc-toggle").forEach(function (grp) {
    var group = grp.getAttribute("data-group");
    grp.querySelectorAll("button").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var v = btn.getAttribute("data-v");
        if (state[group] === v) return;
        state[group] = v;
        grp.querySelectorAll("button").forEach(function (b) { b.classList.toggle("active", b === btn); });
        grp.querySelectorAll("button").forEach(function (b) { b.setAttribute("aria-pressed", b === btn ? "true" : "false"); });
        render();
      });
    });
  });

  // re-render legend names on language switch (lang button toggles body.lang-id)
  document.querySelectorAll(".lang [data-lang]").forEach(function (b) {
    b.addEventListener("click", function () { setTimeout(render, 0); });
  });

  render();
})();
