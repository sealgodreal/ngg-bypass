const express = require("express");
const fs = require("fs");
const path = require("path");

const UPSTREAM = "https://now.gg";
const ROBLOX_PATH = "/apps/a/19900/b.html";
const PORT = process.env.PORT || 4000;

const HEAD_JS = fs.readFileSync(path.join(__dirname, "inject", "head.js"), "utf8");
const TAIL_JS = fs.readFileSync(path.join(__dirname, "inject", "tail.js"), "utf8");
const INIT_HTML = fs.readFileSync(path.join(__dirname, "inject", "init.html"), "utf8");
const LANDING_HTML = fs.readFileSync(path.join(__dirname, "inject", "landing.html"), "utf8");

const app = express();
app.set("trust proxy", 1);
app.use(express.raw({ type: "*/*", limit: "10mb" }));

const HOP_BY_HOP = new Set([
  "connection", "keep-alive", "proxy-authenticate", "proxy-authorization",
  "te", "trailer", "transfer-encoding", "upgrade", "host", "content-length",
]);
const PROXY_SIGNAL_HEADERS = new Set([
  "x-forwarded-for", "x-forwarded-host", "x-forwarded-proto", "x-forwarded-server",
  "x-real-ip", "forwarded", "via", "true-client-ip", "x-proxy-id", "x-proxyuser-ip",
  "cf-connecting-ip", "cf-ipcountry", "cf-ray", "cf-visitor", "cdn-loop",
  
  
  "x-ngg-prefix",
]);
const STRIP_RES = new Set([
  "content-security-policy", "content-security-policy-report-only",
  "x-frame-options", "report-to", "nel", "content-encoding", "content-length",
  
  
  
  
  "transfer-encoding", "connection",
]);






const JAR = new Map(); 
function parseCookieHeader(h) {
  const m = new Map();
  for (const part of String(h || "").split(";")) {
    const i = part.indexOf("=");
    if (i <= 0) continue;
    const k = part.slice(0, i).trim();
    const v = part.slice(i + 1).trim();
    if (k) m.set(k, v);
  }
  return m;
}
function parseSetCookieNameValue(sc) {
  const first = String(sc || "").split(";")[0] || "";
  const i = first.indexOf("=");
  if (i <= 0) return null;
  const k = first.slice(0, i).trim();
  const v = first.slice(i + 1).trim();
  if (!k) return null;
  return [k, v];
}
function isSetCookieDeleted(sc) {
  return /(?:^|;)\s*(?:expires\s*=\s*thu,\s*01-?jan-?1970|max-age\s*=\s*0)(?:\s*;|$)/i.test(String(sc || ""));
}
function getSid(req) {
  try {
    const m = parseCookieHeader(req.headers.cookie || "");
    const sid = m.get("__ngg_sid") || "";
    if (/^[a-f0-9]{16}$/.test(sid)) return sid;
  } catch (e) {}
  return null;
}
function newSid() {
  try {
    return require("crypto").randomBytes(8).toString("hex");
  } catch (e) {
    return Math.random().toString(16).slice(2, 10) + Math.random().toString(16).slice(2, 10);
  }
}





function fixNestedImageUrl(originalUrl) {
  let out = String(originalUrl || "");
  out = out
    .replace(/([?&]url=)\/__nowgg\/([^\/&?]+)\//gi, "$1https%3A%2F%2F$2%2F")
    .replace(/([?&]url=)\/__cdn\//gi, "$1https%3A%2F%2Fcdn.now.gg%2F")
    .replace(/([?&]url=)%2F__nowgg%2F([^\/&?]+)%2F/gi, "$1https%3A%2F%2F$2%2F")
    .replace(/([?&]url=)%2F__cdn%2F/gi, "$1https%3A%2F%2Fcdn.now.gg%2F");
  return out;
}

function upstreamUrl(req) {
  return UPSTREAM + req.originalUrl;
}

function proxyOrigin(req) {
  const proto = String(req.headers["x-forwarded-proto"] || req.protocol || "http").split(",")[0].trim();
  return proto + "://" + req.get("host");
}



function isPlayHost(req) {
  try {
    const h = String(req.get("host") || "").split(":")[0].trim().toLowerCase();
    return h === "play" || h.indexOf("play.") === 0;
  } catch (e) {
    return false;
  }
}

function isHttpsReq(req) {
  return String(req.headers["x-forwarded-proto"] || req.protocol || "http").split(",")[0].trim() === "https";
}







function publicClientIp(req) {
  try {
    let ip = "";
    try { ip = String((req.socket && req.socket.remoteAddress) || ""); } catch (e) {}
    if (!ip || ip.indexOf(":") !== -1) {
      const m = String(ip || "").match(/(\d+\.\d+\.\d+\.\d+)\s*$/);
      ip = m ? m[1] : "";
    }
    if (!/^\d+\.\d+\.\d+\.\d+$/.test(ip)) return "";
    if (/^(127\.|10\.|172\.(1[6-9]|2\d|3[01])\.|192\.168\.|0\.0\.0\.0)/.test(ip)) return "";
    return ip;
  } catch (e) {
    return "";
  }
}






function nggPrefix(req) {
  try {
    let host = "";
    try { host = String((req.get && req.get("host")) || ""); } catch (e) {}
    if (!host) { try { host = String(req.headers.host || ""); } catch (e) {} }
    host = host.split(":")[0].trim().toLowerCase();
    const m = host.match(/^(\d{1,3})\.ip\./);
    if (m) return m[1];
  } catch (e) {}
  try {
    const q = (req.query && (req.query.prefix || req.query.ngg_prefix)) || "";
    if (/^\d{1,3}$/.test(String(q))) return String(q);
  } catch (e) {}
  try {
    const hh = String(req.headers["x-ngg-prefix"] || "").trim();
    if (/^\d{1,3}$/.test(hh)) return hh;
  } catch (e) {}
  return "";
}





function stripInternalParams(url) {
  try {
    const u = new URL(String(url), "http://internal");
    u.searchParams.delete("prefix");
    u.searchParams.delete("ngg_prefix");
    return u.pathname + (u.search || "") + (u.hash || "") || "/";
  } catch (e) {
    return url;
  }
}

function buildUpstreamHeaders(req, hostOverride) {
  const h = {};
  for (const [k, v] of Object.entries(req.headers)) {
    const lk = k.toLowerCase();
    if (HOP_BY_HOP.has(lk)) continue;
    if (PROXY_SIGNAL_HEADERS.has(lk)) continue;
    if (lk.startsWith("proxy-")) continue;
    
    
    
    
    h[k] = v;
  }
  const porig = proxyOrigin(req);

  if (req.headers.origin) {
    h["origin"] = String(req.headers.origin).split(porig).join(UPSTREAM);

    if (/localhost|127\.0\.0\.1|0\.0\.0\.0|\[::1\]|192\.168\.|10\.\d+\./i.test(h["origin"])) {
      h["origin"] = UPSTREAM;
    }
  } else if (!["GET", "HEAD"].includes(req.method)) {
    h["origin"] = UPSTREAM;
  } else {
    delete h["origin"];
    delete h["Origin"];
  }
  if (req.headers.referer) {
    h["referer"] = String(req.headers.referer).split(porig).join(UPSTREAM)
      .split(UPSTREAM + "/play/apps/").join(UPSTREAM + "/apps/");
    if (/localhost|127\.0\.0\.1/i.test(h["referer"])) {
      h["referer"] = fallbackReferer(req);
    }
  } else {
    h["referer"] = fallbackReferer(req);
  }

  h["sec-fetch-site"] = req.headers["sec-fetch-site"] || "same-origin";
  h["sec-fetch-mode"] = req.headers["sec-fetch-mode"] || "cors";
  h["sec-fetch-dest"] = req.headers["sec-fetch-dest"] || "empty";
  if (req.headers.referer || req.headers.origin) {

  }
  
  
  try {
    const cip = publicClientIp(req);
    if (cip) h["x-forwarded-for"] = cip;
  } catch (e) {}
  h["host"] = hostOverride || "now.gg";
  if (!h["user-agent"]) h["user-agent"] = "Mozilla/5.0";
  return h;
}




function gamePathOf(p) {
  try {
    let q = String(p || "");
    if (q === "/play" || q.indexOf("/play/") === 0) q = q.slice("/play".length) || "/";
    const m = q.match(/^(\/apps\/[^\/]+\/\d+\/[^\/]+?\.html)/);
    return m ? m[1] : null;
  } catch (e) {
    return null;
  }
}

function fallbackReferer(req) {
  try {
    const g = gamePathOf(req.path);
    if (g) return UPSTREAM + g;
  } catch (e) {}
  return UPSTREAM + "/";
}

const BRAND_LOADING = "loading... | bypass by sealsarcade.xyz";
const BRAND_BAR = "bypass by sealsarcade.xyz";







const DIRECT_HOSTS = new Set(["cdn.now.gg", "cms-cdn.now.gg"]);
function isDirectHost(h) {
  try {
    return DIRECT_HOSTS.has(String(h || "").toLowerCase());
  } catch (e) {
    return false;
  }
}

function rewriteUpstreamUrls(out, origin) {
  
  
  
  
  
  
  
  const noopWithKey = (escaped, key) => {
    let base = (origin || "") + "/__noop/";
    if (escaped) base = base.replace(/\//g, "\\/");
    if (!key) return base;
    const sep = escaped ? ":\\/\\/" : "://";
    const i = base.indexOf(sep);
    if (i === -1) return base;
    return base.slice(0, i + sep.length) + key + base.slice(i + sep.length);
  };
  return out
    .replace(/("launchingGame":")((?:[^"\\]|\\.)*)(")/g, "$1" + BRAND_LOADING + "$3")

    
    
    
    
    .replace(/#ff42a5/gi, "#26262b")
    .replace(/#00ff9d/gi, "#26262b")

    
    
    
    
    
    
    .replace(/https?:\/\/([^\/\s"'\\@]+@)?[^\/\s"'\\]*bugpilot\.now\.gg\//gi, (m, key) => noopWithKey(false, key))
    .replace(/https?:\\\/\\\/([^\\\/\s"'@]+@)?[^\\\/\s"']*bugpilot\.now\.gg\\\//gi, (m, key) => noopWithKey(true, key))
    
    
    
    .replace(/https?:\/\/(?:www\.)?now\.gg(\/apps\/[^\/]+\/\d+\/[^\/]+\.html)/gi, "/play$1")
    .replace(/https?:\\\/\\\/(?:www\.)?now\.gg\\\/apps\\\/[^\\\/]+\\\/\d+\\\/[^\\\/]+\.html/gi, (m) => "\\/play" + m.slice(m.indexOf("\\/apps")))
    .replace(/wss?:\/\/cdn\.now\.gg\//gi, "/__cdn/")
    .replace(/wss?:\/\/bugpilot\.now\.gg\//gi, "/__noop/")
    .replace(/wss?:\/\/now\.gg\//gi, "/")
    .replace(/wss?:\/\/www\.now\.gg\//gi, "/")
    
    
    .replace(/wss?:\\\/\\\/cdn\.now\.gg\\\//gi, "\\/__cdn\\/")
    .replace(/wss?:\\\/\\\/now\.gg\\\//gi, "\\/")
    .replace(/wss?:\\\/\\\/www\.now\.gg\\\//gi, "\\/")
    .replace(/https?:\/\/now\.gg\//gi, "/")
    .replace(/https?:\/\/www\.now\.gg\//gi, "/")
    .replace(/https?:\\\/\\\/now\.gg\\\//gi, "\\/")
    .replace(/https?:\\\/\\\/www\.now\.gg\\\//gi, "\\/")
    
    
    
    .replace(/https?:\/\/([a-z0-9-]+(?:\.[a-z0-9-]+)*\.now\.gg)\//gi, (m, h) => (isDirectHost(h) ? m : "/__nowgg/" + h + "/"))
    .replace(/wss?:\/\/([a-z0-9-]+(?:\.[a-z0-9-]+)*\.now\.gg)\//gi, "/__nowgg/$1/")
    .replace(/https?:\\\/\\\/([a-z0-9-]+(?:\.[a-z0-9-]+)*\.now\.gg)\\\/\//gi, (m, h) => (isDirectHost(h) ? m : "\\/__nowgg\\/" + h + "\\/"))
    .replace(/wss?:\\\/\\\/([a-z0-9-]+(?:\.[a-z0-9-]+)*\.now\.gg)\\\/\//gi, "\\/__nowgg\\/$1\\/")
    .replace(/https?%3A%2F%2F([a-z0-9-]+(?:\.[a-z0-9-]+)*\.now\.gg)%2F/gi, (m, h) => (isDirectHost(h) ? m : "/__nowgg/" + h + "/"));
}

function rewriteHtml(html, req) {
  let out = html;
  const headTag = out.match(/<head[^>]*>/i);
  if (headTag) {
    out = out.replace(headTag[0], headTag[0] + `<script>${HEAD_JS}</script>`);
  } else {
    out = `<script>${HEAD_JS}</script>` + out;
  }
  out = rewriteUpstreamUrls(out, proxyOrigin(req));
  const tailTag = `<script>${TAIL_JS}</script>`;
  if (/<\/body\s*>/i.test(out)) {
    out = out.replace(/<\/body\s*>/i, tailTag + "</body>");
  } else {
    out = out + tailTag;
  }
  return out;
}

function rewriteCookieForClient(c, isHttps) {
  
  
  
  
  
  
  
  
  
  
  
  let out = String(c)
    .replace(/;\s*Domain=(?:[^\s;,]*\.)?now\.gg\s*(?=;|$)/gi, "")
    .replace(/;;+/g, ";")
    .replace(/;\s*;/g, ";");
  if (!isHttps && !/^\s*__Host-/i.test(out)) {
    out = out.replace(/;\s*Secure\s*(?=;|$)/gi, "");
  }
  return out.trim();
}

function copyStatusAndHeaders(upRes, res, req) {
  res.status(upRes.status);
  for (const [k, v] of upRes.headers.entries()) {
    if (STRIP_RES.has(k.toLowerCase())) continue;
    if (k.toLowerCase() === "location") {
      try {
        const loc = v;
        
        const m = loc.match(/^https?:\/\/([a-z0-9-]+(?:\.[a-z0-9-]+)*\.now\.gg)(\/.*)?$/i);
        if (m) {
          const h = m[1].toLowerCase();
          const p = m[2] || "/";
          if (h === "now.gg" || h === "www.now.gg") res.set("location", p);
          else if (h === "cdn.now.gg") res.set("location", "/__cdn" + p);
          else if (h === "bugpilot.now.gg") res.set("location", "/__noop" + p);
          else res.set("location", "/__nowgg/" + h + p);
        } else if (loc.startsWith(UPSTREAM + "/")) res.set("location", loc.slice(UPSTREAM.length));
        else if (loc.startsWith("https://now.gg/")) res.set("location", loc.slice("https://now.gg".length));
        else res.set("location", loc);
      } catch { res.set("location", v); }
      continue;
    }
    if (k.toLowerCase() === "set-cookie") continue;
    res.set(k, v);
  }
  const rawCookies = typeof upRes.headers.getSetCookie === "function"
    ? upRes.headers.getSetCookie()
    : null;
  const https = isHttpsReq(req);
  if (rawCookies && rawCookies.length) {
    res.set("set-cookie", rawCookies.map((c) => rewriteCookieForClient(c, https)));
  } else {
    const single = upRes.headers.get("set-cookie");
    if (single) res.set("set-cookie", rewriteCookieForClient(single, https));
  }
  res.set("x-proxied-by", "nowgg-proxy");
  const origin = req.headers.origin;
  if (origin) {
    res.set("access-control-allow-origin", origin);
    res.set("access-control-allow-credentials", "true");
    res.set("vary", "Origin");
  }
}

app.get("/", (_req, res) => {
  res.set("cache-control", "no-store").type("html").send(LANDING_HTML);
});

app.get("/ip", (req, res) => res.type("text").send((req.ip || "").replace(/^.*:/, "") || "127.0.0.1"));
app.get("/health", (_req, res) => res.json({ ok: true, upstream: UPSTREAM, roblox: ROBLOX_PATH }));



app.get("/__ngg_debug", (req, res) => {
  try {
    const browser = [...parseCookieHeader(req.headers.cookie || "").keys()];
    const sid = getSid(req);
    const pfx = nggPrefix(req);
    const jar = (sid && JAR.get((pfx ? pfx + "|" : "") + sid)) || new Map();
    res.json({
      ok: true,
      sid: sid || null,
      prefix: pfx || null,
      contexts: JAR.size,
      browserCookieNames: browser,
      jarCookieNames: [...jar.keys()],
    });
  } catch (e) {
    res.status(500).json({ ok: false, error: String(e && e.message || e) });
  }
});

app.all("/__noop/*", (_req, res) => res.status(204).end());









app.get("/__session_reset", (req, res) => {
  try {
    const sid = getSid(req);
    const pfx = nggPrefix(req);
    const oldKey = sid ? (pfx ? pfx + "|" : "") + sid : null;
    if (oldKey) JAR.delete(oldKey);
    const fresh = newSid();
    if (JAR.size > 50) { try { JAR.delete(JAR.keys().next().value); } catch (e) {} }
    JAR.set((pfx ? pfx + "|" : "") + fresh, new Map());
    try {
      res.append("set-cookie", [
        "_NSID=; Path=/accounts/; Max-Age=0",
        "_NSID=; Path=/accounts/; Max-Age=0; Secure",
        "_NSID=; Path=/; Max-Age=0",
        "_NSID=; Path=/; Max-Age=0; Secure",
        `__ngg_sid=${fresh}; Path=/; SameSite=Lax; Max-Age=2592000`,
      ]);
    } catch (e) {}
    console.log(`[authreset] sid=${sid || "none"} -> fresh=${fresh}`);
  } catch (e) {}
  res.status(204).end();
});

app.get("/__loading.mp4", (_req, res) => {
  res.set("cache-control", "no-store");
  res.sendFile(path.join(__dirname, "inject", "loading.mp4"));
});

app.get("/icon.png", (_req, res) => {
  const candidates = [
    path.join(__dirname, "icon.png"),
    path.join(__dirname, "inject", "icon.png"),
  ];
  for (const p of candidates) {
    try {
      if (fs.existsSync(p)) {
        return res.set("cache-control", "no-store").type("png").send(fs.readFileSync(p));
      }
    } catch (e) {}
  }
  return res.status(404).end();
});



app.get("/logo/icon.png", (_req, res) => {
  res.set("cache-control", "public, max-age=3600").type("png")
    .sendFile(path.join(__dirname, "logo", "icon.png"));
});
app.get("/logo/title.svg", (_req, res) => {
  res.set("cache-control", "public, max-age=3600").type("svg")
    .sendFile(path.join(__dirname, "logo", "title.svg"));
});



app.use("/games/img", express.static(path.join(__dirname, "games", "img"), { maxAge: "7d", fallthrough: true }));

app.get(/^\/apps\/[^/]+\/\d+\/[^/]+\.html$/, (req, res, next) => {
  
  
  
  
  
  
  if (isPlayHost(req)) return next();
  if (req.query && String(req.query.ngg_init) === "1") return next();
  res.set("cache-control", "no-store").type("html").send(INIT_HTML);
});

app.options("*", (req, res) => {
  const origin = req.headers.origin || "*";
  res.set("access-control-allow-origin", origin);
  res.set("vary", "Origin");
  if (origin !== "*") res.set("access-control-allow-credentials", "true");
  res.set("access-control-allow-methods", "GET,POST,PUT,PATCH,DELETE,OPTIONS");
  res.set("access-control-allow-headers", req.headers["access-control-request-headers"] || "Content-Type, x-ngg-fe-version, x-ngg-playuser-token, x-ngg-skip-evar-check, Authorization");
  res.set("access-control-max-age", "86400");
  res.status(204).end();
});

app.use(async (req, res) => {
  if (req.path === "/favicon.ico") return res.status(204).end();
  
  
  
  
  
  let effPath = req.path;
  let effUrl = req.originalUrl;
  if (effPath === "/play" || effPath.startsWith("/play/")) {
    effPath = effPath.slice("/play".length) || "/";
    effUrl = effUrl.slice("/play".length);
    if (!effUrl.startsWith("/")) effUrl = "/" + effUrl;
  }
  effUrl = stripInternalParams(effUrl);
  let target = UPSTREAM + effUrl;
  let upstreamHost = "now.gg";
  if (effPath === "/__cdn" || effPath.startsWith("/__cdn/")) {
    let suffix = fixNestedImageUrl(effUrl).slice("/__cdn".length);
    suffix = suffix
      .replace(/%252F__cdn%252F/gi, "https%253A%252F%252Fcdn.now.gg%252F")
      .replace(/%2F__cdn%2F/gi, "https%3A%2F%2Fcdn.now.gg%2F");
    target = "https://cdn.now.gg" + suffix;
    upstreamHost = "cdn.now.gg";
  } else if (effPath === "/__nowgg" || effPath.startsWith("/__nowgg/")) {
    
    const rest = fixNestedImageUrl(effUrl).slice("/__nowgg".length); 
    const m = rest.match(/^\/([a-z0-9-]+(?:\.[a-z0-9-]+)*\.now\.gg)(\/.*)?$/i);
    if (m) {
      upstreamHost = m[1].toLowerCase();
      target = "https://" + upstreamHost + (m[2] || "/");
    } else {
      return res.status(400).type("text").send("bad __nowgg path");
    }
  }
  try {
    const hasBody = !["GET", "HEAD"].includes(req.method) && req.body && req.body.length;

    
    
    
    
    const pfx = nggPrefix(req);
    let sid = getSid(req);
    let isNewSid = false;
    if (!sid) {
      sid = newSid();
      isNewSid = true;
      if (JAR.size > 50) {
        try { JAR.delete(JAR.keys().next().value); } catch (e) {}
      }
    }
    const jarKey = (pfx ? pfx + "|" : "") + sid;
    if (!JAR.has(jarKey)) JAR.set(jarKey, new Map());
    const jar = JAR.get(jarKey);
    const isCreatePlayUser = req.path.indexOf("createPlayUser") !== -1;

    
    
    const browserMap = parseCookieHeader(req.headers.cookie || "");
    const merged = new Map(browserMap);
    let jarAdded = 0;
    const jarInjectedKeys = [];
    for (const [k, v] of jar) {
      if (k.indexOf("__seal_") === 0) continue;
      if (!merged.has(k)) {
        merged.set(k, v);
        jarAdded++;
        jarInjectedKeys.push(k);
      }
    }
    const mergedCookie = [...merged.entries()].map(([k, v]) => k + "=" + v).join("; ");

    
    
    
    
    
    let cpuUa = "";
    let putokNote = "";
    if (isCreatePlayUser && req.body && req.body.length) {
      try {
        const cbody = JSON.parse(Buffer.from(req.body).toString("utf8"));
        if (cbody && typeof cbody.uaId === "string" && cbody.uaId) {
          cpuUa = cbody.uaId;
          if (!String(req.headers["x-ngg-playuser-token"] || "")) {
            const hit = jar.get("__seal_putok:" + cpuUa);
            if (hit) {
              req.headers["x-ngg-playuser-token"] = hit;
              putokNote = "cached";
            }
          }
        }
      } catch (e) {}
    }

    const outHeaders = buildUpstreamHeaders(req, upstreamHost);
    if (mergedCookie) outHeaders["cookie"] = mergedCookie;
    else delete outHeaders["cookie"];

    const ctrl = new AbortController();
    const t = setTimeout(() => { try { ctrl.abort(); } catch (e) {} }, 30000);
    let upRes;
    try {
      upRes = await fetch(target, {
        method: req.method,
        headers: outHeaders,
        body: hasBody ? req.body : undefined,
        redirect: "manual",
        signal: ctrl.signal,
      });
    } finally {
      try { clearTimeout(t); } catch (e) {}
    }

    
    
    
    
    
    
    
    
    
    try {
      if ((upRes.status === 401 || upRes.status === 403) && jarInjectedKeys.length && !isCreatePlayUser) {
        for (const k of jarInjectedKeys) jar.delete(k);
      }
    } catch (e) {}

    
    
    
    if (isCreatePlayUser && cpuUa) {
      if (upRes.status === 200 && upRes.clone) {
        try {
          upRes.clone().json().then((j) => {
            try {
              const tok = j && typeof j.playUserToken === "string" ? j.playUserToken : "";
              if (tok.length > 20) {
                jar.set("__seal_putok:" + cpuUa, tok);
                try {
                  let n = 0;
                  for (const k of jar.keys()) if (k.indexOf("__seal_putok:") === 0) n++;
                  if (n > 20) {
                    for (const k of jar.keys()) {
                      if (k.indexOf("__seal_putok:") === 0) { jar.delete(k); break; }
                    }
                  }
                } catch (e) {}
              }
            } catch (e) {}
          }).catch(() => {});
        } catch (e) {}
      } else if (putokNote === "cached" && (upRes.status === 401 || upRes.status === 403)) {
        try { jar.delete("__seal_putok:" + cpuUa); } catch (e) {}
      }
    }

    
    let setNames = [];
    try {
      const rawSC = typeof upRes.headers.getSetCookie === "function"
        ? upRes.headers.getSetCookie()
        : (upRes.headers.get("set-cookie") ? [upRes.headers.get("set-cookie")] : []);
      for (const sc of rawSC) {
        const nv = parseSetCookieNameValue(sc);
        if (!nv) continue;
        setNames.push(nv[0]);
        if (isSetCookieDeleted(sc)) jar.delete(nv[0]);
        else jar.set(nv[0], nv[1]);
      }
    } catch (e) {}

    copyStatusAndHeaders(upRes, res, req);
    if (isNewSid) {
      try { res.append("set-cookie", `__ngg_sid=${sid}; Path=/; SameSite=Lax; Max-Age=2592000`); } catch (e) {}
    }
    const ctype = (upRes.headers.get("content-type") || "").toLowerCase();

    try {
      const isOapi = /\/(oapi|accounts)\//.test(req.path);
      if (isOapi) {
        const clone = upRes.clone ? upRes.clone() : null;
        const run = (t) => {
          try {
            const ckNames = [...browserMap.keys()].slice(0, 15).join(",");
            const authH = String(req.headers.authorization || "");
            const authInfo = authH ? (authH.split(" ")[0] + ":" + authH.length) : "no";
            let tokenInfo = "";
            try {
              if (req.path.indexOf("createPlayUser") !== -1) {
                const tok = String(req.headers["x-ngg-playuser-token"] || "");
                if (!tok) {
                  tokenInfo = " putok=no";
                } else {
                  const parts = tok.split(".");
                  try {
                    const payload = JSON.parse(Buffer.from(parts[1].replace(/-/g, "+").replace(/_/g, "/"), "base64").toString("utf8"));
                    const nowS = Math.floor(Date.now() / 1000);
                    tokenInfo = " putok=yes:" + tok.length +
                      " iat=" + (payload.iat || "?") +
                      " exp=" + (payload.exp || "?") +
                      " expired=" + (payload.exp ? (payload.exp < nowS) : "?");
                  } catch (e) {
                    tokenInfo = " putok=yes:" + tok.length + " (unparsable)";
                  }
                }
                if (putokNote) tokenInfo += " " + putokNote;
              }
            } catch (e) {}
            let reqBody = "";
            try {
              if (hasBody) reqBody = Buffer.from(req.body).toString("utf8").slice(0, 200);
            } catch (e) {}
            let hdrNames = "";
            try {
              if (req.path.indexOf("createPlayUser") !== -1) {
                hdrNames = " hdrs=[" + Object.keys(req.headers).map((k) => String(k).toLowerCase()).sort().join(",") + "]";
              }
            } catch (e) {}
            console.log(`[oapi ${upRes.status}] ${req.method} ${req.path} -> ${target.slice(0,140)} :: resp=${String(t).slice(0,300)} :: pfx=${pfx || "-"} browserCookies=[${ckNames}] jarAdded=${jarAdded} setCookies=[${setNames.slice(0,15).join(",")}] auth=${authInfo}${tokenInfo} reqBody=${reqBody}${hdrNames}`);
          } catch (e) {}
        };
        if (clone) clone.text().then(run).catch(() => {});
        else console.log(`[oapi ${upRes.status}] ${req.method} ${req.path} (no clone)`);
      }
    } catch (e) {}

    if (ctype.includes("text/html")) {
      const html = await upRes.text();
      const rewritten = rewriteHtml(html, req);
      res.set("content-type", "text/html; charset=utf-8");
      res.set("cache-control", "no-store");
      return res.send(rewritten);
    }
    if (ctype.includes("javascript") || ctype.includes("ecmascript") || ctype.includes("text/css")) {
      const text = await upRes.text();
      const rewritten = rewriteUpstreamUrls(text, proxyOrigin(req));
      res.set("cache-control", "no-store");
      return res.send(rewritten);
    }
    if (upRes.body) {
      const buf = Buffer.from(await upRes.arrayBuffer());
      if (!res.get("content-type") && upRes.headers.get("content-type"))
        res.set("content-type", upRes.headers.get("content-type"));
      return res.send(buf);
    }
    return res.end();
  } catch (e) {
    return res.status(502).type("text").send("upstream fetch failed: " + e.message);
  }
});

const httpServer = app.listen(PORT, "0.0.0.0", () => {
  console.log(`now.gg proxy running on: http://localhost:${PORT}`);
  console.log(`made by sealgod`);
});

httpServer.on("upgrade", (req, socket, head) => {
  let host = "now.gg";
  let targetPath = req.url || "/";
  if (targetPath === "/play" || targetPath.startsWith("/play/")) {
    targetPath = targetPath.slice("/play".length) || "/";
  }
  try { targetPath = stripInternalParams(targetPath); } catch (e) {}
  if (targetPath === "/__cdn" || targetPath.startsWith("/__cdn/")) {
    host = "cdn.now.gg";
    targetPath = targetPath.slice("/__cdn".length) || "/";
  } else if (targetPath === "/__nowgg" || targetPath.startsWith("/__nowgg/")) {
    const m = targetPath.match(/^\/__nowgg\/([a-z0-9-]+(?:\.[a-z0-9-]+)*\.now\.gg)(\/.*)?$/i);
    if (m && m[1].toLowerCase().endsWith(".now.gg")) {
      host = m[1].toLowerCase();
      targetPath = m[2] || "/";
    }
  }
  const fwd = {};
  for (const [k, v] of Object.entries(req.headers)) {
    const lk = k.toLowerCase();
    if (lk === "host" || lk === "origin" || lk === "referer") continue;
    if (PROXY_SIGNAL_HEADERS.has(lk)) continue;
    if (lk.startsWith("proxy-")) continue;
    

    if (lk === "connection" || lk === "upgrade" || lk === "keep-alive" || lk === "transfer-encoding") continue;
    fwd[k] = v;
  }
  const porig = proxyOrigin(req);
  let rawOrigin = req.headers.origin ? String(req.headers.origin) : "";
  let rawReferer = req.headers.referer ? String(req.headers.referer) : "";
  let cleanOrigin = rawOrigin ? rawOrigin.split(porig).join(UPSTREAM) : UPSTREAM;
  const upPath = String(req.url || "/").split("?")[0];
  const upGame = gamePathOf(upPath);
  let cleanReferer = rawReferer
    ? rawReferer.split(porig).join(UPSTREAM).split(UPSTREAM + "/play/apps/").join(UPSTREAM + "/apps/")
    : (UPSTREAM + (upGame || "/"));
  if (/localhost|127\.0\.0\.1/i.test(cleanOrigin)) cleanOrigin = UPSTREAM;
  if (/localhost|127\.0\.0\.1/i.test(cleanReferer)) cleanReferer = UPSTREAM + (upGame || "/");
  fwd["Origin"] = cleanOrigin;
  fwd["Referer"] = cleanReferer;
  fwd["Host"] = host;

  fwd["Connection"] = req.headers["connection"] || "Upgrade";
  fwd["Upgrade"] = req.headers["upgrade"] || "websocket";
  
  try {
    const cip = publicClientIp(req);
    if (cip) fwd["X-Forwarded-For"] = cip;
  } catch (e) {}

  fwd["Sec-Fetch-Site"] = "same-origin";
  if (!fwd["user-agent"] && !fwd["User-Agent"]) fwd["user-agent"] = "Mozilla/5.0";
  const tls = require("tls");
  const up = tls.connect(443, host, { servername: host });
  const kill = () => {
    try { socket.destroy(); } catch (e) {}
    try { up.destroy(); } catch (e) {}
  };
  up.on("error", kill);
  socket.on("error", kill);
  up.on("secureConnect", () => {
    const lines = [`GET ${targetPath} HTTP/1.1`];
    for (const [k, v] of Object.entries(fwd)) lines.push(`${k}: ${v}`);
    lines.push("", "");
    up.write(lines.join("\r\n"));
    if (head && head.length) up.write(head);
    socket.pipe(up);
    up.pipe(socket);
  });
});

module.exports = app;
