/*
 * In-browser replay of the AI Portfolio Commentary analytics.
 * Same methodology as src/metrics.py in FKP-Codes/Financial_Commentary:
 * buy-and-hold portfolio, 252 trading days, Sharpe on daily excess returns (ddof = 1).
 */
(function () {
  "use strict";

  var TD = 252;
  var ASSETS = [
    { ticker: "SXR8.DE", name: "iShares Core S&P 500 UCITS ETF", cls: { en: "US equities", fr: "Actions US" }, clsFr: "Actions US", color: "--s-1" },
    { ticker: "EXW1.DE", name: "iShares Core EURO STOXX 50 UCITS ETF", cls: { en: "Euro area equities", fr: "Actions zone euro" }, clsFr: "Actions zone euro", color: "--s-2" },
    { ticker: "EUNH.DE", name: "iShares Core Euro Government Bond UCITS ETF", cls: { en: "Euro govt bonds", fr: "Oblig. souveraines euro" }, clsFr: "Obligations souveraines zone euro", color: "--s-3" }
  ];
  var BENCH_W = [0.40, 0.20, 0.40];
  var DEFAULT_W = [50, 20, 30];
  var RF = 0.02;

  var L = {
    period: { en: "Period", fr: "Période" },
    ytd: { en: "YTD", fr: "YTD" }, y1: { en: "1 year", fr: "1 an" }, y3: { en: "3 years", fr: "3 ans" },
    alloc: { en: "Portfolio allocation", fr: "Allocation du portefeuille" },
    renorm: { en: "Weights are renormalised to 100 %. Strategic allocation (benchmark): 40 / 20 / 40.", fr: "Poids renormalisés à 100 %. Allocation stratégique (benchmark) : 40 / 20 / 40." },
    reset: { en: "Reset", fr: "Réinitialiser" },
    k: [
      { en: "Cumulative return", fr: "Performance cumulée" },
      { en: "Annualised return", fr: "Performance annualisée" },
      { en: "Annualised volatility", fr: "Volatilité annualisée" },
      { en: "Maximum drawdown", fr: "Drawdown maximum" },
      { en: "Sharpe ratio", fr: "Ratio de Sharpe" },
      { en: "Tracking error", fr: "Tracking error" }
    ],
    deltaNote: { en: "▲▼ Difference vs the strategic allocation (green = better, red = worse).", fr: "▲▼ Écart vs l’allocation stratégique (vert = mieux, rouge = moins bien)." },
    pts: { en: "pts", fr: "pts" },
    base100: { en: "Base 100", fr: "Base 100" },
    dd: { en: "Drawdown", fr: "Drawdown" },
    contrib: { en: "Contributions", fr: "Contributions" },
    port: { en: "Portfolio", fr: "Portefeuille" },
    bench: { en: "Strategic allocation", fr: "Allocation stratégique" },
    total: { en: "Total", fr: "Total" },
    table: { en: "Line-by-line detail", fr: "Détail par ligne" },
    th: [
      { en: "Line", fr: "Ligne" }, { en: "Initial wt", fr: "Poids initial" }, { en: "Current wt", fr: "Poids actuel" },
      { en: "Bench wt", fr: "Poids bench" }, { en: "Return", fr: "Perf." }, { en: "Vol.", fr: "Vol." },
      { en: "Max DD", fr: "DD max" }, { en: "Contrib.", fr: "Contrib." }
    ],
    payload: { en: "What the model receives", fr: "Ce que reçoit le modèle" },
    payloadSub: { en: "JSON payload · single source of truth", fr: "Payload JSON · source unique de vérité" },
    copy: { en: "Copy", fr: "Copier" }, copied: { en: "Copied", fr: "Copié" },
    source: {
      en: "Source: public Yahoo Finance prices (dividend-adjusted, EUR, Xetra) from the repository snapshot · computed in your browser with the app’s methodology.",
      fr: "Source : cours publics Yahoo Finance (ajustés des dividendes, EUR, Xetra) issus du snapshot du dépôt · calculés dans votre navigateur avec la méthodologie de l’app."
    },
    loading: { en: "Loading public market data…", fr: "Chargement des données de marché publiques…" },
    loadErr: { en: "The data snapshot could not be loaded.", fr: "Le snapshot de données n’a pas pu être chargé." },
    ddAxis: { en: "Drawdown", fr: "Drawdown" },
    ai: { en: "AI management commentary", fr: "Commentaire de gestion IA" },
    aiSub: { en: "Claude Haiku 4.5 · written from the figures above only", fr: "Claude Haiku 4.5 · rédigé à partir des seuls chiffres ci-dessus" },
    audience: { en: "Audience", fr: "Public cible" },
    institutional: { en: "Institutional", fr: "Institutionnels" },
    private: { en: "Private clients", fr: "Clientèle privée" },
    length: { en: "Length", fr: "Longueur" },
    short: { en: "Short", fr: "Court" }, standard: { en: "Standard", fr: "Standard" }, detailed: { en: "Detailed", fr: "Détaillé" },
    notes: { en: "Manager’s market context (optional)", fr: "Contexte de marché du gérant (optionnel)" },
    notesPh: { en: "e.g. ECB rate cut in June, rotation towards cyclicals, profit-taking on US equities at period end…", fr: "Ex. : baisse des taux de la BCE en juin, rotation vers les valeurs cycliques, prises de profits sur les actions US en fin de période…" },
    notesHelp: { en: "The model invents no event: anything macro it mentions must come from here.", fr: "Le modèle n’invente aucun événement : tout élément macro cité doit venir d’ici." },
    generate: { en: "Generate the commentary", fr: "Générer le commentaire" },
    regenerate: { en: "Regenerate", fr: "Régénérer" },
    generating: { en: "Writing…", fr: "Rédaction…" },
    stop: { en: "Stop", fr: "Arrêter" },
    download: { en: "Download .md", fr: "Télécharger .md" },
    placeholder: { en: "Set the scenario above, then generate: the commentary is written live from the current figures.", fr: "Réglez le scénario ci-dessus puis générez : le commentaire est rédigé en direct à partir des chiffres affichés." },
    stale: { en: "The figures changed since this commentary was written - regenerate to update it.", fr: "Les chiffres ont changé depuis la rédaction de ce commentaire - régénérez pour le mettre à jour." },
    remaining: { en: "generation(s) left this hour", fr: "génération(s) restante(s) cette heure-ci" },
    errRate: { en: "Demo limit reached for now (a few generations per hour per visitor). Please try again later.", fr: "Limite de la démo atteinte pour le moment (quelques générations par heure et par visiteur). Réessayez plus tard." },
    errDaily: { en: "The demo’s daily budget is used up. Please come back tomorrow.", fr: "Le budget quotidien de la démo est épuisé. Revenez demain." },
    errGeneric: { en: "The commentary service is unavailable right now. Please try again in a moment.", fr: "Le service de commentaire est indisponible pour le moment. Réessayez dans un instant." },
    errNetwork: { en: "service unreachable: network or CORS", fr: "service injoignable : réseau ou CORS" },
    notConfigured: { en: "Live generation is temporarily unavailable.", fr: "La génération en direct est momentanément indisponible." },
    disclaimer: { en: "AI-generated draft for a fictitious portfolio · to be reviewed by a manager · not investment advice.", fr: "Premier jet généré par IA pour un portefeuille fictif · à relire par un gérant · pas un conseil en investissement." }
  };

  function t(v) { return window.I18N ? window.I18N.t(v) : v.en; }
  function lang() { return window.I18N ? window.I18N.lang : "en"; }
  function cssVar(name) { return getComputedStyle(document.documentElement).getPropertyValue(name).trim(); }
  function el(tag, attrs, html) {
    var e = document.createElement(tag);
    if (attrs) Object.keys(attrs).forEach(function (k) { e.setAttribute(k, attrs[k]); });
    if (html != null) e.innerHTML = html;
    return e;
  }
  var SVGNS = "http://www.w3.org/2000/svg";
  function svg(tag, attrs) {
    var e = document.createElementNS(SVGNS, tag);
    if (attrs) Object.keys(attrs).forEach(function (k) { e.setAttribute(k, attrs[k]); });
    return e;
  }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }

  /* ------------------------------------------------------------------ formatting */
  function nf(digits) {
    return new Intl.NumberFormat(lang() === "fr" ? "fr-FR" : "en-GB", { minimumFractionDigits: digits, maximumFractionDigits: digits });
  }
  function pct(x, d, signed) {
    if (!isFinite(x)) return "-";
    var s = nf(d == null ? 2 : d).format(x * 100);
    if (signed && x > 0) s = "+" + s;
    return s + (lang() === "fr" ? " %" : "%");
  }
  function num(x, d, signed) {
    if (!isFinite(x)) return "-";
    var s = nf(d).format(x);
    return signed && x > 0 ? "+" + s : s;
  }
  function fmtDate(d, long) {
    return d.toLocaleDateString(lang() === "fr" ? "fr-FR" : "en-GB", long ? { day: "2-digit", month: "short", year: "numeric" } : { month: "short", year: "numeric" });
  }
  function iso(d) { return d.toISOString().slice(0, 10); }

  /* ------------------------------------------------------------------ data */
  var DATA = null; // { dates: Date[], px: number[][] (per asset) }
  function loadData(url) {
    if (DATA) return Promise.resolve(DATA);
    return fetch(url).then(function (r) {
      if (!r.ok) throw new Error(r.status);
      return r.text();
    }).then(function (txt) {
      var lines = txt.trim().split(/\r?\n/);
      var head = lines[0].split(",");
      var idx = ASSETS.map(function (a) { return head.indexOf(a.ticker); });
      var dates = [], px = ASSETS.map(function () { return []; });
      for (var i = 1; i < lines.length; i++) {
        var c = lines[i].split(",");
        var vals = idx.map(function (j) { return parseFloat(c[j]); });
        if (vals.some(function (v) { return !isFinite(v); })) continue;
        dates.push(new Date(c[0] + "T00:00:00Z"));
        vals.forEach(function (v, k) { px[k].push(v); });
      }
      DATA = { dates: dates, px: px };
      return DATA;
    });
  }

  /* ------------------------------------------------------------------ metrics (mirror of src/metrics.py) */
  function normalize(w) { var s = w.reduce(function (a, b) { return a + b; }, 0); return w.map(function (x) { return x / s; }); }
  function portfolioValue(px, w) {
    var nw = normalize(w), n = px[0].length, out = new Array(n);
    for (var i = 0; i < n; i++) {
      var v = 0;
      for (var k = 0; k < px.length; k++) v += nw[k] * px[k][i] / px[k][0];
      out[i] = v * 100;
    }
    return out;
  }
  function rets(s) { var r = []; for (var i = 1; i < s.length; i++) r.push(s[i] / s[i - 1] - 1); return r; }
  function mean(a) { return a.reduce(function (x, y) { return x + y; }, 0) / a.length; }
  function std(a) { var m = mean(a); return Math.sqrt(a.reduce(function (s, x) { return s + (x - m) * (x - m); }, 0) / (a.length - 1)); }
  function totalReturn(s) { return s[s.length - 1] / s[0] - 1; }
  function annReturn(s) { var n = s.length - 1; return n <= 0 ? 0 : Math.pow(1 + totalReturn(s), TD / n) - 1; }
  function annVol(s) { return std(rets(s)) * Math.sqrt(TD); }
  function ddSeries(s) { var peak = -Infinity; return s.map(function (v) { peak = Math.max(peak, v); return v / peak - 1; }); }
  function maxDD(s) { return Math.min.apply(null, ddSeries(s)); }
  function sharpe(s, rf) {
    var drf = Math.pow(1 + rf, 1 / TD) - 1;
    var ex = rets(s).map(function (r) { return r - drf; });
    var sd = std(ex);
    return sd < 1e-12 ? NaN : mean(ex) / sd * Math.sqrt(TD);
  }
  function trackingError(p, b) {
    var rp = rets(p), rb = rets(b);
    return std(rp.map(function (r, i) { return r - rb[i]; })) * Math.sqrt(TD);
  }
  function summary(s) { return [totalReturn(s), annReturn(s), annVol(s), maxDD(s), sharpe(s, RF)]; }
  function monthly(dates, s) {
    var ends = [], keys = [];
    for (var i = 0; i < dates.length; i++) {
      var k = iso(dates[i]).slice(0, 7);
      if (i === dates.length - 1 || iso(dates[i + 1]).slice(0, 7) !== k) { ends.push(s[i]); keys.push(k); }
    }
    var out = {}, prev = s[0];
    ends.forEach(function (v, j) { out[keys[j]] = v / prev - 1; prev = v; });
    return out;
  }

  function slice(period) {
    var d = DATA.dates, last = d[d.length - 1], start;
    if (period === "3y") start = d[0];
    else if (period === "ytd") start = new Date(Date.UTC(last.getUTCFullYear(), 0, 1));
    else start = new Date(last.getTime() - 365 * 864e5);
    var i0 = 0;
    while (i0 < d.length && d[i0] < start) i0++;
    return { dates: d.slice(i0), px: DATA.px.map(function (a) { return a.slice(i0); }) };
  }

  function compute(period, weights) {
    var sl = slice(period);
    var port = portfolioValue(sl.px, weights), bench = portfolioValue(sl.px, BENCH_W);
    var nw = normalize(weights), nb = normalize(BENCH_W);
    var assetRet = sl.px.map(totalReturn);
    var contrib = nw.map(function (w, k) { return w * assetRet[k]; });
    var drifted = nw.map(function (w, k) { return w * sl.px[k][sl.px[k].length - 1] / sl.px[k][0]; });
    var ds = drifted.reduce(function (a, b) { return a + b; }, 0);
    return {
      dates: sl.dates, port: port, bench: bench,
      assets: sl.px.map(function (a) { return a.map(function (v) { return v / a[0] * 100; }); }),
      pm: summary(port), bm: summary(bench), te: trackingError(port, bench),
      lines: ASSETS.map(function (a, k) {
        return { a: a, w0: nw[k], w1: drifted[k] / ds, wb: nb[k], ret: assetRet[k], vol: annVol(sl.px[k]), dd: maxDD(sl.px[k]), contrib: contrib[k] };
      }),
      monthly: monthly(sl.dates, port)
    };
  }

  /* Payload identical in shape to build_context() in src/commentary.py */
  function payload(r) {
    function p2(x) { return Math.round(x * 10000) / 100; }
    function metrics(m) {
      return { "Performance cumulée": p2(m[0]), "Performance annualisée": p2(m[1]), "Volatilité annualisée": p2(m[2]), "Drawdown maximum": p2(m[3]), "Ratio de Sharpe": Math.round(m[4] * 100) / 100 };
    }
    var mo = {};
    Object.keys(r.monthly).forEach(function (k) { mo[k] = p2(r.monthly[k]); });
    return {
      periode: { debut: iso(r.dates[0]), fin: iso(r.dates[r.dates.length - 1]) },
      portefeuille: metrics(r.pm),
      allocation_strategique_benchmark: metrics(r.bm),
      surperformance_relative_pts: p2(r.pm[0] - r.bm[0]),
      tracking_error_annualisee: p2(r.te),
      lignes: r.lines.map(function (l) {
        return { nom: l.a.name, classe_actifs: l.a.clsFr, "Poids initial": p2(l.w0), "Poids actuel": p2(l.w1), "Poids benchmark": p2(l.wb), Performance: p2(l.ret), "Volatilité": p2(l.vol), "Drawdown max": p2(l.dd), Contribution: p2(l.contrib) };
      }),
      performances_mensuelles_portefeuille: mo,
      unite: "Valeurs en %, sauf ratio de Sharpe. Portefeuille buy-and-hold, dividendes réinvestis, en EUR."
    };
  }

  function highlightJson(obj) {
    return esc(JSON.stringify(obj, null, 2))
      .replace(/(&quot;[^&]*?&quot;)(\s*:)/g, '<span class="k">$1</span>$2')
      .replace(/(:\s*)(&quot;.*?&quot;)/g, '$1<span class="s">$2</span>')
      .replace(/(:\s*)(-?\d+(?:\.\d+)?)/g, '$1<span class="n">$2</span>');
  }

  /* ------------------------------------------------------------------ charts */
  function niceTicks(min, max, count) {
    var span = max - min || 1, step = Math.pow(10, Math.floor(Math.log10(span / count)));
    var err = span / count / step;
    if (err >= 7.5) step *= 10; else if (err >= 3.5) step *= 5; else if (err >= 1.5) step *= 2;
    var ticks = [], v = Math.ceil(min / step) * step;
    for (; v <= max + 1e-9; v += step) ticks.push(Math.round(v * 1e6) / 1e6);
    return ticks;
  }

  function lineChart(host, tip, cfg) {
    host.innerHTML = "";
    var W = host.clientWidth || 800, H = host.clientHeight || 340;
    var m = { t: 12, r: cfg.endLabels ? 64 : 16, b: 26, l: 44 };
    var s = svg("svg", { class: "chart-svg", viewBox: "0 0 " + W + " " + H, role: "img", "aria-label": cfg.aria });
    var series = cfg.series.filter(function (x) { return x.visible !== false; });
    var all = []; series.forEach(function (x) { all = all.concat(x.values); });
    if (cfg.zeroTop) all.push(0);
    var lo = Math.min.apply(null, all), hi = Math.max.apply(null, all);
    var pad = (hi - lo) * 0.06 || 1; lo -= cfg.zeroTop ? pad : pad; hi += cfg.zeroTop ? 0 : pad;
    if (cfg.zeroTop) hi = Math.max(hi, 0);
    var n = cfg.dates.length;
    var x = function (i) { return m.l + (W - m.l - m.r) * i / (n - 1); };
    var y = function (v) { return m.t + (H - m.t - m.b) * (1 - (v - lo) / (hi - lo)); };

    var g = svg("g", { class: "grid" }), ax = svg("g", { class: "axis" });
    niceTicks(lo, hi, 5).forEach(function (tv) {
      g.appendChild(svg("line", { x1: m.l, x2: W - m.r, y1: y(tv), y2: y(tv) }));
      var tx = svg("text", { x: m.l - 8, y: y(tv) + 4, "text-anchor": "end" });
      tx.textContent = cfg.yFmt(tv);
      ax.appendChild(tx);
    });
    // x ticks: roughly one label per ~110px, placed on month starts
    var every = Math.max(1, Math.round(n / Math.max(2, Math.floor((W - m.l - m.r) / 110))));
    var lastLabel = -1e9;
    for (var i = 0; i < n; i++) {
      var newMonth = i === 0 || cfg.dates[i].getUTCMonth() !== cfg.dates[i - 1].getUTCMonth();
      if (newMonth && i - lastLabel >= every && x(i) < W - m.r - 30) {
        var t2 = svg("text", { x: x(i), y: H - 6, "text-anchor": i === 0 ? "start" : "middle" });
        t2.textContent = fmtDate(cfg.dates[i]);
        ax.appendChild(t2);
        lastLabel = i;
      }
    }
    s.appendChild(g);
    if (cfg.baseline != null) s.appendChild(svg("line", { class: "baseline", x1: m.l, x2: W - m.r, y1: y(cfg.baseline), y2: y(cfg.baseline) }));
    s.appendChild(ax);

    // areas (drawdown) then lines, highlighted series last so it sits on top
    series.slice().sort(function (a, b) { return (a.z || 0) - (b.z || 0); }).forEach(function (se) {
      var d = se.values.map(function (v, i) { return (i ? "L" : "M") + x(i).toFixed(1) + "," + y(v).toFixed(1); }).join("");
      if (se.area) {
        s.appendChild(svg("path", { d: d + "L" + x(n - 1) + "," + y(0) + "L" + x(0) + "," + y(0) + "Z", fill: cssVar(se.color), "fill-opacity": 0.14, stroke: "none" }));
      }
      s.appendChild(svg("path", {
        d: d, fill: "none", stroke: cssVar(se.color), "stroke-width": se.width || 2,
        "stroke-linejoin": "round", "stroke-linecap": "round", "stroke-dasharray": se.dash || "", opacity: se.opacity || 1
      }));
    });

    // direct labels at line ends (collision-avoided)
    if (cfg.endLabels) {
      var labs = series.filter(function (se) { return se.label; }).map(function (se) {
        var v = se.values[n - 1];
        return { y: y(v), text: se.label(v), color: cssVar(se.color) };
      }).sort(function (a, b) { return a.y - b.y; });
      for (var j = 1; j < labs.length; j++) if (labs[j].y - labs[j - 1].y < 14) labs[j].y = labs[j - 1].y + 14;
      labs.forEach(function (lb) {
        s.appendChild(svg("rect", { x: W - m.r + 6, y: lb.y - 4, width: 8, height: 3, rx: 1.5, fill: lb.color }));
        var tx = svg("text", { class: "end-label", x: W - m.r + 18, y: lb.y + 4 });
        tx.textContent = lb.text;
        s.appendChild(tx);
      });
    }

    // hover layer
    var cross = svg("line", { class: "crosshair", y1: m.t, y2: H - m.b, opacity: 0 });
    s.appendChild(cross);
    var dots = series.map(function (se) {
      var c = svg("circle", { class: "hover-dot", r: 4.5, fill: cssVar(se.color), opacity: 0 });
      s.appendChild(c);
      return c;
    });
    var hit = svg("rect", { x: m.l, y: m.t, width: W - m.l - m.r, height: H - m.t - m.b, fill: "transparent" });
    s.appendChild(hit);

    function move(evt) {
      var pt = evt.touches ? evt.touches[0] : evt;
      var rect = s.getBoundingClientRect();
      var px = (pt.clientX - rect.left) * (W / rect.width);
      var i = Math.round((px - m.l) / (W - m.l - m.r) * (n - 1));
      i = Math.max(0, Math.min(n - 1, i));
      cross.setAttribute("x1", x(i)); cross.setAttribute("x2", x(i)); cross.setAttribute("opacity", 1);
      dots.forEach(function (c, k) { c.setAttribute("cx", x(i)); c.setAttribute("cy", y(series[k].values[i])); c.setAttribute("opacity", 1); });
      var rows = series.map(function (se) {
        return '<div class="tooltip-row"><i style="background:' + cssVar(se.color) + '"></i><span>' + esc(se.name) + "</span><b>" + cfg.tipFmt(se.values[i]) + "</b></div>";
      }).join("");
      tip.innerHTML = '<div class="tooltip-date">' + fmtDate(cfg.dates[i], true) + "</div>" + rows;
      tip.classList.add("show");
      var tx = x(i) * rect.width / W, tw = tip.offsetWidth;
      var left = tx + 14 + tw > rect.width ? tx - tw - 14 : tx + 14;
      tip.style.left = Math.max(0, left) + "px";
      tip.style.top = "12px";
    }
    function leave() {
      cross.setAttribute("opacity", 0);
      dots.forEach(function (c) { c.setAttribute("opacity", 0); });
      tip.classList.remove("show");
    }
    hit.addEventListener("mousemove", move);
    hit.addEventListener("touchstart", move, { passive: true });
    hit.addEventListener("touchmove", move, { passive: true });
    hit.addEventListener("mouseleave", leave);
    hit.addEventListener("touchend", leave);
    host.appendChild(s);
  }

  function barChart(host, tip, items, totalLabel) {
    host.innerHTML = "";
    var W = host.clientWidth || 800, rowH = 44, H = items.length * rowH + 20;
    host.style.height = H + "px";
    var labelW = Math.min(200, W * 0.34), m = { l: labelW, r: 70 };
    var vals = items.map(function (it) { return it.value; });
    var lo = Math.min(0, Math.min.apply(null, vals)), hi = Math.max(0, Math.max.apply(null, vals));
    var x = function (v) { return m.l + (W - m.l - m.r) * (v - lo) / (hi - lo || 1); };
    var s = svg("svg", { class: "chart-svg", viewBox: "0 0 " + W + " " + H, style: "height:" + H + "px", role: "img", "aria-label": totalLabel });
    s.appendChild(svg("line", { class: "baseline", x1: x(0), x2: x(0), y1: 4, y2: H - 4 }));
    items.forEach(function (it, i) {
      var cy = 10 + i * rowH + rowH / 2;
      var name = svg("text", { class: "cat-label", x: 0, y: cy + 4 });
      name.textContent = it.label;
      s.appendChild(name);
      var x0 = x(Math.min(0, it.value)), x1 = x(Math.max(0, it.value));
      var col = cssVar(it.value >= 0 ? "--div-pos" : "--div-neg");
      var w = Math.max(2, x1 - x0);
      // 4px rounded data-end, square at the baseline
      var r = Math.min(4, w / 2), h = 18, top = cy - h / 2;
      var d = it.value >= 0
        ? "M" + x0 + "," + top + "H" + (x0 + w - r) + "Q" + (x0 + w) + "," + top + " " + (x0 + w) + "," + (top + r) + "V" + (top + h - r) + "Q" + (x0 + w) + "," + (top + h) + " " + (x0 + w - r) + "," + (top + h) + "H" + x0 + "Z"
        : "M" + x1 + "," + top + "H" + (x1 - w + r) + "Q" + (x1 - w) + "," + top + " " + (x1 - w) + "," + (top + r) + "V" + (top + h - r) + "Q" + (x1 - w) + "," + (top + h) + " " + (x1 - w + r) + "," + (top + h) + "H" + x1 + "Z";
      s.appendChild(svg("path", { d: d, fill: col }));
      var lab = svg("text", { class: "bar-label", x: it.value >= 0 ? x1 + 8 : x0 - 8, y: cy + 4, "text-anchor": it.value >= 0 ? "start" : "end" });
      lab.textContent = pct(it.value, 2, true);
      s.appendChild(lab);
    });
    host.appendChild(s);
  }

  /* ------------------------------------------------------------------ UI */
  function mount(root, opts) {
    var state = { period: "1y", w: DEFAULT_W.slice(), view: "base", hidden: {} };
    root.innerHTML = '<p class="ctrl-note">' + esc(t(L.loading)) + "</p>";

    loadData(opts.dataUrl).then(function () { build(); }).catch(function () {
      root.innerHTML = '<div class="callout">' + esc(t(L.loadErr)) + "</div>";
    });

    var refs = {};
    function build() {
      root.innerHTML = "";
      var wrap = el("div", { class: "demo fade-in" });

      // controls
      var ctr = el("div", { class: "demo-controls" });
      var per = el("div");
      per.appendChild(el("span", { class: "ctrl-label" }, esc(t(L.period))));
      var seg = el("div", { class: "seg", role: "group", "aria-label": t(L.period) });
      [["ytd", L.ytd], ["1y", L.y1], ["3y", L.y3]].forEach(function (p) {
        var b = el("button", { type: "button", "aria-pressed": String(state.period === p[0]) }, esc(t(p[1])));
        b.addEventListener("click", function () { state.period = p[0]; seg.querySelectorAll("button").forEach(function (x) { x.setAttribute("aria-pressed", String(x === b)); }); update(); });
        seg.appendChild(b);
      });
      per.appendChild(seg);
      ctr.appendChild(per);

      var rs = el("button", { type: "button", class: "btn btn-ghost btn-sm" }, esc(t(L.reset)));
      ctr.appendChild(rs);

      var al = el("div", { class: "ctrl-alloc" });
      al.appendChild(el("span", { class: "ctrl-label" }, esc(t(L.alloc))));
      var sl = el("div", { class: "sliders" });
      refs.sliderVals = [];
      ASSETS.forEach(function (a, k) {
        var row = el("div", { class: "slider-row" });
        var id = "w-" + a.ticker.replace(".", "");
        var top = el("label", { class: "slider-top", for: id }, '<span><i class="swatch" style="background:var(' + a.color + ')"></i>' + esc(t(a.cls)) + "</span>");
        var val = el("b", null, state.w[k] + " %");
        top.appendChild(val);
        refs.sliderVals.push(val);
        var inp = el("input", { type: "range", id: id, min: "0", max: "100", step: "5", value: String(state.w[k]) });
        inp.addEventListener("input", function () {
          state.w[k] = +inp.value;
          if (state.w.every(function (v) { return v === 0; })) { state.w[k] = 5; inp.value = "5"; }
          update();
        });
        row.appendChild(top); row.appendChild(inp);
        sl.appendChild(row);
      });
      al.appendChild(sl);
      al.appendChild(el("p", { class: "ctrl-note" }, esc(t(L.renorm))));
      ctr.appendChild(al);

      rs.addEventListener("click", function () {
        state.w = DEFAULT_W.slice();
        sl.querySelectorAll("input").forEach(function (inp, k) { inp.value = String(state.w[k]); });
        update();
      });
      wrap.appendChild(ctr);

      // KPIs
      var kb = el("div");
      refs.kpis = el("div", { class: "kpis" });
      kb.appendChild(refs.kpis);
      kb.appendChild(el("p", { class: "kpi-note" }, esc(t(L.deltaNote))));
      wrap.appendChild(kb);

      // chart card
      var card = el("div", { class: "chart-card" });
      var head = el("div", { class: "chart-head" });
      refs.periodLabel = el("strong", { style: "font-size:14px" });
      head.appendChild(refs.periodLabel);
      var ct = el("div", { class: "chart-tabs", role: "tablist" });
      [["base", L.base100], ["dd", L.dd], ["contrib", L.contrib]].forEach(function (v) {
        var b = el("button", { type: "button", role: "tab", "aria-selected": String(state.view === v[0]) }, esc(t(v[1])));
        b.addEventListener("click", function () { state.view = v[0]; ct.querySelectorAll("button").forEach(function (x) { x.setAttribute("aria-selected", String(x === b)); }); drawChart(); });
        ct.appendChild(b);
      });
      head.appendChild(ct);
      card.appendChild(head);
      refs.legend = el("div", { class: "legend" });
      card.appendChild(refs.legend);
      var cw = el("div", { class: "chart-wrap" });
      refs.chart = el("div", { style: "height:340px" });
      refs.tip = el("div", { class: "tooltip", role: "presentation" });
      cw.appendChild(refs.chart); cw.appendChild(refs.tip);
      card.appendChild(cw);
      card.appendChild(el("p", { class: "chart-foot" }, esc(t(L.source))));
      wrap.appendChild(card);

      wrap.appendChild(buildAi());

      // table + payload
      var split = el("div", { class: "demo-split" });
      var tb = el("div");
      tb.appendChild(el("div", { class: "block-title" }, "<h4>" + esc(t(L.table)) + "</h4>"));
      refs.table = el("div", { class: "table-wrap" });
      tb.appendChild(refs.table);
      split.appendChild(tb);

      var pl = el("div");
      var plt = el("div", { class: "block-title" }, "<h4>" + esc(t(L.payload)) + "</h4>");
      var copy = el("button", { type: "button", class: "copy-btn" }, esc(t(L.copy)));
      copy.addEventListener("click", function () {
        var txt = JSON.stringify(refs.lastPayload, null, 2);
        (navigator.clipboard ? navigator.clipboard.writeText(txt) : Promise.reject()).then(function () {
          copy.textContent = t(L.copied); setTimeout(function () { copy.textContent = t(L.copy); }, 1500);
        }).catch(function () {});
      });
      plt.appendChild(copy);
      pl.appendChild(plt);
      refs.payload = el("pre", { class: "code", tabindex: "0", "aria-label": t(L.payloadSub) });
      pl.appendChild(refs.payload);
      pl.appendChild(el("p", { class: "ctrl-note" }, esc(t(L.payloadSub))));
      split.appendChild(pl);
      wrap.appendChild(split);

      root.appendChild(wrap);
      update();
    }

    function update() {
      state.result = compute(state.period, state.w);
      var r = state.result, nw = normalize(state.w);
      refs.sliderVals.forEach(function (v, k) { v.textContent = Math.round(nw[k] * 100) + " %"; });
      refs.periodLabel.textContent = fmtDate(r.dates[0], true) + " → " + fmtDate(r.dates[r.dates.length - 1], true);

      // KPIs: higher is better except volatility and tracking error; drawdown is negative so higher is better too
      refs.kpis.innerHTML = "";
      var vals = r.pm.concat([r.te]), bvals = r.bm.concat([NaN]);
      vals.forEach(function (v, i) {
        var box = el("div", { class: "kpi" });
        box.appendChild(el("div", { class: "kpi-label" }, esc(t(L.k[i]))));
        box.appendChild(el("div", { class: "kpi-value" }, i === 4 ? num(v, 2) : pct(v)));
        if (isFinite(bvals[i])) {
          var dlt = v - bvals[i], better = i === 2 ? dlt < 0 : dlt > 0;
          var cls = Math.abs(dlt) < 1e-6 ? "flat" : better ? "up" : "down";
          var txt = i === 4 ? num(dlt, 2, true) : num(dlt * 100, 2, true) + " " + t(L.pts);
          box.appendChild(el("span", { class: "kpi-delta " + cls }, (dlt >= 0 ? "▲ " : "▼ ") + esc(txt)));
        }
        refs.kpis.appendChild(box);
      });

      // table
      var th = L.th.map(function (h) { return "<th>" + esc(t(h)) + "</th>"; }).join("");
      var rows = r.lines.map(function (l) {
        return "<tr><td><i class=\"swatch\" style=\"background:var(" + l.a.color + ")\"></i>" + esc(t(l.a.cls)) + "</td><td>" + pct(l.w0, 1) + "</td><td>" + pct(l.w1, 1) + "</td><td>" + pct(l.wb, 1) +
          '</td><td class="' + (l.ret >= 0 ? "pos" : "neg") + '">' + pct(l.ret, 2, true) + "</td><td>" + pct(l.vol) + '</td><td class="neg">' + pct(l.dd) +
          '</td><td class="' + (l.contrib >= 0 ? "pos" : "neg") + '">' + pct(l.contrib, 2, true) + "</td></tr>";
      }).join("");
      refs.table.innerHTML = '<table class="data-table"><thead><tr>' + th + "</tr></thead><tbody>" + rows + "</tbody></table>";

      refs.lastPayload = payload(r);
      markStale();
      refs.payload.innerHTML = highlightJson(refs.lastPayload);
      drawChart();
    }

    function drawChart() {
      var r = state.result;
      refs.chart.style.height = "";
      refs.tip.classList.remove("show");
      var legendItems = [];
      if (state.view === "base") {
        var series = [
          { key: "port", name: t(L.port), values: r.port, color: "--s-port", width: 2.75, z: 3, label: function (v) { return num(v, 1); } },
          { key: "bench", name: t(L.bench), values: r.bench, color: "--s-bench", width: 2, dash: "6 4", z: 2, label: function (v) { return num(v, 1); } }
        ].concat(ASSETS.map(function (a, k) {
          return { key: a.ticker, name: t(a.cls), values: r.assets[k], color: a.color, width: 1.5, opacity: 0.85, z: 1 };
        }));
        series.forEach(function (se) { se.visible = !state.hidden[se.key]; });
        legendItems = series;
        lineChart(refs.chart, refs.tip, {
          dates: r.dates, series: series, endLabels: true, baseline: 100,
          yFmt: function (v) { return num(v, 0); }, tipFmt: function (v) { return num(v, 2); },
          aria: t(L.base100)
        });
      } else if (state.view === "dd") {
        var dser = [
          { key: "port", name: t(L.port), values: ddSeries(r.port), color: "--s-port", width: 2, area: true, z: 2, label: function (v) { return pct(v, 1); } },
          { key: "bench", name: t(L.bench), values: ddSeries(r.bench), color: "--s-bench", width: 1.75, dash: "6 4", z: 1, label: function (v) { return pct(v, 1); } }
        ];
        dser.forEach(function (se) { se.visible = !state.hidden[se.key]; });
        legendItems = dser;
        lineChart(refs.chart, refs.tip, {
          dates: r.dates, series: dser, endLabels: true, zeroTop: true, baseline: 0,
          yFmt: function (v) { return pct(v, 0); }, tipFmt: function (v) { return pct(v, 2); },
          aria: t(L.ddAxis)
        });
      } else {
        var items = r.lines.map(function (l) { return { label: t(l.a.cls), value: l.contrib }; });
        items.push({ label: t(L.total), value: r.pm[0] });
        barChart(refs.chart, refs.tip, items, t(L.contrib));
      }

      refs.legend.innerHTML = "";
      legendItems.forEach(function (se) {
        var b = el("button", { type: "button", class: "legend-item", "aria-pressed": String(se.visible !== false) },
          '<span class="legend-key' + (se.dash ? " dashed" : "") + '" style="border-color:' + cssVar(se.color) + '"></span>' + esc(se.name));
        b.addEventListener("click", function () {
          var visibleCount = legendItems.filter(function (x) { return x.visible !== false; }).length;
          if (se.visible !== false && visibleCount === 1) return; // keep at least one series
          state.hidden[se.key] = !state.hidden[se.key];
          drawChart();
        });
        refs.legend.appendChild(b);
      });
      refs.legend.style.display = legendItems.length ? "" : "none";
    }


    /* ---------------------------------------------------------------- AI commentary */
    var ai = { audience: "institutional", length: "standard", notes: "", text: "", payloadKey: null, controller: null, busy: false };

    function seg(label, options, key) {
      var box = el("div");
      box.appendChild(el("span", { class: "ctrl-label" }, esc(t(label))));
      var g = el("div", { class: "seg", role: "group", "aria-label": t(label) });
      options.forEach(function (o) {
        var b = el("button", { type: "button", "aria-pressed": String(ai[key] === o) }, esc(t(L[o])));
        b.addEventListener("click", function () { ai[key] = o; g.querySelectorAll("button").forEach(function (x) { x.setAttribute("aria-pressed", String(x === b)); }); });
        g.appendChild(b);
      });
      box.appendChild(g);
      return box;
    }

    function buildAi() {
      var card = el("section", { class: "ai-card", "aria-labelledby": "ai-title" });
      var head = el("div", { class: "ai-head" });
      head.appendChild(el("div", null, '<h4 id="ai-title">' + esc(t(L.ai)) + '</h4><p class="ai-sub">' + esc(t(L.aiSub)) + "</p>"));
      card.appendChild(head);

      var form = el("div", { class: "ai-form" });
      form.appendChild(seg(L.audience, ["institutional", "private"], "audience"));
      form.appendChild(seg(L.length, ["short", "standard", "detailed"], "length"));
      var nb = el("div", { class: "ai-notes" });
      nb.appendChild(el("label", { class: "ctrl-label", for: "ai-notes" }, esc(t(L.notes))));
      var ta = el("textarea", { id: "ai-notes", rows: "2", maxlength: "800", placeholder: t(L.notesPh) });
      ta.value = ai.notes;
      ta.addEventListener("input", function () { ai.notes = ta.value; });
      nb.appendChild(ta);
      nb.appendChild(el("p", { class: "ctrl-note" }, esc(t(L.notesHelp))));
      form.appendChild(nb);
      card.appendChild(form);

      var actions = el("div", { class: "ai-actions" });
      refs.genBtn = el("button", { type: "button", class: "btn btn-accent" });
      refs.genBtn.addEventListener("click", function () { ai.busy ? stopAi() : generate(); });
      actions.appendChild(refs.genBtn);
      refs.aiStatus = el("span", { class: "ai-status", role: "status" });
      actions.appendChild(refs.aiStatus);
      card.appendChild(actions);

      refs.staleNote = el("div", { class: "callout wip ai-stale", hidden: "" }, esc(t(L.stale)));
      card.appendChild(refs.staleNote);
      refs.aiOut = el("div", { class: "ai-output", "aria-live": "polite" });
      card.appendChild(refs.aiOut);

      var tools = el("div", { class: "ai-tools", hidden: "" });
      var cp = el("button", { type: "button", class: "copy-btn" }, esc(t(L.copy)));
      cp.addEventListener("click", function () {
        if (!navigator.clipboard) return;
        navigator.clipboard.writeText(ai.text).then(function () { cp.textContent = t(L.copied); setTimeout(function () { cp.textContent = t(L.copy); }, 1500); }).catch(function () {});
      });
      var dl = el("button", { type: "button", class: "copy-btn" }, esc(t(L.download)));
      dl.addEventListener("click", function () {
        var md = "# " + t(L.ai) + " - " + refs.periodLabel.textContent + "\n\n" + ai.text + "\n\n_" + t(L.disclaimer) + "_\n";
        var a = document.createElement("a");
        a.href = URL.createObjectURL(new Blob([md], { type: "text/markdown" }));
        a.download = "commentary_" + iso(state.result.dates[state.result.dates.length - 1]).replace(/-/g, "") + ".md";
        document.body.appendChild(a); a.click(); a.remove();
        setTimeout(function () { URL.revokeObjectURL(a.href); }, 1000);
      });
      tools.appendChild(cp); tools.appendChild(dl);
      tools.appendChild(el("span", { class: "ctrl-note" }, esc(t(L.disclaimer))));
      refs.aiTools = tools;
      card.appendChild(tools);

      renderAi();
      return card;
    }

    function renderMarkdown(md) {
      return md.trim().split(/\n{2,}/).map(function (block) {
        var html = esc(block).replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>").replace(/\n/g, "<br>");
        return "<p>" + html + "</p>";
      }).join("");
    }

    function renderAi() {
      if (!refs.genBtn) return;
      refs.genBtn.textContent = ai.busy ? t(L.stop) : ai.text ? t(L.regenerate) : t(L.generate);
      refs.genBtn.disabled = !opts.proxyUrl;
      if (!opts.proxyUrl) {
        refs.aiOut.innerHTML = '<p class="ai-placeholder">' + esc(t(L.notConfigured)) + "</p>";
        return;
      }
      refs.aiOut.innerHTML = ai.text
        ? renderMarkdown(ai.text) + (ai.busy ? '<span class="caret" aria-hidden="true"></span>' : "")
        : '<p class="ai-placeholder">' + esc(ai.busy ? t(L.generating) : t(L.placeholder)) + "</p>";
      refs.aiOut.classList.toggle("busy", ai.busy);
      if (ai.busy || !ai.text) refs.aiTools.setAttribute("hidden", ""); else refs.aiTools.removeAttribute("hidden");
      markStale();
    }

    function markStale() {
      if (!refs.staleNote) return;
      var stale = ai.text && !ai.busy && ai.payloadKey !== JSON.stringify(refs.lastPayload);
      if (stale) refs.staleNote.removeAttribute("hidden"); else refs.staleNote.setAttribute("hidden", "");
    }

    function setStatus(msg, isError) {
      refs.aiStatus.textContent = msg || "";
      refs.aiStatus.classList.toggle("error", !!isError);
    }

    function stopAi() { if (ai.controller) ai.controller.abort(); }

    function generate() {
      if (!opts.proxyUrl || ai.busy) return;
      ai.busy = true; ai.text = ""; ai.payloadKey = JSON.stringify(refs.lastPayload);
      ai.controller = new AbortController();
      setStatus("");
      renderAi();
      fetch(opts.proxyUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ payload: refs.lastPayload, audience: ai.audience, length: ai.length, lang: lang(), notes: ai.notes }),
        signal: ai.controller.signal
      }).then(function (res) {
        if (!res.ok) {
          return res.json().catch(function () { return {}; }).then(function (b) {
            var e = new Error(b.error || String(res.status)); e.code = b.error || res.status;
            e.detail = "HTTP " + res.status + (b.error ? " · " + b.error : "") + (b.status ? " · Anthropic " + b.status : "") + (b.detail ? " · " + b.detail : "");
            throw e;
          });
        }
        var left = res.headers.get("X-Remaining");
        var reader = res.body.getReader(), dec = new TextDecoder(), last = 0;
        function pump() {
          return reader.read().then(function (r) {
            if (r.done) {
              if (left != null) setStatus(left + " " + t(L.remaining));
              return;
            }
            ai.text += dec.decode(r.value, { stream: true });
            var now = Date.now();
            if (now - last > 60) { last = now; renderAi(); }
            return pump();
          });
        }
        return pump();
      }).catch(function (e) {
        if (e.name === "AbortError") return;
        if (window.console) console.error("[commentary]", e.detail || e);
        var code = e.code;
        var msg = t(code === "rate_limited" ? L.errRate : code === "daily_limit" ? L.errDaily : L.errGeneric);
        // Technical cause, shown to help diagnose deployment issues (no secret involved).
        var detail = e.detail || (e instanceof TypeError ? t(L.errNetwork) : "");
        setStatus(msg + (detail && code !== "rate_limited" && code !== "daily_limit" ? " (" + detail + ")" : ""), true);
      }).then(function () {
        ai.busy = false; ai.controller = null;
        renderAi();
      });
    }

    var rt;
    function onResize() { clearTimeout(rt); rt = setTimeout(function () { if (state.result && root.isConnected) drawChart(); }, 120); }
    window.addEventListener("resize", onResize);
    var mq = window.matchMedia("(prefers-color-scheme: dark)");
    var onScheme = function () { if (state.result && root.isConnected) drawChart(); };
    if (mq.addEventListener) mq.addEventListener("change", onScheme);
    document.addEventListener("themechange", onScheme);
    return {
      destroy: function () {
        stopAi();
        window.removeEventListener("resize", onResize);
        document.removeEventListener("themechange", onScheme);
        if (mq.removeEventListener) mq.removeEventListener("change", onScheme);
      }
    };
  }

  window.CommentaryDemo = { mount: mount };
})();
