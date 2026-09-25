/* Bilingual EN / FR. English lives in the HTML; French translations live here. */
(function () {
  "use strict";

  var FR = {
    "skip": "Aller au contenu",
    "nav.projects": "Projets",
    "nav.skills": "Compétences",
    "nav.about": "Profil",
    "hero.eyebrow": "Ouvert aux postes finance × IA",
    "hero.title": "Ingénieur financier, je conçois des <em>outils d’IA</em> pour la gestion d’investissements.",
    "hero.lead": "Trois ans en conseil en investissement institutionnel, entre le suivi des portefeuilles clients et le développement des outils qui les servent : automatisation des données, reporting et IA appliquée.",
    "hero.cta1": "Découvrir les projets",
    "hero.cta2": "Ouvrir l’app en ligne",
    "stat.years.l": "Années en conseil en investissement institutionnel",
    "stat.tools.l": "Outils · en ligne / en cours",
    "stat.data.l": "Données publiques uniquement",
    "stat.aum.l": "Encours multi-actifs suivis · +100 clients",
    "stat.aum.v": "5,5 Md€",
    "projects.kicker": "Atelier de projets",
    "projects.title": "Choisissez un outil, voyez-le tourner",
    "projects.lead": "Chaque projet est présenté avec son cas d’usage métier, un rendu en direct, son architecture et ses standards d’ingénierie.",
    "skills.kicker": "Boîte à outils",
    "skills.title": "Là où la finance rencontre l’ingénierie",
    "skills.lang": "Langages & programmation",
    "skills.data": "Outils finance & data",
    "skills.ai": "IA & automatisation",
    "about.kicker": "Profil",
    "about.title": "Finance et ingénierie, au quotidien",
    "about.p1": "Côté client, le suivi et le reporting de portefeuilles ; côté outils, l’automatisation et l’IA appliquée qui les rendent plus rapides et plus fiables.",
    "role.title": "Dernier poste · Conseil en investissement institutionnel",
    "role.b1": "<b>Suivi et reporting</b> de portefeuilles multi-actifs : +100 clients, 5,5 Md€ d’encours.",
    "role.b2": "<b>Automatisation</b> de l’extraction, du traitement et de la visualisation de données financières (Python, VBA, JUMP) et <b>prototypage d’outils d’IA appliquée</b> (API Claude, MS Power Apps, n8n).",
    "role.b3": "<b>Développement</b> d’un site web de reporting client et d’outils internes (facturation, conformité).",
    "role.b4": "<b>Relation clients</b>, récurrente et ponctuelle.",
    "about.k1": "Domaine",
    "about.v1": "Conseil en investissement institutionnel : suivi de portefeuilles multi-actifs et reporting client",
    "about.k2": "IA en production",
    "about.v2": "Prototypes sur l’API Claude, MS Power Apps et n8n ; automatisation de données en Python / VBA / JUMP",
    "about.k3": "Recherche",
    "about.v3": "IA appliquée · outillage quant · produits d’IA pour la gestion d’investissements",
    "about.k4": "Langues",
    "about.v4": "Français - anglais (professionnel) - turc (maternel) - espagnol (B1)",
    "footer.data": "Tous les projets reposent uniquement sur des données publiques. Portefeuilles fictifs ; rien ici ne constitue un conseil en investissement."
  };

  var listeners = [];
  var I18N = {
    lang: document.documentElement.getAttribute("lang") === "fr" ? "fr" : "en",
    /** Pick the current language from an {en, fr} object (or return a plain string). */
    t: function (v) {
      if (v == null) return "";
      if (typeof v === "string") return v;
      return v[I18N.lang] != null ? v[I18N.lang] : v.en;
    },
    onChange: function (fn) { listeners.push(fn); },
    set: function (lang) {
      I18N.lang = lang === "fr" ? "fr" : "en";
      document.documentElement.setAttribute("lang", I18N.lang);
      try { localStorage.setItem("lang", I18N.lang); } catch (e) {}
      apply();
      listeners.forEach(function (fn) { fn(I18N.lang); });
    }
  };

  function captureDefaults() {
    document.querySelectorAll("[data-i18n]").forEach(function (el) { el.dataset.en = el.textContent; });
    document.querySelectorAll("[data-i18n-html]").forEach(function (el) { el.dataset.en = el.innerHTML; });
    document.querySelectorAll("[data-i18n-list]").forEach(function (el) {
      el.dataset.en = JSON.stringify(Array.prototype.map.call(el.children, function (li) { return li.textContent; }));
    });
  }

  function apply() {
    var fr = I18N.lang === "fr";
    document.querySelectorAll("[data-i18n]").forEach(function (el) {
      var k = el.getAttribute("data-i18n");
      el.textContent = fr && FR[k] ? FR[k] : el.dataset.en;
    });
    document.querySelectorAll("[data-i18n-html]").forEach(function (el) {
      var k = el.getAttribute("data-i18n-html");
      el.innerHTML = fr && FR[k] ? FR[k] : el.dataset.en;
    });
    document.querySelectorAll("[data-i18n-list]").forEach(function (el) {
      var k = el.getAttribute("data-i18n-list");
      var items = fr && FR[k] ? FR[k] : JSON.parse(el.dataset.en);
      el.innerHTML = "";
      items.forEach(function (txt) { var li = document.createElement("li"); li.textContent = txt; el.appendChild(li); });
    });
    var btn = document.getElementById("lang-toggle");
    if (btn) {
      btn.textContent = fr ? "EN" : "FR";
      btn.setAttribute("aria-label", fr ? "Switch to English" : "Passer en français");
    }
  }

  I18N.init = function () { captureDefaults(); apply(); };
  window.I18N = I18N;
})();
