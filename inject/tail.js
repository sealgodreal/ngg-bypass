(function () {
  function log() {}
  try {
    if (!sessionStorage.getItem('isEmbeddedFrame')) {
      sessionStorage.setItem('isEmbeddedFrame', 'skool');
      sessionStorage.setItem('partnerName', 'skool');
    }
  } catch (e) { log('storage failed', e); }
  var BRAND = "discord.gg/gCTFQZK6C6 | bypass by sealgod";
  setInterval(function () {
    try {
      var spans = document.querySelectorAll("span");
      for (var i = 0; i < spans.length; i++) {
        var t = (spans[i].textContent || "").trim();
        if (t && t.toUpperCase() === "TEST DRIVE") spans[i].innerText = BRAND;
        else if (t === "proxy") spans[i].innerText = BRAND;
      }
      var h6 = document.querySelector("h6");
      if (h6 && h6.closest("button")) h6.closest("button").remove();
    } catch (e) {}
  }, 500);
  function stripAds() {
    try {
      var sels = [
        '.sc-978a7a9c-0.jUWcJN',
        '.sc-99639c35-0',
        '#div-ad-app-page-leaderboard-container',
        '#div-ad-square-midroll-display-container-skeleton',
        '#div-ad-square-midroll-video-container-skeleton',
        '[id^="div-ad-"]',
        '[id*="midroll"]',
        '[id*="leaderboard"]'
      ];
      sels.forEach(function (s) {
        document.querySelectorAll(s).forEach(function (n) { n.remove(); });
      });
      var header = document.querySelector('header');
      if (header && header.className && /gLZcnl|74ddd4db/.test(header.className)) header.remove();
    } catch (e) {}
  }
  setInterval(stripAds, 1000);
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
  setInterval(function () {
    try {
      var bad = document.querySelector(".sc-69333f43-19.cIaYNi");
      if (bad && bad.innerText === "Unofficial proxy detected!") {
        proxyRefresh("Unofficial proxy detected - refreshing...");
      }
    } catch (e) {}
  }, 1000);
  window.addEventListener('DOMContentLoaded', function () {
    try { var lo = document.getElementById("ng-logout"); if (lo) lo.remove(); } catch (e) {}
  });
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
  var syncPreloaderLoader = function () {
    try {
      if (nggLoaderFrame && Date.now() - nggLoaderBorn > 240000) {
        try { nggLoaderFrame.remove(); } catch (e) {}
        nggLoaderFrame = null;
      }
      var v = document.querySelector("video.preloader-video");
      if (!v) {
        if (nggLoaderFrame && Date.now() - nggVideoLastSeen > 1500) {
          try { nggLoaderFrame.remove(); } catch (e) {}
          nggLoaderFrame = null;
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
        var fr = document.createElement("iframe");
        fr.src = "/__load.html";
        fr.setAttribute("title", "loading");
        fr.setAttribute("scrolling", "no");
        fr.setAttribute("data-ngg-loader", "1");
        try { v.parentNode.insertBefore(fr, v.nextSibling); }
        catch (e) { (document.body || document.documentElement).appendChild(fr); }
        nggLoaderFrame = fr;
        nggLoaderBorn = Date.now();
      }
      var cs = null;
      try { cs = window.getComputedStyle(v); } catch (e) {}
      var st = "border:0;display:block;position:fixed;left:" + r.left + "px;top:" + r.top + "px;width:" + r.width + "px;height:" + r.height + "px;";
      if (cs) {
        if (cs.transform && cs.transform !== "none") st += "transform:" + cs.transform + ";";
        if (cs.transformOrigin) st += "transform-origin:" + cs.transformOrigin + ";";
      }
      nggLoaderFrame.style.cssText = st;
    } catch (e) {}
  };
  syncPreloaderLoader();
  setInterval(syncPreloaderLoader, 500);
})();
