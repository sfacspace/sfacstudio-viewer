(function () {
  "use strict";

  /* Reveal on scroll */
  var revealEls = document.querySelectorAll(".reveal");
  if (revealEls.length && "IntersectionObserver" in window) {
    var revObs = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) {
            e.target.classList.add("is-visible");
          }
        });
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.08 }
    );
    revealEls.forEach(function (el) {
      revObs.observe(el);
    });
  } else {
    revealEls.forEach(function (el) {
      el.classList.add("is-visible");
    });
  }

  /* Nav active state by section */
  var navLinks = document.querySelectorAll(".site-nav a[href^='#']");
  var sectionIds = [];
  navLinks.forEach(function (a) {
    var id = a.getAttribute("href").slice(1);
    if (id) sectionIds.push(id);
  });
  var sections = sectionIds
    .map(function (id) {
      return document.getElementById(id);
    })
    .filter(Boolean);

  var firstNavSection = document.getElementById("overview");
  var heroThreshold = firstNavSection ? firstNavSection.offsetTop - 100 : 200;

  function setActiveNav() {
    var scrollY = window.scrollY;
    if (scrollY < heroThreshold) {
      navLinks.forEach(function (a) {
        a.classList.remove("is-active");
        a.removeAttribute("aria-current");
      });
      return;
    }
    var active = sectionIds[0];
    for (var i = sections.length - 1; i >= 0; i--) {
      var sec = sections[i];
      if (!sec) continue;
      var top = sec.getBoundingClientRect().top + scrollY - 120;
      if (scrollY >= top) {
        active = sec.id;
        break;
      }
    }
    navLinks.forEach(function (a) {
      var id = a.getAttribute("href").slice(1);
      var on = id === active;
      a.classList.toggle("is-active", on);
      if (on) a.setAttribute("aria-current", "location");
      else a.removeAttribute("aria-current");
    });
  }

  if (sections.length) {
    window.addEventListener("scroll", setActiveNav, { passive: true });
    setActiveNav();
  }

  /* More applications — horizontal slide (px transform; appTabPanels must stay distinct from featurePreviewPanels) */
  var moreAppTabsRoot = document.getElementById("more-application-tabs");
  if (moreAppTabsRoot) {
    var appTabButtons = moreAppTabsRoot.querySelectorAll('[role="tab"]');
    var appTabPanels = moreAppTabsRoot.querySelectorAll('[role="tabpanel"]');
    var appTabViewport = moreAppTabsRoot.querySelector(".tabs__viewport");
    var appTabTrack = moreAppTabsRoot.querySelector(".tabs__panels");
    var moreAppTabIndex = 0;

    function layoutMoreAppTabSlide() {
      if (!appTabViewport || !appTabTrack) return;
      var w = appTabViewport.clientWidth;
      var n = appTabPanels.length;
      if (w < 1 || n < 1) return;
      appTabTrack.style.width = n * w + "px";
      for (var i = 0; i < n; i++) {
        appTabPanels[i].style.flex = "0 0 " + w + "px";
      }
      appTabTrack.style.transform = "translate3d(" + -moreAppTabIndex * w + "px,0,0)";
    }

    function activateMoreAppTab(panelId) {
      var idx = 0;
      appTabButtons.forEach(function (btn) {
        var sel = btn.getAttribute("aria-controls") === panelId;
        btn.setAttribute("aria-selected", sel ? "true" : "false");
        btn.tabIndex = sel ? 0 : -1;
      });
      appTabPanels.forEach(function (panel, i) {
        var on = panel.id === panelId;
        panel.classList.toggle("is-active", on);
        panel.setAttribute("aria-hidden", on ? "false" : "true");
        if (on) idx = i;
      });
      moreAppTabIndex = idx;
      layoutMoreAppTabSlide();
    }

    if (appTabViewport && "ResizeObserver" in window) {
      var appTabRo = new ResizeObserver(function () {
        layoutMoreAppTabSlide();
      });
      appTabRo.observe(appTabViewport);
    } else {
      window.addEventListener("resize", layoutMoreAppTabSlide);
    }

    appTabButtons.forEach(function (btn) {
      btn.addEventListener("click", function () {
        var pid = btn.getAttribute("aria-controls");
        if (pid) activateMoreAppTab(pid);
      });
    });

    var initialPanelId = appTabButtons[0] && appTabButtons[0].getAttribute("aria-controls");
    if (initialPanelId) activateMoreAppTab(initialPanelId);

    requestAnimationFrame(function () {
      requestAnimationFrame(layoutMoreAppTabSlide);
    });
  }

  /* Feature highlights — preview opens on tile hover/focus; closes as soon as no tile is hovered/focused */
  var showcase = document.querySelector("[data-feature-showcase]");
  if (showcase) {
    var tiles = showcase.querySelectorAll(".feature-tile[data-feature-index]");
    var featurePreviewPanels = showcase.querySelectorAll("[data-feature-panel]");
    var clip = showcase.querySelector(".feature-preview-clip");
    var collapseTimer = null;
    var HOVER_GAP_MS = 0;
    var tileHoverDepth = 0;

    function clearCollapseTimer() {
      if (collapseTimer != null) {
        window.clearTimeout(collapseTimer);
        collapseTimer = null;
      }
    }

    function setFeaturePreview(key) {
      featurePreviewPanels.forEach(function (p) {
        var id = p.getAttribute("data-feature-panel");
        var on = key != null && id === String(key);
        p.classList.toggle("is-active", on);
      });
    }

    function setExpanded(on) {
      showcase.classList.toggle("is-preview-expanded", on);
      if (clip) clip.setAttribute("aria-hidden", on ? "false" : "true");
    }

    function openPreview(idx) {
      clearCollapseTimer();
      setExpanded(true);
      setFeaturePreview(idx);
    }

    function scheduleCollapse() {
      clearCollapseTimer();
      collapseTimer = window.setTimeout(function () {
        collapseTimer = null;
        setExpanded(false);
        setFeaturePreview(null);
      }, HOVER_GAP_MS);
    }

    function isFocusOnTile() {
      var ae = document.activeElement;
      if (!ae || !ae.closest) return false;
      var t = ae.closest(".feature-tile[data-feature-index]");
      return !!(t && showcase.contains(t));
    }

    tiles.forEach(function (tile) {
      var idx = tile.getAttribute("data-feature-index");
      if (idx == null) return;
      tile.addEventListener("mouseenter", function () {
        tileHoverDepth++;
        openPreview(idx);
      });
      tile.addEventListener("mouseleave", function () {
        tileHoverDepth = Math.max(0, tileHoverDepth - 1);
        window.requestAnimationFrame(function () {
          if (tileHoverDepth === 0 && !isFocusOnTile()) scheduleCollapse();
        });
      });
    });

    showcase.addEventListener(
      "focusin",
      function (e) {
        var t = e.target && e.target.closest && e.target.closest(".feature-tile[data-feature-index]");
        if (t && showcase.contains(t)) {
          var idx = t.getAttribute("data-feature-index");
          if (idx != null) openPreview(idx);
        }
      },
      true
    );

    showcase.addEventListener(
      "focusout",
      function () {
        window.requestAnimationFrame(function () {
          if (!isFocusOnTile() && tileHoverDepth === 0) scheduleCollapse();
        });
      },
      true
    );
  }

  /* Hero — YouTube opens in-page modal (same tab) */
  var videoModal = document.getElementById("video-modal");
  var videoIframe = document.getElementById("video-modal-iframe");
  var videoOpenBtn = document.getElementById("hero-video");
  var YOUTUBE_VIDEO_ID = "";

  function buildYoutubeEmbedSrc() {
    var params = new URLSearchParams({ autoplay: "1", rel: "0" });
    try {
      var o = window.location.origin;
      if (o && /^https?:\/\//i.test(o)) {
        params.set("origin", o);
      }
    } catch (err) {}
    return "https://www.youtube.com/embed/" + YOUTUBE_VIDEO_ID + "?" + params.toString();
  }

  if (videoModal && videoIframe && videoOpenBtn) {
    var videoCloseEls = videoModal.querySelectorAll("[data-video-modal-close]");
    var videoLastFocus = null;

    function openVideoModal(e) {
      if (e) e.preventDefault();
      videoLastFocus = document.activeElement;
      videoModal.classList.add("is-open");
      videoModal.removeAttribute("hidden");
      videoIframe.src = buildYoutubeEmbedSrc();
      document.body.classList.add("video-modal-open");
      var vb = videoModal.querySelector(".video-modal__close");
      if (vb) vb.focus();
    }

    function closeVideoModal() {
      videoModal.classList.remove("is-open");
      videoModal.setAttribute("hidden", "");
      videoIframe.src = "";
      document.body.classList.remove("video-modal-open");
      if (videoLastFocus && typeof videoLastFocus.focus === "function") {
        try {
          videoLastFocus.focus();
        } catch (err) {}
      }
      videoLastFocus = null;
    }

    videoOpenBtn.addEventListener("click", openVideoModal);
    videoCloseEls.forEach(function (el) {
      el.addEventListener("click", function () {
        closeVideoModal();
      });
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && videoModal.classList.contains("is-open")) {
        closeVideoModal();
      }
    });
  }
})();
