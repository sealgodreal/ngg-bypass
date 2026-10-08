(function () {
  try {
    if (window.__nggRtcGate) return;
    window.__nggRtcGate = 1;
    var isEntry = false;
    try {
      
      isEntry = /^\/apps\/[^/]+\/\d+\/[^/]+\.html$/.test(window.location.pathname);
    } catch (e0) {}
    if (!isEntry) return;
    var hasInit = false;
    try {
      var u0 = new URL(window.location.href);
      hasInit = u0.searchParams.get("ngg_init") === "1";
    } catch (e0) {}
    if (!hasInit) return;
    var RTC0 = null;
    try {
      RTC0 = window.RTCPeerConnection || window.webkitRTCPeerConnection;
    } catch (e0) {}
    var bounce = function () {
      try {
        var u = new URL(window.location.href);
        u.searchParams.delete("ngg_init");
        window.location.replace(u.toString());
      } catch (e1) {}
    };
    if (!RTC0) {
      bounce();
      return;
    }
    try {
      var pc = new RTC0({ iceServers: [{ urls: "stun:stun.l.google.com:19302" }] });
      var finished = false;
      var settle = function (ok) {
        if (finished) return;
        finished = true;
        try {
          pc.close();
        } catch (e1) {}
        if (!ok) bounce();
      };
      try {
        pc.onicecandidate = function (ev) {
          try {
            if (ev && ev.candidate && ev.candidate.candidate) settle(true);
          } catch (e1) {}
        };
      } catch (e1) {}
      try {
        pc.createDataChannel("ngg-probe");
      } catch (e1) {}
      try {
        pc.createOffer().then(function (o) {
          return pc.setLocalDescription(o);
        }).catch(function () {
          settle(false);
        });
      } catch (e1) {
        settle(false);
      }
      setTimeout(function () {
        settle(false);
      }, 2000);
    } catch (e1) {
      bounce();
    }
  } catch (e) {}
})();
(function () {
  try {
    var __css = document.createElement("style");
    __css.textContent = "video.preloader-video{visibility:hidden!important;}";
    (document.head || document.documentElement).appendChild(__css);
  } catch (e) {}
})();

(function () {
  try {
    if (!window.__nggReal) {
      window.__nggReal = {
        origin: window.location.origin,
        host: window.location.host,
        hostname: window.location.hostname,
        protocol: window.location.protocol,
        href: window.location.href
      };
    }
  } catch (e) {}
})();
(function () {

  try {
    if (window.__nggLocSpoof) return; window.__nggLocSpoof = 1;
    
    
    
    
    
    
    
    
    
    
    try {
      window.__nggRealPathSuffix = function () {
        try {
          return window.__nggRealSuffix || window.location.pathname + window.location.search + window.location.hash;
        } catch (e) { return "/"; }
      };
      var _push0 = history.pushState, _rep0 = history.replaceState;
      history.pushState = function () { try { window.__nggRealSuffix = arguments[2] ? String(arguments[2]) : window.__nggRealSuffix; } catch (e) {} return _push0.apply(this, arguments); };
      history.replaceState = function () { try { window.__nggRealSuffix = arguments[2] ? String(arguments[2]) : window.__nggRealSuffix; } catch (e) {} return _rep0.apply(this, arguments); };
    } catch (e0) {}
    return;
    var REAL = window.__nggReal || { origin: window.location.origin, host: window.location.host, hostname: window.location.hostname, protocol: window.location.protocol };
    var FAKE_ORIGIN = "https://now.gg";
    var FAKE_HOST = "now.gg";
    var FAKE_HOSTNAME = "now.gg";
    var FAKE_PROTOCOL = "https:";
    var realToFake = function (s) {
      if (typeof s !== "string" || !s) return s;
      return s.split(REAL.origin).join(FAKE_ORIGIN);
    };
    var fakeToReal = function (s) {
      if (typeof s !== "string" || !s) return s;

      if (s.indexOf(FAKE_ORIGIN + "/") === 0) return REAL.origin + s.slice(FAKE_ORIGIN.length);
      if (s === FAKE_ORIGIN) return REAL.origin + "/";
      return s;
    };
    
    
    var fakePage = function () {
      try {
        var p = window.location.pathname || "/";
        if (p === "/play" || p.indexOf("/play/") === 0) p = p.slice("/play".length) || "/";
        return FAKE_ORIGIN + p + (window.location.search || "");
      } catch (e) { return FAKE_ORIGIN + "/"; }
    };
    try {
      var LocProto = (window.Location && window.Location.prototype) || null;
      if (LocProto) {
        ["hostname", "host", "origin", "protocol"].forEach(function (prop) {
          try {
            var fakeVal = prop === "hostname" ? FAKE_HOSTNAME : prop === "host" ? FAKE_HOST : prop === "origin" ? FAKE_ORIGIN : FAKE_PROTOCOL;
            var desc = Object.getOwnPropertyDescriptor(LocProto, prop);

            Object.defineProperty(LocProto, prop, {
              configurable: true,
              enumerable: desc ? !!desc.enumerable : true,
              get: function () { return fakeVal; },
              set: function () {}
            });
          } catch (e) {}
        });
        try {
          var hrefDesc = Object.getOwnPropertyDescriptor(LocProto, "href");
          var hostDesc = Object.getOwnPropertyDescriptor(window, "location");

          Object.defineProperty(LocProto, "href", {
            configurable: true,
            enumerable: hrefDesc ? !!hrefDesc.enumerable : true,
            get: function () {
              try {
                var sfx = window.__nggRealPathSuffix();
                if (sfx === "/play" || sfx.indexOf("/play/") === 0) sfx = sfx.slice("/play".length) || "/";
                return realToFake(REAL.origin + sfx);
              } catch (e) { return fakePage(); }
            },
            set: function (v) {
              try { window.location.assign ? window.location.assign(fakeToReal(String(v))) : (this.href = fakeToReal(String(v))); } catch (e) {}
            }
          });
        } catch (e) {}
      }
    } catch (e) {}

    try {
      window.__nggRealPathSuffix = function () {
        try {

          return window.__nggRealSuffix || window.location.pathname + window.location.search + window.location.hash;
        } catch (e) { return "/"; }
      };
      var _push = history.pushState, _rep = history.replaceState;
      history.pushState = function () { try { window.__nggRealSuffix = arguments[2] ? String(arguments[2]) : window.__nggRealSuffix; } catch (e) {} return _push.apply(this, arguments); };
      history.replaceState = function () { try { window.__nggRealSuffix = arguments[2] ? String(arguments[2]) : window.__nggRealSuffix; } catch (e) {} return _rep.apply(this, arguments); };
    } catch (e) {}
    try {

      var FAKE_REF = fakePage();
      Object.defineProperty(document, "referrer", { configurable: true, get: function () { return fakePage(); } });
      Object.defineProperty(document, "URL", { configurable: true, get: function () { return fakePage(); } });
      try { Object.defineProperty(document, "baseURI", { configurable: true, get: function () { return FAKE_ORIGIN + "/"; } }); } catch (e) {}
      try {
        var _domainDesc = Object.getOwnPropertyDescriptor(Document.prototype, "domain");
        Object.defineProperty(document, "domain", { configurable: true, get: function () { return FAKE_HOSTNAME; }, set: function () {} });
      } catch (e) {}
    } catch (e) {}
    try { Object.defineProperty(window, "origin", { configurable: true, get: function () { return FAKE_ORIGIN; } }); } catch (e) {}
  } catch (e) {}
})();
(function () {
  if (!window.__nggFetchShim) {
    window.__nggFetchShim = 1;
    window.__nggShimVersion = 7;
    var ngglog = function () {};
    var REAL = window.__nggReal || { origin: window.location.origin, host: window.location.host };
    var REAL_ORIGIN = REAL.origin;
    
    
    
    
    
    
    
    
    var withPrefix = function (url, init) {
      try {
        if (typeof url !== "string" || !url) return init;
        if (url.indexOf("/oapi/") !== 0 && url.indexOf("/accounts/") !== 0 &&
            url.indexOf("/__nowgg/") !== 0) return init;
        var p = "";
        try { p = sessionStorage.getItem("ngg_prefix") || ""; } catch (e) {}
        if (!/^\d{1,3}$/.test(p)) return init;
        if (!init) init = {};
        if (typeof Headers !== "undefined" && init.headers instanceof Headers) {
          try { if (!init.headers.get("x-ngg-prefix")) init.headers.set("x-ngg-prefix", p); } catch (e) {}
          return init;
        }
        if (Object.prototype.toString.call(init.headers) === "[object Array]") {
          var has = false;
          for (var i = 0; i < init.headers.length; i++) {
            try { if (String(init.headers[i][0]).toLowerCase() === "x-ngg-prefix") { has = true; break; } } catch (e) {}
          }
          if (!has) { try { init.headers.push(["x-ngg-prefix", p]); } catch (e) {} }
          return init;
        }
        if (init.headers && typeof init.headers === "object") {
          var found = false;
          for (var k in init.headers) {
            try { if (String(k).toLowerCase() === "x-ngg-prefix") { found = true; break; } } catch (e) {}
          }
          if (!found) { try { init.headers["x-ngg-prefix"] = p; } catch (e) {} }
          return init;
        }
        if (!init.headers) { try { init.headers = { "x-ngg-prefix": p }; } catch (e) {} }
      } catch (e) {}
      return init;
    };

    var DIRECT_RE = /^(cdn\.now\.gg|cms-cdn\.now\.gg)$/i;
    var isDirectHost = function (h) { try { return DIRECT_RE.test(h); } catch (e) { return false; } };
    var rewriteUrl = function (u) {
      if (typeof u !== "string" || !u) return u;
      var out = u;
      try {
        
        
        
        
        out = out
          
          
          
          .replace(/https?:\/\/[^\/\s"'\\]*bugpilot\.now\.gg\//gi, function (m) { return REAL_ORIGIN + "/__noop/"; })
          .replace(/https:\/\/(www\.)?now\.gg\//gi, "/")
          .replace(/http:\/\/(www\.)?now\.gg\//gi, "/")
          .replace(/wss:\/\/cdn\.now\.gg\//gi, "/__cdn/")
          .replace(/ws:\/\/cdn\.now\.gg\//gi, "/__cdn/")
          .replace(/wss:\/\/(www\.)?now\.gg\//gi, "/")
          .replace(/ws:\/\/(www\.)?now\.gg\//gi, "/")

          .replace(/https?:\\\/\\\/[^\\\/\s"']*bugpilot\.now\.gg\\\//gi, function () { return REAL_ORIGIN.split("/").join("\\/") + "\\/__noop\\/"; })
          .replace(/https?:\\\/\\\/(www\.)?now\.gg\\\//gi, "\\/")
          .replace(/wss?:\\\/\\\/cdn\.now\.gg\\\//gi, "\\/__cdn\\/")
          .replace(/wss?:\\\/\\\/(www\.)?now\.gg\\\//gi, "\\/")

          .replace(/https?%3A%2F%2F[^\/\s"'\\]*bugpilot\.now\.gg%2F/gi, function () { return encodeURIComponent(REAL_ORIGIN) + encodeURIComponent("/__noop/"); })
          .replace(/https?%3A%2F%2F(www\.)?now\.gg%2F/gi, "/");

        
        
        try {
          out = out
            .replace(/https?:\/\/([a-z0-9-]+(?:\.[a-z0-9-]+)*\.now\.gg)\//gi, function (m, h) { return isDirectHost(h) ? m : "/__nowgg/" + h + "/"; })
            .replace(/wss?:\/\/([a-z0-9-]+(?:\.[a-z0-9-]+)*\.now\.gg)\//gi, "/__nowgg/$1/")
            .replace(/https?:\\\/\\\/([a-z0-9-]+(?:\.[a-z0-9-]+)*\.now\.gg)\\\/\//gi, function (m, h) { return isDirectHost(h) ? m : "\\/__nowgg\\/" + h + "\\/"; })
            .replace(/wss?:\\\/\\\/([a-z0-9-]+(?:\.[a-z0-9-]+)*\.now\.gg)\\\/\//gi, "\\/__nowgg\\/$1\\/")
            .replace(/https?%3A%2F%2F([a-z0-9-]+(?:\.[a-z0-9-]+)*\.now\.gg)%2F/gi, function (m, h) { return isDirectHost(h) ? m : "/__nowgg/" + h + "/"; });
        } catch (e2) {}

        if (out === "https://now.gg" || out === "http://now.gg") out = "/";
        else if (out === "https://www.now.gg" || out === "http://www.now.gg") out = "/";
      } catch (e) {}
      return out;
    };

    var forceProxy = function (u) {
      if (typeof u !== "string" || !u) return u;
      if (/^https?:\/\/(www\.)?now\.gg(\/|$)/i.test(u)) {
        try { console.warn("[ngg] forced proxy rewrite:", u.slice(0, 120)); } catch (e) {}
        return u.replace(/^https?:\/\/(www\.)?now\.gg/i, "");
      }
      
      if (/^https?:\/\/(cdn\.now\.gg|cms-cdn\.now\.gg)\//i.test(u)) return u;
      if (/^https?:\/\/[^\/]*bugpilot\.now\.gg\//i.test(u)) return REAL_ORIGIN + "/__noop/" + u.replace(/^https?:\/\/[^\/]*bugpilot\.now\.gg\//i, "");
      var mSub = u.match(/^https?:\/\/([a-z0-9-]+(?:\.[a-z0-9-]+)*\.now\.gg)(\/.*)?$/i);
      if (mSub) {
        if (isDirectHost(mSub[1])) return u;
        return "/__nowgg/" + mSub[1].toLowerCase() + (mSub[2] || "/");
      }
      var mWss = u.match(/^wss?:\/\/([a-z0-9-]+(?:\.[a-z0-9-]+)*\.now\.gg)(\/.*)?$/i);
      if (mWss) return "/__nowgg/" + mWss[1].toLowerCase() + (mWss[2] || "/");
      return u;
    };
    var PROXY_ORIGIN = REAL_ORIGIN;
    var UPSTREAM_ORIGIN = "https://now.gg";
    var ENC_PROXY_ORIGIN = encodeURIComponent(PROXY_ORIGIN);
    var ENC_UPSTREAM_ORIGIN = encodeURIComponent(UPSTREAM_ORIGIN);
    var fixOriginLeak = function (s) {
      if (typeof s !== "string" || !s) return s;
      var out = s;

      var hasLeak = out.indexOf(PROXY_ORIGIN) !== -1 || out.indexOf(ENC_PROXY_ORIGIN) !== -1 ||
        out.indexOf("localhost") !== -1 || out.indexOf("127.0.0.1") !== -1;
      if (!hasLeak) return out;
      out = out.split(PROXY_ORIGIN).join(UPSTREAM_ORIGIN)
              .split(ENC_PROXY_ORIGIN).join(ENC_UPSTREAM_ORIGIN);

      try {
        out = out
          .replace(/https?%3A%2F%2Flocalhost(%3A\d+)?/gi, "https%3A%2F%2Fnow.gg")
          .replace(/wss?%3A%2F%2Flocalhost(%3A\d+)?/gi, "wss%3A%2F%2Fnow.gg")
          .replace(/https?:\/\/localhost(:\d+)?/gi, UPSTREAM_ORIGIN)
          .replace(/wss?:\/\/localhost(:\d+)?/gi, "wss://now.gg")
          .replace(/https?:\/\/127\.0\.0\.1(:\d+)?/gi, UPSTREAM_ORIGIN)
          .replace(/wss?:\/\/127\.0\.0\.1(:\d+)?/gi, "wss://now.gg")
          .replace(/localhost(:\d+)?/gi, "now.gg")
          .replace(/127\.0\.0\.1(:\d+)?/g, "now.gg");
      } catch (e) {}
      
      
      try {
        out = out.split(UPSTREAM_ORIGIN + "/play/apps/").join(UPSTREAM_ORIGIN + "/apps/");
      } catch (e) {}
      return out;
    };
    var scrubUrl = function (u) {
      if (typeof u !== "string" || !u) return u;
      if (u.indexOf(PROXY_ORIGIN) === 0) return PROXY_ORIGIN + fixOriginLeak(u.slice(PROXY_ORIGIN.length));
      return fixOriginLeak(u);
    };
    var fixHeaders = function (headers) {
      try {
        if (!headers) return headers;

        if (typeof Headers !== "undefined" && headers instanceof Headers) {
          ["origin", "referer", "referrer", "host", "x-forwarded-for", "x-real-ip", "forwarded", "via"].forEach(function (hk) {
            try {
              var v = headers.get(hk);
              if (typeof v === "string" && (v.indexOf("localhost") !== -1 || v.indexOf("127.0.0.1") !== -1 || (PROXY_ORIGIN && v.indexOf(PROXY_ORIGIN) !== -1))) {
                headers.set(hk, fixOriginLeak(v));
              }
            } catch (e) {}
          });

          try { headers.set("origin", UPSTREAM_ORIGIN); } catch (e) {}
          return headers;
        }

        if (typeof headers === "object" && !Array.isArray(headers)) {
          var copy = null;
          for (var k in headers) {
            var lk = String(k).toLowerCase();
            if (lk === "origin" || lk === "referer" || lk === "referrer" || lk === "host") {
              if (!copy) { copy = {}; for (var k2 in headers) copy[k2] = headers[k2]; }
              copy[k] = fixOriginLeak(String(headers[k]));
              if (lk === "origin" && /localhost|127\.0\.0\.1/i.test(copy[k])) copy[k] = UPSTREAM_ORIGIN;
              if ((lk === "referer" || lk === "referrer") && /localhost|127\.0\.0\.1/i.test(copy[k])) {
                try {
                  var __pp = window.location.pathname || "/";
                  if (__pp === "/play" || __pp.indexOf("/play/") === 0) __pp = __pp.slice("/play".length) || "/";
                  copy[k] = UPSTREAM_ORIGIN + __pp + (window.location.search || "");
                } catch (e) { copy[k] = UPSTREAM_ORIGIN + "/"; }
              }
            }
          }
          return copy || headers;
        }

        if (Array.isArray(headers)) {
          return headers.map(function (p) {
            try {
              var hk = String(p[0]).toLowerCase();
              if (hk === "origin" || hk === "referer" || hk === "referrer") return [p[0], fixOriginLeak(String(p[1]))];
            } catch (e) {}
            return p;
          });
        }
      } catch (e) {}
      return headers;
    };
    var fixBody = function (init) {
      try {
        if (init) {
          var changed = false;
          var copy = null;
          var ensureCopy = function () { if (!copy) { copy = {}; for (var k in init) copy[k] = init[k]; } };
          if (typeof init.body === "string") {
            var nb = fixOriginLeak(init.body);
            if (nb !== init.body) { ensureCopy(); copy.body = nb; changed = true; }
          }
          if (init.headers) {
            var nh = fixHeaders(init.headers);
            if (nh !== init.headers) { ensureCopy(); copy.headers = nh; changed = true; }
          }
          if (changed) return copy;
        }
      } catch (e) {}
      return init;
    };
    try {
      var origFetch = window.fetch;
      
      
      
      
      var __nggIsAuthUrl = function (u) {
        return typeof u === "string" && u.indexOf("createPlayUser") !== -1;
      };
      var __nggShouldRetry = function (resp) {
        try {
          if (!resp) return true;
          return resp.status === 429 || resp.status >= 500;
        } catch (e) { return false; }
      };
      var __nggFetchRetry = function (self, url, init, attempt) {
        var p = null;
        try {
          p = origFetch.call(self, url, init);
        } catch (e) {
          return Promise.reject(e);
        }
        return p.then(function (resp) {
          try {
            if (__nggShouldRetry(resp) && attempt < 2) {
              return new Promise(function (resolve) {
                setTimeout(function () {
                  try { if (resp.body && resp.body.cancel) resp.body.cancel(); } catch (e0) {}
                  try { resolve(__nggFetchRetry(self, url, init, attempt + 1)); } catch (e1) { resolve(resp); }
                }, 1000);
              });
            }
          } catch (e) {}
          return resp;
        });
      };
      
      
      
      
      var __nggPutokEmpty = function (url, init, reqObj) {
        try {
          if (typeof url !== "string" || url.indexOf("createPlayUser") === -1) return false;
          var get = function (headers) {
            if (!headers) return "";
            if (typeof Headers !== "undefined" && headers instanceof Headers) {
              return headers.get("x-ngg-playuser-token") || "";
            }
            if (Object.prototype.toString.call(headers) === "[object Array]") {
              for (var i = 0; i < headers.length; i++) {
                try {
                  if (String(headers[i][0]).toLowerCase() === "x-ngg-playuser-token") return headers[i][1] || "";
                } catch (e) {}
              }
              return "";
            }
            if (typeof headers === "object") {
              for (var k in headers) {
                try {
                  if (String(k).toLowerCase() === "x-ngg-playuser-token") return headers[k] || "";
                } catch (e) {}
              }
              return "";
            }
            return "";
          };
          var v = "";
          try { if (reqObj && reqObj.headers) v = get(reqObj.headers); } catch (e) {}
          try { if (!v && init && init.headers) v = get(init.headers); } catch (e) {}
          return !v;
        } catch (e) { return false; }
      };
      
      var __nggWatchAuth = function (promise, emptyTok) {
        try {
          return promise.then(function (resp) {
            try {
              if (window.__sealNoteAuthResult) {
                window.__sealNoteAuthResult(!(resp && (resp.status === 401 || resp.status === 403)), emptyTok);
              }
            } catch (e) {}
            return resp;
          }, function (err) { throw err; });
        } catch (e) { return promise; }
      };
      if (origFetch) {
        window.fetch = function (input, init) {
          try {
            if (init && init.headers) init = fixBody(init) || init;
            else if (init && typeof init.body === "string") init = fixBody(init) || init;
            var urlStr = "";
            try {
              urlStr = (typeof input === "string") ? input : ((input && (input.url || input.href)) || "");
              if (typeof urlStr !== "string") urlStr = "";
            } catch (e) { urlStr = ""; }
            if (typeof input === "string") {
              var sOut = forceProxy(scrubUrl(rewriteUrl(input)));
              if (sOut !== input) ngglog("fetch string", input.slice(0, 90), "->", sOut.slice(0, 90));
              if (/^https?:\/\/([^\/]*\.)?now\.gg\//i.test(sOut)) {
                try { console.warn("[ngg-leak] direct now.gg fetch blocked from going direct:", sOut.slice(0, 140)); } catch (e) {}
                sOut = forceProxy(sOut);
              }
              var sInit = withPrefix(sOut, fixBody(init));
              if (__nggIsAuthUrl(sOut)) return __nggWatchAuth(__nggFetchRetry(this, sOut, sInit, 1), __nggPutokEmpty(sOut, sInit, null));
              return origFetch.call(this, sOut, sInit);
            }
            if ((typeof URL !== "undefined" && input instanceof URL) ||
                (input && typeof input.href === "string" && typeof input.url !== "string")) {
              var href = (typeof input.toString === "function") ? input.toString() : input.href;
              var hOut = forceProxy(scrubUrl(rewriteUrl(href)));
              if (hOut !== href) ngglog("fetch URL-obj", href.slice(0, 90), "->", hOut.slice(0, 90));
              var hInit = withPrefix(hOut, fixBody(init));
              if (__nggIsAuthUrl(hOut)) return __nggWatchAuth(__nggFetchRetry(this, hOut, hInit, 1), __nggPutokEmpty(hOut, hInit, null));
              return origFetch.call(this, hOut, hInit);
            }
            if (input && typeof input.url === "string") {
              var cur = input.url;
              var fixed = forceProxy(scrubUrl(rewriteUrl(cur)));

              if (init !== undefined || (input && fixed !== cur)) {
                try {
                  var base = fixed !== cur ? new Request(fixed, input) : input;
                  var useInit = init === undefined ? withPrefix(fixed, {}) : withPrefix(fixed, fixBody(init));
                  input = (useInit === undefined && fixed !== cur) ? base : new Request(base, useInit);
                  init = undefined;
                  if (fixed !== cur) ngglog("fetch Request", cur.slice(0, 90), "->", fixed.slice(0, 90));
                  try {
                    var finalUrl = (input && input.url) || fixed || cur;
                    if (__nggIsAuthUrl(finalUrl)) return __nggWatchAuth(__nggFetchRetry(this, input, init, 1), __nggPutokEmpty(finalUrl, null, input));
                  } catch (e) {}
                  return origFetch.call(this, input, init);
                } catch (e) { ngglog("Request rebuild failed", String(e).slice(0, 120)); }
              } else {
                try {
                  if (__nggIsAuthUrl(cur)) return __nggWatchAuth(__nggFetchRetry(this, input, init, 1), __nggPutokEmpty(cur, init, input));
                } catch (e) {}
              }
            }
          } catch (e) {}
          return origFetch.call(this, input, init);
        };
      }

      try {
        var OrigRequest = window.Request;
        if (OrigRequest) {
          window.Request = function (input, init) {
            try {
              if (typeof input === "string") input = forceProxy(scrubUrl(rewriteUrl(input)));
              else if (input && typeof input.url === "string") {
                var u0 = input.url;
                var u1 = forceProxy(scrubUrl(rewriteUrl(u0)));
                if (u1 !== u0) input = new OrigRequest(u1, input);
              }
              if (init) init = fixBody(init) || init;

              if (typeof input === "string" && /^https?:\/\/([^\/]*\.)?now\.gg\//i.test(input)) {
                input = forceProxy(input);
              }
            } catch (e) {}
            return new OrigRequest(input, init);
          };
          window.Request.prototype = OrigRequest.prototype;
        }
      } catch (e) {}
      try {
        if (navigator && typeof navigator.sendBeacon === "function") {
          var origBeacon = navigator.sendBeacon.bind(navigator);
          navigator.sendBeacon = function (url, data) {
            try {
              if (typeof url === "string") url = forceProxy(scrubUrl(rewriteUrl(url)));
              if (typeof data === "string") data = fixOriginLeak(data);
            } catch (e) {}
            return origBeacon(url, data);
          };
        }
      } catch (e) {}
      var origOpen = window.XMLHttpRequest && window.XMLHttpRequest.prototype.open;
      if (origOpen) {
        window.XMLHttpRequest.prototype.open = function (method, url) {
          try {
            if (typeof url === "string") arguments[1] = forceProxy(scrubUrl(rewriteUrl(url)));
            try {
              this.__nggPfx = "";
              var ou = String(arguments[1] || "");
              if (ou.indexOf("/oapi/") === 0 || ou.indexOf("/accounts/") === 0) {
                var pp = "";
                try { pp = sessionStorage.getItem("ngg_prefix") || ""; } catch (e) {}
                if (/^\d{1,3}$/.test(pp)) this.__nggPfx = pp;
              }
            } catch (e) {}
          } catch (e) {}
          return origOpen.apply(this, arguments);
        };
      }
      try {
        var origSend = window.XMLHttpRequest && window.XMLHttpRequest.prototype.send;
        if (origSend) {
          window.XMLHttpRequest.prototype.send = function (body) {
            try { if (this.__nggPfx) this.setRequestHeader("x-ngg-prefix", this.__nggPfx); } catch (e) {}
            try { if (typeof body === "string") arguments[0] = fixOriginLeak(body); } catch (e) {}
            return origSend.apply(this, arguments);
          };
        }
      } catch (e) {}
      var wsScheme = function () { return REAL.protocol === "https:" ? "wss:" : "ws:"; };
      var rewriteWs = function (u) {
        if (typeof u !== "string") return u;
        if (u.indexOf("wss://cdn.now.gg/") === 0) return wsScheme() + "//" + REAL.host + "/__cdn/" + u.slice("wss://cdn.now.gg/".length);
        if (u.indexOf("ws://cdn.now.gg/") === 0) return wsScheme() + "//" + REAL.host + "/__cdn/" + u.slice("ws://cdn.now.gg/".length);
        if (/^wss?:\/\/(www\.)?now\.gg\//.test(u)) return wsScheme() + "//" + REAL.host + u.replace(/^wss?:\/\/(www\.)?now\.gg/, "");
        try {
          var mW = u.match(/^wss?:\/\/([a-z0-9-]+(?:\.[a-z0-9-]+)*\.now\.gg)(\/.*)?$/i);
          if (mW) return wsScheme() + "//" + REAL.host + "/__nowgg/" + mW[1].toLowerCase() + (mW[2] || "/");
        } catch (e) {}
        return u;
      };
      var OrigWS = window.WebSocket;
      if (OrigWS) {
        window.WebSocket = function (url, protocols) {
          try { url = rewriteWs(scrubUrl(url)); } catch (e) {}
          return protocols === undefined ? new OrigWS(url) : new OrigWS(url, protocols);
        };
        window.WebSocket.prototype = OrigWS.prototype;

        try {
          var origWsSend = OrigWS.prototype.send;
          window.WebSocket.prototype.send = function (data) {
            try { if (typeof data === "string") arguments[0] = fixOriginLeak(data); } catch (e) {}
            return origWsSend.apply(this, arguments);
          };
        } catch (e) {}
      }
      var OrigES = window.EventSource;
      if (OrigES) {
        window.EventSource = function (url, init) {
          try { if (typeof url === "string") url = forceProxy(scrubUrl(rewriteUrl(url))); } catch (e) {}
          return new OrigES(url, init);
        };
        window.EventSource.prototype = OrigES.prototype;
      }

      try {
        var patchFrame = function (w) {
          try {
            if (!w || w.__nggFetchShim) return;

            w.__nggFetchShim = 1;
            var of = w.fetch;
            if (of) {
              w.fetch = function (input, init) {
                try {
                  if (typeof input === "string") input = forceProxy(scrubUrl(rewriteUrl(input)));
                } catch (e) {}
                return of.apply(this, arguments);
              };
            }
            if (w.XMLHttpRequest && w.XMLHttpRequest.prototype.open) {
              var oo = w.XMLHttpRequest.prototype.open;
              w.XMLHttpRequest.prototype.open = function (m, u) {
                try { if (typeof u === "string") arguments[1] = forceProxy(scrubUrl(rewriteUrl(u))); } catch (e) {}
                return oo.apply(this, arguments);
              };
            }
          } catch (e) {}
        };
        var scanFrames = function () {
          try {
            for (var i = 0; i < window.frames.length; i++) {
              try { patchFrame(window.frames[i]); } catch (e) {}
            }
            document.querySelectorAll("iframe").forEach(function (f) {
              try { if (f.contentWindow) patchFrame(f.contentWindow); } catch (e) {}
            });
          } catch (e) {}
        };
        setInterval(scanFrames, 2000);
        try {
          var OrigWorker = window.Worker;
          if (OrigWorker) {
            window.Worker = function (scriptURL, opts) {
              try {
                if (typeof scriptURL === "string") scriptURL = forceProxy(scrubUrl(rewriteUrl(scriptURL)));
              } catch (e) {}
              return new OrigWorker(scriptURL, opts);
            };
            window.Worker.prototype = OrigWorker.prototype;
          }
        } catch (e) {}
      } catch (e) {}
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

    var __gameOn = false;
    var __gameCheckAt = 0;
    var __gameActive = function () {
      try {
        var now = Date.now();
        if (now - __gameCheckAt < 5000) return __gameOn;
        __gameCheckAt = now;
        try { if (window.__nggGameRunning) { __gameOn = true; return true; } } catch (e) {}

        var on = false;
        try {
          var c = document.querySelector("canvas");
          if (c && (c.clientWidth > 400 || c.width > 400)) on = true;
          else {
            var v = document.querySelector("video.preloader-video");
            if (!v) {
              var big = document.querySelector("canvas,video");
              if (big && (big.clientWidth > 400 || big.videoWidth > 400)) on = true;
            }
          }
        } catch (e) {}
        __gameOn = on;
        return on;
      } catch (e) { return false; }
    };
    var hidden = new Map();
    var scan = setInterval(function () {
      try { if (document.hidden || __gameActive()) return; } catch (e) {}
      var all = document.querySelectorAll("span,div,p,time,b,strong,label,h1,h2,h3");

      var n = all.length > 400 ? 400 : all.length;
      for (var i = 0; i < n; i++) {
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

        if (hidden.size > 500) { try { hidden.clear(); } catch (e) {} break; }
      }
    }, 1500);
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
    popupCss.textContent = ".sc-f453a444-1{display:none!important}.sc-f453a444-2{display:none!important}.sc-5778dd3f-10{display:none!important}.sc-4e159119-0{display:none!important}.sc-99639c35-0{display:none!important}";
    (document.head || document.documentElement).appendChild(popupCss);
    var hideMoreTime = function () {
      try { if (document.hidden || __gameActive()) return; } catch (e) {}
      var all = document.querySelectorAll("button,[role=button],a,span,div");
      var n = all.length > 400 ? 400 : all.length;
      for (var i = 0; i < n; i++) {
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
    setInterval(hideMoreTime, 4000);
  })();
})();
(function () {
  
  
  
  
  
  
  if (window.__sealAuthWatch) return; window.__sealAuthWatch = 1;
  var fails = 0;
  var RESET_COOKIE = "__seal_reset";
  function getReset() {
    try {
      var m = String(document.cookie || "").match(/(?:^|;\s*)__seal_reset=(\d+)\.(\d+)/);
      if (m) return { n: parseInt(m[1], 10) || 0, t: parseInt(m[2], 10) || 0 };
    } catch (e) {}
    return { n: 0, t: 0 };
  }
  function setReset(n, t) {
    try { document.cookie = RESET_COOKIE + "=" + n + "." + t + "; Path=/; Max-Age=600"; } catch (e) {}
  }
  function overlay(text, stuck) {
    try {
      if (document.querySelector("[data-seal-authreset]")) return;
      var d = document.createElement("div");
      d.setAttribute("data-seal-authreset", stuck ? "stuck" : "1");
      d.textContent = text;
      d.style.cssText = "position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,.85);color:#fff;display:flex;justify-content:center;align-items:center;text-align:center;padding:24px;font:600 20px system-ui,sans-serif;z-index:2147483647;";
      (document.body || document.documentElement).appendChild(d);
    } catch (e) {}
  }
  function resetSession() {
    try {
      var now = Date.now();
      var rc = getReset();
      if (now - (rc.t || 0) > 600000) rc = { n: 0, t: now };
      
      
      if (rc.n >= 1) {
        overlay("session failed. please wait a sec and try again.", true);
        return;
      }
      setReset(rc.n + 1, rc.t || now);
      overlay("refreshing session…");
      try { localStorage.clear(); } catch (e) {}
      try { sessionStorage.clear(); } catch (e) {}
      
      
      
      
      
      
      
      
      try {
        String(document.cookie || "").split(";").forEach(function (c) {
          var k = c.split("=")[0].replace(/^\s+|\s+$/g, "");
          if (!k || k === RESET_COOKIE) return;
          
          
          var drop = (k === "__ngg_sid") || (k.indexOf("__seal_") === 0);
          if (drop) {
            try { document.cookie = k + "=; Path=/; Max-Age=0"; } catch (e) {}
          }
        });
      } catch (e) {}
      
      
      
      try {
        if (typeof fetch === "function") {
          fetch("/__session_reset", { cache: "no-store" }).then(function () {}, function () {});
        }
      } catch (e) {}
      setTimeout(function () { try { window.location.reload(); } catch (e) {} }, 1200);
    } catch (e) {}
  }
  window.__sealNoteAuthResult = function (ok, emptyToken) {
    try {
      
      
      
      if (ok) { fails = 0; return; }
      if (!emptyToken) return; 
      fails++;
      if (fails >= 2) { fails = 0; resetSession(); }
    } catch (e) {}
  };
  try {
    window.__sealAuthWatchApi = {
      note: function (ok, empty) { window.__sealNoteAuthResult(ok, empty); },
      getReset: getReset, setReset: setReset,
      fails: function () { return fails; }
    };
  } catch (e) {}
})();
