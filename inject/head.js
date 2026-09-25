(function () {
  try {
    var __css = document.createElement("style");
    __css.textContent = "video.preloader-video{visibility:hidden!important;}";
    (document.head || document.documentElement).appendChild(__css);
  } catch (e) {}
})();
(function () {
  if (!window.__nggFetchShim) {
    window.__nggFetchShim = 1;
    window.__nggShimVersion = 4;
    var ngglog = function () {};
    var rewriteUrl = function (u) {
      if (typeof u !== "string") return u;
      if (u.indexOf("https://now.gg/") === 0) return u.slice("https://now.gg".length) || "/";
      if (u.indexOf("https://www.now.gg/") === 0) return u.slice("https://www.now.gg".length) || "/";
      if (u.indexOf("http://now.gg/") === 0) return u.slice("http://now.gg".length) || "/";
      if (u.indexOf("https://cdn.now.gg/") === 0) return "/__cdn/" + u.slice("https://cdn.now.gg/".length);
      if (u.indexOf("https://bugpilot.now.gg/") === 0) return "/__noop/" + u.slice("https://bugpilot.now.gg/".length);
      return u;
    };
    var PROXY_ORIGIN = window.location.origin;
    var UPSTREAM_ORIGIN = "https://now.gg";
    var ENC_PROXY_ORIGIN = encodeURIComponent(PROXY_ORIGIN);
    var ENC_UPSTREAM_ORIGIN = encodeURIComponent(UPSTREAM_ORIGIN);
    var fixOriginLeak = function (s) {
      if (typeof s !== "string" || !s) return s;
      if (s.indexOf(PROXY_ORIGIN) === -1 && s.indexOf(ENC_PROXY_ORIGIN) === -1) return s;
      return s.split(PROXY_ORIGIN).join(UPSTREAM_ORIGIN)
              .split(ENC_PROXY_ORIGIN).join(ENC_UPSTREAM_ORIGIN);
    };
    var scrubUrl = function (u) {
      if (typeof u !== "string" || !u) return u;
      if (u.indexOf(PROXY_ORIGIN) === 0) return PROXY_ORIGIN + fixOriginLeak(u.slice(PROXY_ORIGIN.length));
      return fixOriginLeak(u);
    };
    var fixBody = function (init) {
      try {
        if (init && typeof init.body === "string") {
          var nb = fixOriginLeak(init.body);
          if (nb !== init.body) {
            var copy = {};
            for (var k in init) copy[k] = init[k];
            copy.body = nb;
            return copy;
          }
        }
      } catch (e) {}
      return init;
    };
    try {
      var origFetch = window.fetch;
      if (origFetch) {
        window.fetch = function (input, init) {
          try {
            var urlStr = "";
            try {
              urlStr = (typeof input === "string") ? input : ((input && (input.url || input.href)) || "");
              if (typeof urlStr !== "string") urlStr = "";
            } catch (e) { urlStr = ""; }
            if (urlStr.indexOf("/accounts/auth/v2/access-token") !== -1 && window.__nggVendedToken) {
              ngglog("vended token reply");
              var vt = window.__nggVendedToken;
              return Promise.resolve(new Response(JSON.stringify({
                success: true, code: "EXISTING_GUEST_USER", msg: "",
                access_token: vt.access_token, access_token_expiry: vt.access_token_expiry
              }), { status: 200, headers: { "Content-Type": "application/json" } }));
            }
            if (typeof input === "string") {
              var sOut = scrubUrl(rewriteUrl(input));
              if (sOut !== input) ngglog("fetch string", input.slice(0, 90), "->", sOut.slice(0, 90));
              return origFetch.call(this, sOut, fixBody(init));
            }
            if ((typeof URL !== "undefined" && input instanceof URL) ||
                (input && typeof input.href === "string" && typeof input.url !== "string")) {
              var href = (typeof input.toString === "function") ? input.toString() : input.href;
              var hOut = scrubUrl(rewriteUrl(href));
              if (hOut !== href) ngglog("fetch URL-obj", href.slice(0, 90), "->", hOut.slice(0, 90));
              return origFetch.call(this, hOut, fixBody(init));
            }
            if (input && typeof input.url === "string") {
              var cur = input.url;
              var fixed = cur;
              if (/^https?:\/\/(www\.)?now\.gg\//.test(cur) || cur.indexOf("cdn.now.gg/") !== -1 ||
                  cur.indexOf("bugpilot.now.gg/") !== -1 || cur.indexOf(PROXY_ORIGIN) !== -1) {
                fixed = scrubUrl(rewriteUrl(cur));
              }
              if (fixed !== cur) {
                ngglog("fetch Request", cur.slice(0, 90), "->", fixed.slice(0, 90), init === undefined ? "(no init)" : "(with init)");
                try {
                  var base = new Request(fixed, input);
                  input = (init === undefined) ? base : new Request(base, init);
                  init = undefined;
                } catch (e) { ngglog("Request rebuild failed", String(e).slice(0, 120)); }
              }
            }
          } catch (e) {}
          return origFetch.call(this, input, init);
        };
      }
      var origOpen = window.XMLHttpRequest && window.XMLHttpRequest.prototype.open;
      if (origOpen) {
        window.XMLHttpRequest.prototype.open = function (method, url) {
          try { if (typeof url === "string") arguments[1] = scrubUrl(rewriteUrl(url)); } catch (e) {}
          return origOpen.apply(this, arguments);
        };
      }
    } catch (e) {}
  }
})();
(function () {
  if (window.__nggTudeStub) return; window.__nggTudeStub = 1;
  var r = function () { return { width: 1280, height: 720 }; };
  var tude = {
    cmd: { push: function (fn) { try { if (typeof fn === "function") fn(); } catch (e) {} return 1; } },
    setIdProfile: function () {},
    setPageTargeting: function () {},
    refreshAdsViaDivMappings: function () {},
    initCustomRewarded: function (opts) {
      opts = opts || {};
      var st = window.__nggRewardLoop || (window.__nggRewardLoop = { rounds: 0, timer: null });
      function fire() {
        st.rounds++;
        setTimeout(function () { try { if (opts.onOpen) opts.onOpen({ target: { getBoundingClientRect: r } }); } catch (e) {} }, 400);
        setTimeout(function () { try { if (opts.onRewardGranted) opts.onRewardGranted(); } catch (e) {} }, 1700);
        setTimeout(function () { try { if (opts.onClose) opts.onClose({}); } catch (e) {} }, 2900);
        if (st.rounds < 100) { st.timer = setTimeout(fire, 5000); } else { st.timer = null; }
      }
      if (!st.timer) fire();
      return new Promise(function (resolve) { setTimeout(resolve, 3000); });
    }
  };
  try { window.tude = window.tude || tude; } catch (e) { window.tude = tude; }
  try { window.googletag = window.googletag || { cmd: [] }; } catch (e) {}
  (function () {
    var hidden = new Map();
    var scan = setInterval(function () {
      var all = document.querySelectorAll("span,div,p,time,b,strong,label,h1,h2,h3");
      for (var i = 0; i < all.length; i++) {
        var el = all[i];
        if (el.childElementCount) continue;
        var t = (el.textContent || "").trim();
        if (!t || t.length > 18) continue;
        if (!/^\d{1,4}:\d{2}(:\d{2})?$/.test(t) && !/^\d{3,6}$/.test(t) && !/^\d{1,4}\s*(min|mins?|secs?|s|m)?\s*$/.test(t)) continue;
        var prev = hidden.get(el);
        if (prev !== undefined && prev !== t) {
          el.style.display = "none";
          el.style.visibility = "hidden";
        }
        hidden.set(el, t);
      }
    }, 250);
    var clicks = 0;
    var clicker = setInterval(function () {
      if (clicks >= 100) { clearInterval(clicker); return; }
      var btns = document.querySelectorAll("button, [role=button], a");
      for (var i = 0; i < btns.length; i++) {
        var txt = (btns[i].textContent || "").trim();
        if (txt === "Get more time" || txt === "Add more time" || txt === "Watch Ad") {
          clicks++;
          btns[i].click();
          break;
        }
      }
    }, 5000);
    var popupCss = document.createElement("style");
    popupCss.textContent = ".sc-f453a444-1{display:none!important}.sc-f453a444-2{display:none!important}.sc-5778dd3f-10{display:none!important}.sc-4e159119-0{display:none!important}";
    (document.head || document.documentElement).appendChild(popupCss);
    var hideMoreTime = function () {
      var all = document.querySelectorAll("button,[role=button],a,span,div");
      for (var i = 0; i < all.length; i++) {
        var el = all[i];
        if (el.childElementCount) continue;
        var t = (el.textContent || "").trim();
        if (!t || t.length > 30) continue;
        if (!/add more time|get more time|watch ad|watch1ad/i.test(t)) continue;
        el.style.display = "none";
        el.style.visibility = "hidden";
      }
    };
    hideMoreTime();
    setInterval(hideMoreTime, 1500);
  })();
})();
