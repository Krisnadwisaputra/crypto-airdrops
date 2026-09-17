(function () {
  "use strict";

  function slugify(text) {
    return text
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-");
  }

  function buildProgressBar() {
    var wrap = document.createElement("div");
    wrap.className = "reading-progress";
    wrap.setAttribute("aria-hidden", "true");
    var bar = document.createElement("div");
    bar.className = "reading-progress-bar";
    bar.id = "readingProgressBar";
    wrap.appendChild(bar);
    document.body.insertBefore(wrap, document.body.firstChild);
    return bar;
  }

  function updateProgress(bar, articleEl) {
    var rect = articleEl.getBoundingClientRect();
    var articleTop = rect.top + window.scrollY;
    var articleHeight = articleEl.offsetHeight;
    var viewportH = window.innerHeight;
    var scrolled = window.scrollY - articleTop + viewportH * 0.5;
    var pct = Math.min(100, Math.max(0, (scrolled / articleHeight) * 100));
    bar.style.width = pct + "%";
  }

  function buildToc(articleBody) {
    var headings = Array.prototype.slice.call(
      articleBody.querySelectorAll("h2")
    );
    if (headings.length < 3) {
      return null;
    }

    var entries = headings.map(function (h) {
      if (!h.id) {
        h.id = slugify(h.textContent);
      }
      return { id: h.id, text: h.textContent, el: h };
    });

    return entries;
  }

  function renderLinks(entries, container) {
    entries.forEach(function (entry) {
      var a = document.createElement("a");
      a.href = "#" + entry.id;
      a.textContent = entry.text;
      a.dataset.tocTarget = entry.id;
      container.appendChild(a);
    });
  }

  function setupDesktopToc(entries, articleInner) {
    var layout = document.createElement("div");
    layout.className = "article-layout";
    articleInner.parentNode.insertBefore(layout, articleInner);
    layout.appendChild(articleInner);

    var aside = document.createElement("aside");
    aside.className = "toc";
    aside.setAttribute("aria-label", "Table of contents");

    var label = document.createElement("div");
    label.className = "toc-label";
    label.textContent = "On this page";
    aside.appendChild(label);

    var nav = document.createElement("nav");
    renderLinks(entries, nav);
    aside.appendChild(nav);

    layout.appendChild(aside);
    return nav;
  }

  function setupMobileToc(entries, articleInner) {
    var details = document.createElement("details");
    details.className = "toc-mobile";

    var summary = document.createElement("summary");
    summary.textContent = "Jump to section";
    details.appendChild(summary);

    var nav = document.createElement("nav");
    renderLinks(entries, nav);
    details.appendChild(nav);

    var meta = articleInner.querySelector(".article-meta");
    if (meta && meta.nextSibling) {
      meta.parentNode.insertBefore(details, meta.nextSibling);
    } else {
      articleInner.insertBefore(details, articleInner.firstChild);
    }

    details.addEventListener("click", function (e) {
      if (e.target.tagName === "A") {
        details.open = false;
      }
    });
  }

  function setupScrollSpy(entries, navEls) {
    if (!("IntersectionObserver" in window)) return;

    var observer = new IntersectionObserver(
      function (obs) {
        obs.forEach(function (item) {
          if (!item.isIntersecting) return;
          var id = item.target.id;
          navEls.forEach(function (nav) {
            nav.querySelectorAll("a").forEach(function (a) {
              a.classList.toggle(
                "active",
                a.dataset.tocTarget === id
              );
            });
          });
        });
      },
      { rootMargin: "-20% 0px -70% 0px" }
    );

    entries.forEach(function (entry) {
      observer.observe(entry.el);
    });
  }

  function init() {
    var articleEl = document.querySelector(".article");
    var articleInner = document.querySelector(".article-inner");
    var articleBody = document.querySelector(".article-body");

    if (!articleEl || !articleInner || !articleBody) return;

    var bar = buildProgressBar();
    window.addEventListener(
      "scroll",
      function () {
        updateProgress(bar, articleEl);
      },
      { passive: true }
    );
    updateProgress(bar, articleEl);

    var entries = buildToc(articleBody);
    if (!entries) return;

    var navEls = [];
    navEls.push(setupDesktopToc(entries, articleInner));
    setupMobileToc(entries, articleInner);
    var mobileNav = document.querySelector(".toc-mobile nav");
    if (mobileNav) navEls.push(mobileNav);

    setupScrollSpy(entries, navEls);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
