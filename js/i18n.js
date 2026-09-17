(function () {
  "use strict";

  const STORAGE_KEY = "kds-language";
  const DEFAULT_LANGUAGE = "en";
  const SUPPORTED = ["en", "id"];

  function readStoredLanguage() {
    try {
      if (!window.localStorage) return null;
      return window.localStorage.getItem(STORAGE_KEY);
    } catch (error) {
      return null;
    }
  }

  function writeStoredLanguage(lang) {
    try {
      if (!window.localStorage) return;
      window.localStorage.setItem(STORAGE_KEY, lang);
    } catch (error) {
      // Ignore storage restrictions in private browsing or locked-down browsers.
    }
  }

  function getLanguage() {
    const params = new URLSearchParams(window.location.search);
    const urlLang = params.get("lang");

    if (SUPPORTED.includes(urlLang)) {
      return urlLang;
    }

    const saved = readStoredLanguage();

    if (SUPPORTED.includes(saved)) {
      return saved;
    }

    const browser = (navigator.language || "").toLowerCase();

    if (browser.startsWith("id")) {
      return "id";
    }

    return DEFAULT_LANGUAGE;
  }

  function setLanguage(lang) {
    if (!SUPPORTED.includes(lang)) {
      lang = DEFAULT_LANGUAGE;
    }

    writeStoredLanguage(lang);
    document.documentElement.lang = lang === "id" ? "id" : "en";

    applyTranslations(lang);
    updateLanguageUI(lang);
    formatDates(lang);
  }

  function translate(key, lang) {
    const dictionary = window.KDS_TRANSLATIONS || {};
    return dictionary[lang]?.[key] ||
      dictionary[DEFAULT_LANGUAGE]?.[key] ||
      key;
  }

  function applyTranslations(lang) {
    document.querySelectorAll("[data-i18n]").forEach(function (element) {
      const key = element.getAttribute("data-i18n");
      if (!key) return;
      element.textContent = translate(key, lang);
    });

    document.querySelectorAll("[data-i18n-placeholder]").forEach(function (element) {
      const key = element.getAttribute("data-i18n-placeholder");
      if (!key) return;
      element.setAttribute("placeholder", translate(key, lang));
    });

    document.querySelectorAll("[data-i18n-aria-label]").forEach(function (element) {
      const key = element.getAttribute("data-i18n-aria-label");
      if (!key) return;
      element.setAttribute("aria-label", translate(key, lang));
    });

    document.querySelectorAll("[data-i18n-title]").forEach(function (element) {
      const key = element.getAttribute("data-i18n-title");
      if (!key) return;
      element.setAttribute("title", translate(key, lang));
    });

    document.querySelectorAll("[data-i18n-current]").forEach(function (element) {
      const key = element.getAttribute("data-i18n-current");
      if (!key) return;
      element.setAttribute("aria-current", translate(key, lang));
    });
  }

  function formatDates(lang) {
    const locale = lang === "id" ? "id-ID" : "en-US";

    document.querySelectorAll("[data-date]").forEach(function (element) {
      const value = element.getAttribute("data-date");
      if (!value) return;

      const date = new Date(value);
      if (Number.isNaN(date.getTime())) return;

      const formatted = new Intl.DateTimeFormat(locale, {
        day: "numeric",
        month: "long",
        year: "numeric"
      }).format(date);

      element.textContent = formatted;
    });
  }

  function updateLanguageUI(lang) {
    document.querySelectorAll("[data-lang-option]").forEach(function (button) {
      const buttonLang = button.getAttribute("data-lang-option");
      button.classList.toggle("active", buttonLang === lang);
      button.setAttribute("aria-pressed", buttonLang === lang ? "true" : "false");
    });
  }

  function createLanguageSwitcher() {
    const navInner = document.querySelector(".nav-inner");
    if (!navInner || document.querySelector(".language-switcher")) {
      return;
    }

    const wrapper = document.createElement("div");
    wrapper.className = "language-switcher";
    wrapper.setAttribute("aria-label", "Language selector");

    const buttonEN = document.createElement("button");
    buttonEN.type = "button";
    buttonEN.className = "language-option";
    buttonEN.setAttribute("data-lang-option", "en");
    buttonEN.setAttribute("aria-label", "Switch language to English");
    buttonEN.textContent = "EN";

    const divider = document.createElement("span");
    divider.className = "language-divider";
    divider.textContent = "/";

    const buttonID = document.createElement("button");
    buttonID.type = "button";
    buttonID.className = "language-option";
    buttonID.setAttribute("data-lang-option", "id");
    buttonID.setAttribute("aria-label", "Switch language to Indonesian");
    buttonID.textContent = "ID";

    buttonEN.addEventListener("click", function () {
      setLanguage("en");
    });

    buttonID.addEventListener("click", function () {
      setLanguage("id");
    });

    wrapper.appendChild(buttonEN);
    wrapper.appendChild(divider);
    wrapper.appendChild(buttonID);
    navInner.appendChild(wrapper);
  }

  function addAutomaticNavigationTranslations() {
    const links = document.querySelectorAll(".nav-links a");
    links.forEach(function (link) {
      const href = link.getAttribute("href") || "";

      if (href.includes("#featured")) {
        link.setAttribute("data-i18n", "nav_guides");
      }
      if (href.includes("#safety")) {
        link.setAttribute("data-i18n", "nav_safety");
      }
      if (href.includes("#drops")) {
        link.setAttribute("data-i18n", "nav_watchlist");
      }
      if (href.includes("#newsletter")) {
        link.setAttribute("data-i18n", "nav_newsletter");
      }

      if (link.getAttribute("href") === "/" || link.getAttribute("href") === "#top") {
        link.setAttribute("aria-label", link.textContent.trim());
      }
    });
  }

  function init() {
    createLanguageSwitcher();
    addAutomaticNavigationTranslations();

    const lang = getLanguage();
    setLanguage(lang);
  }

  window.KDS_I18N = {
    getLanguage,
    setLanguage,
    formatDates
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
