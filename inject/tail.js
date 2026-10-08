(function () {
  function log() {}
  try {
    if (!sessionStorage.getItem('isEmbeddedFrame')) {
      sessionStorage.setItem('isEmbeddedFrame', 'skool');
      sessionStorage.setItem('partnerName', 'skool');
    }
  } catch (e) { log('storage failed', e); }
  var BRAND = "bypass by sealsarcade.xyz";
  var BRAND_FONT = '"Comfortaa",system-ui,-apple-system,sans-serif';
  function ensureBrandFont() {
    try {
      if (document.getElementById("seal-comfortaa-font")) return;
      var h = document.head || document.documentElement;
      if (!h) return;
      var p1 = document.createElement("link");
      p1.rel = "preconnect"; p1.href = "https://fonts.googleapis.com";
      var p2 = document.createElement("link");
      p2.rel = "preconnect"; p2.href = "https://fonts.gstatic.com";
      p2.crossOrigin = "anonymous";
      var l = document.createElement("link");
      l.id = "seal-comfortaa-font";
      l.rel = "stylesheet";
      l.href = "https://fonts.googleapis.com/css2?family=Comfortaa:wght@700&display=swap";
      try { h.appendChild(p1); } catch (e) {}
      try { h.appendChild(p2); } catch (e) {}
      try { h.appendChild(l); } catch (e) {}
    } catch (e) {}
  }
  function forceVisible(el) {
    try {
      el.style.setProperty("visibility", "visible", "important");
      el.style.setProperty("opacity", "1", "important");
      el.style.setProperty("display", "inline-block", "important");
      el.style.setProperty("max-width", "none", "important");
      el.style.setProperty("overflow", "visible", "important");
      el.style.setProperty("white-space", "nowrap", "important");
      el.style.setProperty("font-family", BRAND_FONT, "important");
      el.style.setProperty("font-size", "13px", "important");
      el.style.setProperty("font-weight", "700", "important");
      el.style.setProperty("letter-spacing", ".2px", "important");
      el.style.setProperty("text-overflow", "clip", "important");

      el.style.setProperty("background", "linear-gradient(90deg,#f8fafc,#94a3b8)", "important");
      el.style.setProperty("-webkit-background-clip", "text", "important");
      el.style.setProperty("background-clip", "text", "important");
      el.style.setProperty("color", "transparent", "important");
      el.style.setProperty("-webkit-text-fill-color", "transparent", "important");
    } catch (e) {}
  }
  function isOverlay(el) {
    try {
      var n = el, depth = 0;
      while (n && depth < 5) {
        var pos = "";
        try { pos = (window.getComputedStyle(n) || {}).position || ""; } catch (e) {}
        if (pos === "fixed" || pos === "sticky" || pos === "absolute") return true;
        n = n.parentElement;
        depth++;
      }
    } catch (e) {}
    return false;
  }
  var __barCache = null;
  var __barCacheAt = 0;
  function findBottomBar() {
    try {

      var now = Date.now();
      try {
        if (__barCache && __barCache.isConnected && (now - __barCacheAt) < 3000) return __barCache;
      } catch (e) {}
      if (document.hidden && __barCache && __barCache.isConnected) return __barCache;
      var best = null, bestScore = -1;
      var els = document.querySelectorAll("div,footer,section");
      for (var i = 0; i < els.length; i++) {
        var el = els[i];
        if (el.id === "seal-bypass-label") continue;
        var r = null;
        try { r = el.getBoundingClientRect(); } catch (e) { continue; }
        if (!r) continue;
        if (r.height < 30 || r.height > 120) continue;
        if (r.width < window.innerWidth * 0.7) continue;
        if (Math.abs(window.innerHeight - r.bottom) > 12) continue;

        if (!isOverlay(el)) continue;
        var hasBtn = null;
        try { hasBtn = el.querySelector("button,svg,[role=button]"); } catch (e) {}
        var score = r.width * r.height;
        if (hasBtn) score += 1000000;
        if (score > bestScore) { bestScore = score; best = el; }
      }
      try { __barCache = best; __barCacheAt = Date.now(); } catch (e) {}
      return best;
    } catch (e) { return null; }
  }
  function preloaderNow() {
    try {
      if (document.querySelector("video.preloader-video")) return true;
      var lf = document.querySelector('[data-ngg-loader]');
      if (lf && lf.isConnected) return true;
    } catch (e) {}
    return false;
  }
  function bigSurfaceNow() {
    try {

      var surfaces = document.querySelectorAll("canvas,video");
      for (var i = 0; i < surfaces.length; i++) {
        var s = surfaces[i];
        var w = 0, h = 0;
        try { w = s.clientWidth || s.width || 0; h = s.clientHeight || s.height || 0; } catch (e) {}
        if (w > 400 && h > 200) return true;
        try {
          if (s.videoWidth > 400 && s.videoHeight > 200) return true;
        } catch (e) {}
      }
    } catch (e) {}
    return false;
  }
  var __loadCacheV = true;
  var __loadCacheAt = 0;
  function isStillLoading() {
    try {

      var now = Date.now();
      if (now - __loadCacheAt < 1000) return __loadCacheV;
      if (preloaderNow()) {
        window.__sealSeenLoading = true;
        __loadCacheV = true; __loadCacheAt = Date.now();
        return true;
      }

      if (findBottomBar()) {
        try { window.__nggGameRunning = true; } catch (e) {}
        __loadCacheV = false; __loadCacheAt = Date.now();
        return false;
      }

      if (window.__sealSeenLoading && bigSurfaceNow()) {
        try { window.__nggGameRunning = true; } catch (e) {}
        __loadCacheV = false; __loadCacheAt = Date.now();
        return false;
      }
      __loadCacheV = true; __loadCacheAt = Date.now();
      return true;
    } catch (e) {}
    return false;
  }
  function isMobileDevice() {
    try {
      if (window.matchMedia && window.matchMedia("(pointer: coarse)").matches) return true;
    } catch (e) {}
    try {
      if (/Android|iPhone|iPad|iPod|Mobile|Touch/i.test(navigator.userAgent || "")) return true;
    } catch (e) {}
    try {
      if ((window.innerWidth || 9999) < 768) return true;
    } catch (e) {}
    return false;
  }
  function brandExpired() {
    try {
      if (!window.__sealBrandShownAt) return false;
      return (Date.now() - window.__sealBrandShownAt) > 10000;
    } catch (e) { return false; }
  }
  function ensureLeftLabel() {
    try {
      var mobile = false;
      try { mobile = isMobileDevice(); } catch (e) {}
      var label = document.getElementById("seal-bypass-label");
      if (!label) {
        label = document.createElement("div");
        label.id = "seal-bypass-label";
        label.textContent = BRAND;
        label.style.display = "none";
        (document.body || document.documentElement).appendChild(label);
      } else if (label.textContent !== BRAND) {
        label.textContent = BRAND;
      }
      try {
        if (!label.isConnected) (document.body || document.documentElement).appendChild(label);
      } catch (e) {}

      if (isStillLoading()) {
        try { if (mobile) window.__sealBrandShownAt = 0; } catch (e) {}
        try { label.style.setProperty("display", "none", "important"); } catch (e) { label.style.display = "none"; }

        try {
          if (label.parentElement && label.parentElement !== (document.body || document.documentElement)) {
            (document.body || document.documentElement).appendChild(label);
          }
        } catch (e) {}

        try {
          var stale = document.querySelectorAll("span,div,p,a,button,h6");
          for (var si = 0; si < stale.length; si++) {
            var sn = stale[si];
            if (sn.id === "seal-bypass-label" || sn.childElementCount) continue;
            var st = (sn.textContent || "").trim();
            if (st === BRAND) sn.style.setProperty("display", "none", "important");
          }
        } catch (e) {}
        return;
      }

      if (mobile) {
        try {
          if (label.parentElement && label.parentElement !== (document.body || document.documentElement)) {
            (document.body || document.documentElement).appendChild(label);
          }
        } catch (e) {}
        if (!window.__sealBrandShownAt) window.__sealBrandShownAt = Date.now();
        if (brandExpired()) {
          try {
            if (label.dataset.sealFaded !== "1") {
              label.dataset.sealFaded = "1";
              label.style.setProperty("transition", "opacity .8s ease", "important");

              try { void label.offsetWidth; } catch (e) {}
              label.style.setProperty("opacity", "0", "important");
              setTimeout(function () {
                try { label.style.setProperty("display", "none", "important"); } catch (e) { label.style.display = "none"; }
              }, 850);
            }
          } catch (e) { label.style.display = "none"; }
          return;
        }

        if (label.dataset.sealM === "1" && label.isConnected) return;
        label.style.cssText = "position:fixed;top:calc(8px + env(safe-area-inset-top,0px));left:50%;transform:translateX(-50%);display:flex;align-items:center;justify-content:center;line-height:1;z-index:2147483647;font-family:\"Comfortaa\",system-ui,sans-serif;font-size:13px;font-weight:700;letter-spacing:.2px;opacity:.95;pointer-events:none;white-space:nowrap;text-align:center;background:linear-gradient(90deg,#f8fafc,#94a3b8)!important;-webkit-background-clip:text!important;background-clip:text!important;color:transparent!important;-webkit-text-fill-color:transparent!important;filter:drop-shadow(0 1px 2px rgba(0,0,0,.9));";
        try { label.dataset.sealM = "1"; } catch (e) {}
        return;
      }
      var bar = findBottomBar();
      if (bar) {
        try {

          if (label.parentElement === bar && label.isConnected && label.dataset.sealD === "bar") {
            try { if (bar.style.display !== "flex") bar.style.setProperty("display", "flex", "important"); } catch (e) {}
            return;
          }
          if (label.parentElement !== bar) {
            try { bar.insertBefore(label, bar.firstChild); } catch (e) { bar.appendChild(label); }
          }
          bar.style.setProperty("display", "flex", "important");
          bar.style.setProperty("align-items", "center", "important");
          label.style.cssText = "position:static;margin:0 auto 0 12px;align-self:center;display:flex;align-items:center;line-height:1;z-index:2147483647;font-family:\"Comfortaa\",system-ui,sans-serif;font-size:13px;font-weight:700;letter-spacing:.2px;opacity:.95;pointer-events:none;white-space:nowrap;background:linear-gradient(90deg,#f8fafc,#94a3b8)!important;-webkit-background-clip:text!important;background-clip:text!important;color:transparent!important;-webkit-text-fill-color:transparent!important;filter:drop-shadow(0 1px 2px rgba(0,0,0,.9));";
          try { label.dataset.sealD = "bar"; } catch (e) {}
          return;
        } catch (e) {}
      }

      label.style.cssText = "position:fixed;left:12px;bottom:0;height:54px;display:flex;align-items:center;line-height:1;z-index:2147483647;font-family:\"Comfortaa\",system-ui,sans-serif;font-size:13px;font-weight:700;letter-spacing:.2px;opacity:.95;pointer-events:none;white-space:nowrap;background:linear-gradient(90deg,#f8fafc,#94a3b8)!important;-webkit-background-clip:text!important;background-clip:text!important;color:transparent!important;-webkit-text-fill-color:transparent!important;filter:drop-shadow(0 1px 2px rgba(0,0,0,.9));";
    } catch (e) {}
  }
  function brandOnce(root) {
    try {

      try {
        var h6 = document.querySelector("h6");
        if (h6 && h6.closest("button")) sealHide(h6.closest("button"));
      } catch (e) {}

      if (isStillLoading()) return;
      try {
        if (isMobileDevice() && brandExpired()) {

          var olds = (root || document).querySelectorAll("span,div,p,a,button,h6");
          for (var oi = 0; oi < olds.length; oi++) {
            var oe = olds[oi];
            if (oe.id === "seal-bypass-label" || oe.childElementCount) continue;
            var ot = (oe.textContent || "").trim();
            if (ot === BRAND) oe.style.setProperty("display", "none", "important");
          }
          return;
        }
      } catch (e) {}
      var els = (root || document).querySelectorAll("span,div,p,a,button,h6");
      for (var i = 0; i < els.length; i++) {
        var el = els[i];
        if (el.id === "seal-bypass-label") continue;
        if (el.childElementCount) continue;
        var t = (el.textContent || "").trim();
        if (!t) continue;
        if (t.toUpperCase() === "TEST DRIVE" || t === "proxy") {
          el.textContent = BRAND;
          forceVisible(el);

          try {
            var p = el.parentElement;
            if (p) {
              p.style.setProperty("justify-content", "flex-start", "important");
              p.style.setProperty("text-align", "left", "important");
            }
          } catch (e) {}
        }
      }
    } catch (e) {}
  }
  ensureBrandFont();
  brandOnce(document);
  ensureLeftLabel();

  var __brandIdle = 0;
  setInterval(function () {
    try {
      if (document.hidden) return;
      try {
        if (window.__nggGameRunning) {
          __brandIdle++;

          if (__brandIdle > 30) {
            if (__brandIdle % 10 !== 0) return;
          } else if (__brandIdle > 6) {

            if (__brandIdle % 2 !== 0) return;
          }
        }
      } catch (e) {}
      ensureBrandFont();
      brandOnce(document);
      ensureLeftLabel();
    } catch (e) {}
  }, 1000);
  try {
    var __moPending = false;
    var __mo = new MutationObserver(function (muts) {

      if (__moPending) return;
      try { if (document.hidden) return; } catch (e) {}
      __moPending = true;
      setTimeout(function () {
        __moPending = false;
        try {
          var cheap = false;
          try { cheap = !!window.__nggGameRunning; } catch (e) {}
          for (var i = 0; i < muts.length; i++) {
            var m = muts[i];
            if (m.type === "childList") {
              for (var j = 0; j < m.addedNodes.length; j++) {
                var n = m.addedNodes[j];

                if (cheap && n && n.nodeType === 1) {
                  try {
                    if (n === document.body || n.id === "seal-bypass-label") continue;
                    var tag = (n.tagName || "").toUpperCase();
                    if (tag !== "BUTTON" && tag !== "IFRAME" && !n.querySelector) continue;
                  } catch (e) {}
                }
                if (n && n.nodeType === 1) brandOnce(n.nodeType === 1 && n.querySelectorAll ? n : document);
              }
            }

          }
          ensureLeftLabel();
        } catch (e) {}
      }, 1500);
    });

    __mo.observe(document.documentElement || document, { childList: true, subtree: true });
  } catch (e) {}
  var __stripRuns = 0;
  var __stripEmpty = 0;
  
  
  
  
  function sealHide(el) {
    try {
      el.style.setProperty("display", "none", "important");
      el.style.setProperty("visibility", "hidden", "important");
    } catch (e) {
      try { el.style.display = "none"; } catch (e2) {}
    }
  }
  function ensureHideCss() {
    try {
      if (document.getElementById("seal-hide-css")) return;
      var st = document.createElement("style");
      st.id = "seal-hide-css";
      st.textContent = ".sc-978a7a9c-0.jUWcJN,.sc-99639c35-0,.sc-99639c35-0.ccRDYZ,#div-ad-app-page-leaderboard-container,#div-ad-square-midroll-display-container-skeleton,#div-ad-square-midroll-video-container-skeleton,[id^=\"div-ad-\"],[id*=\"midroll\"],[id*=\"leaderboard\"],header[class*=\"gLZcnl\"],header[class*=\"74ddd4db\"],#ng-logout{display:none!important;visibility:hidden!important;}";
      (document.head || document.documentElement).appendChild(st);
    } catch (e) {}
  }
  ensureHideCss();
  function stripAds() {
    try {
      var removed = 0;
      var sels = [
        '.sc-978a7a9c-0.jUWcJN',
        '.sc-99639c35-0',
        '.sc-99639c35-0.ccRDYZ',
        '#div-ad-app-page-leaderboard-container',
        '#div-ad-square-midroll-display-container-skeleton',
        '#div-ad-square-midroll-video-container-skeleton',
        '[id^="div-ad-"]',
        '[id*="midroll"]',
        '[id*="leaderboard"]'
      ];
      sels.forEach(function (s) {
        try {
          document.querySelectorAll(s).forEach(function (n) { try { sealHide(n); removed++; } catch (e) {} });
        } catch (e) {}
      });
      var header = document.querySelector('header');
      if (header && header.className && /gLZcnl|74ddd4db/.test(header.className)) { try { sealHide(header); removed++; } catch (e) {} }
      if (!removed) { try { __stripEmpty++; } catch (e) {} }
      else { try { __stripEmpty = 0; } catch (e) {} }
    } catch (e) {}
  }
  var __stripTimer = setInterval(function () {
    try {
      if (document.hidden) return;

      try { if (window.__nggGameRunning && __stripRuns > 5) { clearInterval(__stripTimer); return; } } catch (e) {}
      stripAds();
      __stripRuns++;
      if (__stripRuns > 25 || __stripEmpty > 6) { try { clearInterval(__stripTimer); } catch (e) {} }
    } catch (e) {}
  }, 2000);
  stripAds();
  function proxyRefresh(text) {
    var popup = document.createElement('div');
    popup.innerText = text || 'refreshing session...';
    popup.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,.8);color:#fff;display:flex;justify-content:center;align-items:center;font-size:2em;z-index:9999;opacity:0;transition:all .3s ease;backdrop-filter:blur(20px)';
    document.body.appendChild(popup);
    setTimeout(function () {
      popup.style.opacity = '1';
      setTimeout(function () {
        var u = new URL(window.location.href);
        if (!u.searchParams.get('utm_source')) {
          u.searchParams.set('utm_source', 'now.gg-partner');
          u.searchParams.set('utm_medium', 'bot');
          u.searchParams.set('utm_campaign', 'carl');
          window.location.href = u.toString();
        } else {
          window.location.reload();
        }
      }, 500);
    }, 100);
  }
  var __proxyRefreshing = false;
  function __sealProxyDetected() {
    try {
      if (__proxyRefreshing) return true;
      
      var bad = document.querySelector(".sc-69333f43-19.cIaYNi");
      if (bad && ((bad.innerText || "").trim() === "Unofficial proxy detected!")) return true;
      
      
      var els = document.querySelectorAll("span,div,p,h1,h2,h3");
      var n = els.length > 300 ? 300 : els.length;
      for (var i = 0; i < n; i++) {
        var el = els[i];
        if (el.childElementCount) continue;
        var t = "";
        try { t = (el.textContent || "").trim(); } catch (e) { continue; }
        if (t === "Unofficial proxy detected!") return true;
      }
    } catch (e) {}
    return false;
  }
  setInterval(function () {
    try {
      if (document.hidden || __proxyRefreshing) return;
      if (__sealProxyDetected()) {
        __proxyRefreshing = true;
        proxyRefresh("Unofficial proxy detected - refreshing...");
      }
    } catch (e) {}
  }, 1000);
  try {
    window.__sealProxyApi = {
      detected: __sealProxyDetected,
      refreshing: function () { return __proxyRefreshing; }
    };
  } catch (e) {}
  window.addEventListener('DOMContentLoaded', function () {
    try { var lo = document.getElementById("ng-logout"); if (lo) sealHide(lo); } catch (e) {}
  });

  (function autoPlay() {
    if (window.__nggAutoPlay) return; window.__nggAutoPlay = 1;
    var clickedAt = 0;
    var done = false;
    function started() {
      try {
        if (typeof findBottomBar === "function" && findBottomBar()) return true;
        if (window.__sealSeenLoading && typeof bigSurfaceNow === "function" && bigSurfaceNow()) return true;
      } catch (e) {}
      return false;
    }
    function realClick(el) {
      try { el.scrollIntoView({ block: "center", inline: "center" }); } catch (e) {}
      try { el.focus(); } catch (e) {}
      try {
        var r = null;
        try { r = el.getBoundingClientRect(); } catch (e) {}
        var cx = r ? (r.left + r.width / 2) : 0;
        var cy = r ? (r.top + r.height / 2) : 0;
        ["pointerdown", "mousedown", "mouseup"].forEach(function (t) {
          try { el.dispatchEvent(new MouseEvent(t, { bubbles: true, cancelable: true, view: window, clientX: cx, clientY: cy })); } catch (e) {}
        });
      } catch (e) {}
      try { el.click(); } catch (e) {}
    }
    function inTile(el) {
      try { if (el.closest("li.Tile_wrap, #top-bar-list, .OtherGames, .SingleGameCardWrap")) return true; } catch (e) {}
      return false;
    }
    function tryDoc(d) {

      try {
        var main = null;
        try { main = d.getElementById("ng-getting-ready-btn"); } catch (e) {}
        if (!main) { try { main = d.querySelector(".PlayBtnWrap button"); } catch (e) {} }
        if (main && !inTile(main)) {
          var t = ((main.innerText || main.textContent) || "").trim();
          var busy = /getting ready|preparing|loading/i.test(t) ||
            main.classList.contains("loading") || main.disabled;
          if (!busy && /play/i.test(t)) {
            realClick(main);
            return true;
          }

          if (busy) return false;
        }
      } catch (e) {}

      try {
        var scope = null;
        try { scope = d.querySelector(".PlayBtnWrap, .HeroAppInfo"); } catch (e) {}
        var btns = (scope || d).querySelectorAll("button, a, [role=button]");
        for (var i = 0; i < btns.length; i++) {
          var b = btns[i];
          if (inTile(b)) continue;

          var bt = ((b.innerText || b.textContent) || "").trim();
          if (!bt || bt.length > 40) continue;
          if (/getting ready|preparing|loading/i.test(bt)) continue;
          var ok = scope
            ? /play/i.test(bt)
            : /play\s+in\s+browser|tap\s+to\s+play|click\s+to\s+play/i.test(bt);
          if (ok) {
            realClick(b);
            return true;
          }
        }
      } catch (e) {}
      return false;
    }
    function tick() {
      try {
        if (done) return true;
        if (started()) { done = true; return true; }
        if (document.hidden) return false;
        if (Date.now() - clickedAt < 2500) return false;
        var hit = false;
        try { hit = tryDoc(document); } catch (e) {}

        if (!hit) {
          try {
            for (var i = 0; i < window.frames.length; i++) {
              try {
                var fd = window.frames[i].document;
                if (fd && tryDoc(fd)) { hit = true; break; }
              } catch (e) {}
            }
          } catch (e) {}
        }
        if (hit) clickedAt = Date.now();
        return false;
      } catch (e) {}
      return false;
    }

    var __playTimer = setInterval(function () {
      try {
        if (tick()) { clearInterval(__playTimer); try { __playMo.disconnect(); } catch (e) {} }
      } catch (e) {}
    }, 1000);
    tick();
    try {
      var __playMo = new MutationObserver(function () {
        try {
          if (tick()) { clearInterval(__playTimer); try { __playMo.disconnect(); } catch (e) {} }
        } catch (e) {}
      });
      __playMo.observe(document.documentElement || document, { childList: true, subtree: true });
    } catch (e) {}
  })();
  var nggLoaderFrame = null;
  var nggWatchedVid = null;
  var nggVideoReady = false;
  var nggVideoLastSeen = 0;
  var nggLoaderBorn = 0;
  var bindVideoLoad = function (v) {
    if (v.__nggLoadBound) return;
    v.__nggLoadBound = true;
    var onload = function () { nggVideoReady = true; syncPreloaderLoader(); };
    try {
      v.addEventListener("loadeddata", onload);
      v.addEventListener("canplay", onload);
      v.addEventListener("error", onload);
    } catch (e) {}
    var rs = 0;
    try { rs = v.readyState || 0; } catch (e) {}
    if (rs >= 2) { nggVideoReady = true; return; }
    setTimeout(function () { nggVideoReady = true; syncPreloaderLoader(); }, 8000);
  };
  var ensureSoundChip = function () {
    try {
      if (document.querySelector('[data-ngg-sound]')) return;
      if (!nggLoaderFrame || !nggLoaderFrame.isConnected) return;
      var b = document.createElement("button");
      b.setAttribute("data-ngg-sound", "1");
      b.textContent = "tap for sound";
      b.style.cssText = "position:fixed;left:50%;bottom:18px;transform:translateX(-50%);z-index:2147483647;padding:8px 16px;border-radius:999px;border:1px solid rgba(255,255,255,.35);background:rgba(0,0,0,.65);color:#fff;font:700 13px system-ui,sans-serif;cursor:pointer;";
      b.onclick = function () {
        try {
          if (nggLoaderFrame) {
            nggLoaderFrame.muted = false;
            try { nggLoaderFrame.volume = 1; } catch (e) {}
            try { nggLoaderFrame.play(); } catch (e) {}
          }
        } catch (e) {}
        try { b.remove(); } catch (e) {}
      };
      (document.body || document.documentElement).appendChild(b);
    } catch (e) {}
  };
  var removeSoundChip = function () {
    try { var c = document.querySelector('[data-ngg-sound]'); if (c) c.remove(); } catch (e) {}
  };
  var syncPreloaderLoader = function () {
    try {
      if (nggLoaderFrame && Date.now() - nggLoaderBorn > 240000) {
        try { nggLoaderFrame.remove(); } catch (e) {}
        nggLoaderFrame = null;
        removeSoundChip();
      }
      var v = document.querySelector("video.preloader-video");
      if (!v) {
        if (nggLoaderFrame && Date.now() - nggVideoLastSeen > 1500) {
          try { nggLoaderFrame.remove(); } catch (e) {}
          nggLoaderFrame = null;
          removeSoundChip();
        }
        nggWatchedVid = null;
        nggVideoReady = false;
        return;
      }
      nggVideoLastSeen = Date.now();
      if (v !== nggWatchedVid) { nggWatchedVid = v; nggVideoReady = false; }
      bindVideoLoad(v);
      if (!nggVideoReady) return;
      try { v.style.visibility = "hidden"; } catch (e) {}
      var r = v.getBoundingClientRect();
      if (!r || r.width < 2 || r.height < 2) return;
      if (!nggLoaderFrame || !nggLoaderFrame.isConnected) {
        var fr = document.createElement("video");
        fr.src = "/__loading.mp4";
        fr.setAttribute("title", "loading");
        fr.setAttribute("data-ngg-loader", "1");
        try { fr.autoplay = true; } catch (e) {}
        try { fr.loop = true; } catch (e) {}
        try { fr.muted = false; } catch (e) {}
        try { fr.volume = 1; } catch (e) {}
        try { fr.playsInline = true; } catch (e) {}
        try { fr.setAttribute("playsinline", ""); } catch (e) {}
        try { fr.setAttribute("autoplay", ""); } catch (e) {}
        try { fr.setAttribute("loop", ""); } catch (e) {}
        try { v.parentNode.insertBefore(fr, v.nextSibling); }
        catch (e) { (document.body || document.documentElement).appendChild(fr); }
        try {
          var pp = fr.play();
          if (pp && pp.catch) pp.catch(function () {

            try { fr.muted = true; } catch (e) {}
            try { fr.play(); } catch (e) {}
            try { ensureSoundChip(); } catch (e) {}
          });
        } catch (e) {}
        try {
          var unmute = function () {
            try {
              if (nggLoaderFrame && nggLoaderFrame.isConnected) {
                nggLoaderFrame.muted = false;
                try { nggLoaderFrame.volume = 1; } catch (e) {}
                try { nggLoaderFrame.play(); } catch (e) {}
              }
              var chip = document.querySelector('[data-ngg-sound]');
              if (chip) { try { chip.remove(); } catch (e) {} }
            } catch (e) {}
          };
          if (!window.__nggSoundArmed) {
            window.__nggSoundArmed = 1;
            try { document.addEventListener("pointerdown", unmute); } catch (e) {}
            try { document.addEventListener("keydown", unmute); } catch (e) {}
            try { document.addEventListener("touchend", unmute); } catch (e) {}
          }
        } catch (e) {}
        nggLoaderFrame = fr;
        nggLoaderBorn = Date.now();
      }
      var cs = null;
      try { cs = window.getComputedStyle(v); } catch (e) {}
      var st = "border:0;display:block;position:fixed;object-fit:cover;background:#000;left:" + r.left + "px;top:" + r.top + "px;width:" + r.width + "px;height:" + r.height + "px;";
      if (cs) {
        if (cs.transform && cs.transform !== "none") st += "transform:" + cs.transform + ";";
        if (cs.transformOrigin) st += "transform-origin:" + cs.transformOrigin + ";";
      }
      nggLoaderFrame.style.cssText = st;
    } catch (e) {}
  };
  syncPreloaderLoader();
  setInterval(function () {
    try { if (document.hidden) return; } catch (e) {}

    try { if (window.__nggGameRunning) return; } catch (e) {}
    syncPreloaderLoader();
  }, 1000);
})();
(function () {
  
  
  
  
  
  if (window.__sealGreyTheme) return; window.__sealGreyTheme = 1;
  var H_MIN = 290, H_MAX = 350, S_MIN = 0.25; 
  var G_MIN = 135, G_MAX = 170, GS_MIN = 0.35; 
  function toRgb(h) {
    h = h.replace(/^#/, "");
    if (h.length === 3) h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2];
    var n = parseInt(h, 16);
    if (isNaN(n)) return null;
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255, 1];
  }
  function parseColor(s) {
    s = String(s || "").trim().toLowerCase();
    var m;
    if (s.charAt(0) === "#") return toRgb(s);
    if ((m = s.match(/^rgba?\(([^)]*)\)/))) {
      var p = m[1].split(",");
      if (p.length < 3) return null;
      var r = parseFloat(p[0]), g = parseFloat(p[1]), b = parseFloat(p[2]);
      var a = p.length > 3 ? parseFloat(p[3]) : 1;
      if ([r, g, b].some(function (v) { return isNaN(v); })) return null;
      return [r, g, b, isNaN(a) ? 1 : a];
    }
    if ((m = s.match(/^hsla?\(([^)]*)\)/))) {
      var q = m[1].split(",");
      if (q.length < 3) return null;
      var hh = parseFloat(q[0]), ss = parseFloat(q[1]), ll = parseFloat(q[2]);
      if ([hh, ss, ll].some(function (v) { return isNaN(v); })) return null;
      ss /= 100; ll /= 100;
      var al = q.length > 3 ? parseFloat(q[3]) : 1;
      var c = (1 - Math.abs(2 * ll - 1)) * ss;
      var x = c * (1 - Math.abs(((hh / 60) % 2) - 1));
      var mm = ll - c / 2, rr = 0, gg = 0, bb = 0;
      if (hh < 60) { rr = c; gg = x; } else if (hh < 120) { rr = x; gg = c; }
      else if (hh < 180) { gg = c; bb = x; } else if (hh < 240) { gg = x; bb = c; }
      else if (hh < 300) { rr = x; bb = c; } else { rr = c; bb = x; }
      return [(rr + mm) * 255, (gg + mm) * 255, (bb + mm) * 255, isNaN(al) ? 1 : al];
    }
    return null;
  }
  function hslOf(r, g, b) {
    r /= 255; g /= 255; b /= 255;
    var mx = Math.max(r, g, b), mn = Math.min(r, g, b);
    var h = 0, s = 0, l = (mx + mn) / 2;
    if (mx !== mn) {
      var d = mx - mn;
      s = l > 0.5 ? d / (2 - mx - mn) : d / (mx + mn);
      if (mx === r) h = ((g - b) / d + (g < b ? 6 : 0)) * 60;
      else if (mx === g) h = ((b - r) / d + 2) * 60;
      else h = ((r - g) / d + 4) * 60;
    }
    return [h, s, l];
  }
  function isThemed(c) {
    try {
      var hsl = hslOf(c[0], c[1], c[2]);
      if (hsl[0] >= H_MIN && hsl[0] <= H_MAX && hsl[1] >= S_MIN) return true;
      if (hsl[0] >= G_MIN && hsl[0] <= G_MAX && hsl[1] >= GS_MIN) return true;
      return false;
    } catch (e) { return false; }
  }
  function greyFor(c) {
    
    
    var l = (0.299 * c[0] + 0.587 * c[1] + 0.114 * c[2]) / 255;
    var v = Math.max(0, Math.min(255, Math.round(l * 70)));
    return c[3] >= 1
      ? "rgb(" + v + ", " + v + ", " + v + ")"
      : "rgba(" + v + ", " + v + ", " + v + ", " + c[3] + ")";
  }
  var COLOR_RE = /#[0-9a-fA-F]{6}\b|#[0-9a-fA-F]{3}\b|rgba?\([^)]*\)|hsla?\([^)]*\)/g;
  function rewriteValue(m) {
    try {
      var c = parseColor(m);
      if (c && isThemed(c)) return greyFor(c);
    } catch (e) {}
    return m;
  }
  function rewriteCssText(css) {
    try {
      if (css == null || css === "") return css;
      return String(css).replace(COLOR_RE, rewriteValue);
    } catch (e) { return css; }
  }
  function themeRuleList(list) {
    for (var i = 0; i < list.length; i++) {
      var r = null;
      try { r = list[i]; } catch (e) { continue; }
      if (!r) continue;
      try {
        if (r.cssRules) { themeRuleList(r.cssRules); continue; } 
        var orig = r.cssText;
        if (!orig) continue;
        var next = rewriteCssText(orig);
        if (next !== orig) {
          try { list.deleteRule(i); } catch (e) { continue; }
          try { list.insertRule(next, i); } catch (e) {}
          try { r = list[i]; } catch (e) {}
        }
      } catch (e) {}
    }
  }
  function themeSheet(sheet) {
    try {
      if (!sheet || !sheet.cssRules) return false;
      var before = sheet.cssRules.length;
      themeRuleList(sheet.cssRules);
      return sheet.cssRules.length !== before ? true : true;
    } catch (e) { return false; } 
  }
  function themeStyleEl(el) {
    try {
      if (el.sheet) themeSheet(el.sheet);
      var t = el.textContent;
      if (t && t.indexOf("#") !== -1) {
        var nt = rewriteCssText(t);
        if (nt !== t) el.textContent = nt;
      }
    } catch (e) {}
  }
  function sweepSheets() {
    try {
      var sheets = document.styleSheets;
      for (var i = 0; i < sheets.length; i++) {
        var sh = null;
        try { sh = sheets[i]; } catch (e) { continue; }
        var n = -1;
        try { n = sh.cssRules ? sh.cssRules.length : -1; } catch (e) { continue; }
        if (sh.__sealRuleCount !== n) {
          sh.__sealRuleCount = n;
          themeSheet(sh);
          try { sh.__sealRuleCount = sh.cssRules.length; } catch (e) {}
        }
      }
      var tags = document.querySelectorAll("style");
      for (var j = 0; j < tags.length; j++) {
        try {
          var el = tags[j];
          if (!el.__sealSeen) { el.__sealSeen = 1; themeStyleEl(el); }
          else if (el.sheet) {
            var m = -1;
            try { m = el.sheet.cssRules ? el.sheet.cssRules.length : -1; } catch (e) { continue; }
            if (el.__sealSheetCount !== m) { el.__sealSheetCount = m; themeSheet(el.sheet); }
          }
        } catch (e) {}
      }
    } catch (e) {}
  }
  function sweepInline() {
    try {
      var nodes = document.querySelectorAll("[style]");
      var cap = nodes.length > 1500 ? 1500 : nodes.length;
      for (var i = 0; i < cap; i++) {
        var el = nodes[i];
        var s = null;
        try { s = el.getAttribute("style"); } catch (e) { continue; }
        if (!s) continue;
        if (s.indexOf("#") === -1 && s.indexOf("rgb") === -1 && s.indexOf("hsl") === -1) continue;
        var ns = rewriteCssText(s);
        if (ns !== s) { try { el.setAttribute("style", ns); } catch (e) {} }
      }
      var svg = document.querySelectorAll("[fill],[stroke]");
      var cap2 = svg.length > 500 ? 500 : svg.length;
      for (var j = 0; j < cap2; j++) {
        ["fill", "stroke"].forEach(function (at) {
          var v = null;
          try { v = svg[j].getAttribute(at); } catch (e) {}
          if (!v) return;
          var nv = rewriteCssText(v);
          if (nv !== v) { try { svg[j].setAttribute(at, nv); } catch (e) {} }
        });
      }
    } catch (e) {}
  }
  function fullSweep() { sweepSheets(); sweepInline(); }
  try { window.__sealGreyThemeApi = { rewriteCssText: rewriteCssText, isThemed: isThemed }; } catch (e) {}
  fullSweep();
  setInterval(function () { try { if (!document.hidden) fullSweep(); } catch (e) {} }, 5000);
  try {
    var mo = new MutationObserver(function (muts) {
      var dirty = false;
      for (var i = 0; i < muts.length; i++) {
        var m = muts[i];
        if (m.type !== "childList") continue;
        for (var j = 0; j < m.addedNodes.length; j++) {
          var n = m.addedNodes[j];
          if (n && n.nodeType === 1 && (n.tagName === "STYLE" || (n.querySelectorAll && n.querySelectorAll("style").length))) {
            dirty = true;
            break;
          }
        }
        if (dirty) break;
      }
      if (dirty) setTimeout(function () { try { sweepSheets(); } catch (e) {} }, 120);
    });
    mo.observe(document.documentElement || document, { childList: true, subtree: true });
  } catch (e) {}
})();
(function () {
  
  
  
  
  if (window.__sealLogo) return; window.__sealLogo = 1;
  var ICON_URL = "/logo/icon.png";
  var TITLE_URL = "/logo/title.svg";
  var SEL = 'img.ngg-logo,#ng-logo,img[alt="now.gg Logo"]';
  function buildLogo() {
    var wrap = document.createElement("span");
    wrap.setAttribute("data-seal-logo", "1");
    wrap.style.cssText = "display:inline-flex;align-items:center;gap:8px;line-height:0;";
    var icon = document.createElement("img");
    icon.src = ICON_URL;
    icon.alt = "nowgg.org";
    icon.width = 36; icon.height = 36;
    icon.setAttribute("draggable", "false");
    icon.style.cssText = "width:36px;height:36px;object-fit:contain;display:block;flex:none;";
    var title = document.createElement("img");
    title.src = TITLE_URL;
    title.alt = "nowgg.org";
    title.setAttribute("draggable", "false");
    title.style.cssText = "width:116px;height:auto;display:block;flex:none;";
    wrap.appendChild(icon);
    wrap.appendChild(title);
    return wrap;
  }
  function swapOne(img) {
    try {
      if (!img || !img.parentNode) return;
      try { if (img.dataset && img.dataset.sealReplaced === "1") return; } catch (e) {}
      var parent = img.parentNode;
      try {
        if (parent.querySelector && parent.querySelector("[data-seal-logo]")) return;
      } catch (e) {}
      try { if (img.dataset) img.dataset.sealReplaced = "1"; } catch (e) {}
      parent.replaceChild(buildLogo(), img);
    } catch (e) {}
  }
  function swapLogo(root) {
    try {
      var scope = (root && root.querySelectorAll) ? root : document;
      try {
        if (scope !== document && scope.matches && scope.matches(SEL)) swapOne(scope);
      } catch (e) {}
      var imgs = scope.querySelectorAll ? scope.querySelectorAll(SEL) : [];
      for (var i = 0; i < imgs.length; i++) swapOne(imgs[i]);
      
      
      try {
        var boxes = scope.querySelectorAll ? scope.querySelectorAll(".app-logo") : [];
        for (var k = 0; k < boxes.length; k++) {
          var box = boxes[k];
          var hasSeal = false, hasImg = false;
          try { hasSeal = !!box.querySelector("[data-seal-logo]"); } catch (e) {}
          try { hasImg = !!box.querySelector("img"); } catch (e) {}
          if (!hasSeal && !hasImg) { try { box.appendChild(buildLogo()); } catch (e) {} }
        }
      } catch (e) {}
    } catch (e) {}
  }
  swapLogo(document);
  setInterval(function () { try { if (!document.hidden) swapLogo(document); } catch (e) {} }, 2000);
  try {
    var lmo = new MutationObserver(function (muts) {
      for (var i = 0; i < muts.length; i++) {
        var m = muts[i];
        if (m.type !== "childList") continue;
        for (var j = 0; j < m.addedNodes.length; j++) {
          var n = m.addedNodes[j];
          if (n && n.nodeType === 1) swapLogo(n);
        }
      }
    });
    lmo.observe(document.documentElement || document, { childList: true, subtree: true });
  } catch (e) {}
})();
(function () {
  
  if (window.__sealAlert) return; window.__sealAlert = 1;
  try {
    if (window.top !== window.self) return;
    var p = "";
    try { p = window.location.pathname || ""; } catch (e) {}
    var isGame = /^\/apps\/[^\/]+\/\d+\/[^\/]+\.html$/.test(p) ||
      /^\/play\/apps\/[^\/]+\/\d+\/[^\/]+\.html$/.test(p);
    if (!isGame) return;
    alert("nowgg.org by nebula unblocking\njoin the discord at https://discord.gg/nebulaunblocking\ndo NOT attack me if ts fails");
  } catch (e) {}
})();
