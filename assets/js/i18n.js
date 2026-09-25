/* Bilingual EN / FR. English lives in the HTML; French translations live here. */
(function () {
  "use strict";

  var FR = {
    "skip": "Aller au contenu",
    "nav.projects": "Projets",
    "nav.approach": "Méthode",
    "nav.skills": "Compétences",
    "nav.about": "Profil",
    "hero.eyebrow": "Ouvert aux postes finance × IA",
    "hero.title": "Ingénieur financier, je conçois des <em>outils d’IA</em> pour la gestion d’investissements.",
    "hero.lead": "Trois ans en conseil en investissement institutionnel, aujourd’hui consacrés à transformer données financières et documents réglementaires en décisions et en contenus clients — avec les contrôles qu’exige la finance : chiffres traçables, relecture humaine et maîtrise des coûts.",
    "hero.cta1": "Découvrir les projets",
    "hero.cta2": "Ouvrir l’app en ligne",
    "stat.years.l": "Années en conseil en investissement institutionnel",
    "stat.tools.l": "Outils · en ligne / en cours",
    "stat.data.l": "Données publiques uniquement",
    "stat.ci.l": "Tests et lint à chaque push",
    "projects.kicker": "Atelier de projets",
    "projects.title": "Choisissez un outil, voyez-le tourner",
    "projects.lead": "Chaque projet est présenté avec son cas d’usage métier, un rendu en direct, son architecture et ses standards d’ingénierie.",
    "approach.kicker": "Méthode",
    "approach.title": "Des LLM en finance, avec des garde-fous",
    "p1.t": "Les chiffres sont calculés, jamais générés",
    "p1.d": "Les chiffres viennent d’un code Python testé. Le modèle ne reçoit qu’un payload JSON de métriques calculées et a pour consigne de n’ajouter aucun chiffre ni événement.",
    "p2.t": "Humain dans la boucle",
    "p2.d": "L’outil rédige un premier jet ; le gérant apporte le contexte de marché et valide. Le payload envoyé au modèle est affiché pour audit.",
    "p3.t": "Maîtrise des coûts",
    "p3.d": "Modèles dimensionnés au besoin (Claude Haiku 4.5), plafond de générations par session sur les démos publiques et limite de dépenses mensuelle sur la clé API.",
    "p4.t": "Données publiques, reproductibles",
    "p4.d": "Uniquement des sources publiques : Yahoo Finance, flux RSS publics, documents réglementaires publiés. Jamais de données confidentielles ou propriétaires.",
    "skills.kicker": "Boîte à outils",
    "skills.title": "Là où la finance rencontre l’ingénierie",
    "skills.fin": "Finance",
    "skills.fin.list": ["Analyse de portefeuille", "Indicateurs de risque (volatilité, drawdown, Sharpe, tracking error)", "Attribution de performance", "DIC PRIIPs · DICI UCITS · prospectus", "Reporting client", "Portefeuilles multi-actifs"],
    "skills.ai": "IA / LLM",
    "skills.ai.list": ["API Claude", "Prompt engineering", "Sorties structurées", "RAG", "Extraction de documents", "Évaluation de LLM"],
    "skills.eng": "Ingénierie",
    "about.kicker": "Profil",
    "about.title": "Du conseil en investissement à l’IA en production",
    "about.p1": "Depuis trois ans, je travaille en conseil en investissement institutionnel, pour des investisseurs institutionnels : portefeuilles multi-actifs, analyse de performance et de risque, documentation des fonds et reporting client. J’ai déjà déployé en interne des prototypes basés sur Claude, avec des interfaces Power Apps et des automatisations n8n.",
    "about.p2": "Je recherche des postes à l’intersection de la finance et de l’IA : IA appliquée, outillage quantitatif ou produits d’IA pour la gestion d’investissements.",
    "about.k1": "Domaine",
    "about.v1": "Conseil en investissement institutionnel : portefeuilles multi-actifs, performance et risque, documentation des fonds (PRIIPs / UCITS), reporting client",
    "about.k2": "IA en production",
    "about.v2": "Prototypes sur l’API Claude, interfaces Power Apps, automatisations n8n",
    "about.k3": "Recherche",
    "about.v3": "IA appliquée · outillage quant · produits d’IA pour la gestion d’investissements",
    "about.k4": "Langues",
    "about.v4": "Français (natif) · anglais (professionnel)",
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
