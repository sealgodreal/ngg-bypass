const express = require("express");
const fs = require("fs");
const path = require("path");

const UPSTREAM = "https://now.gg";
const ROBLOX_PATH = "/apps/a/19900/b.html";
const PORT = process.env.PORT || 3000;
const GUEST_UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36";

async function mintGuestSession() {
  try {
    const r = await fetch(UPSTREAM + "/accounts/auth/v2/access-token?implicitGuestLogin=true", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "User-Agent": GUEST_UA,
        Origin: UPSTREAM,
        Referer: UPSTREAM + ROBLOX_PATH,
      },
      body: "{}",
      signal: AbortSignal.timeout(8000),
    });
    if (!r.ok) {
      return null;
    }
    const j = await r.json();
    if (!j || !j.success || !j.access_token) {
      return null;
    }
    const setCookies = typeof r.headers.getSetCookie === "function" ? r.headers.getSetCookie() : [];
    const nsid = (setCookies.join(";").match(/_NSID=([^;]+)/) || [])[1] || "";
    return { access_token: j.access_token, access_token_expiry: j.access_token_expiry, nsid };
  } catch (e) {
    return null;
  }
}

function injectVend(html, vend) {
  const freshUaId = nggId("ua-");
  const freshUaSessionId = nggId("uasess-");
  const freshVisitId = nggId("visitid-");
  const seed = `<script>window.__nggVendedToken=${JSON.stringify({ access_token: vend.access_token, access_token_expiry: vend.access_token_expiry })};try{var _et=localStorage.getItem("ng_token_v2");if(_et){window.__nggVendedToken={access_token:_et,access_token_expiry:localStorage.getItem("ng_token_expiry_v2")};}else{localStorage.setItem("ng_token_v2",window.__nggVendedToken.access_token);localStorage.setItem("ng_token_expiry_v2",window.__nggVendedToken.access_token_expiry);}if(!localStorage.getItem("fe_uaId"))localStorage.setItem("fe_uaId",${JSON.stringify(freshUaId)});if(!sessionStorage.getItem("fe_uaSessionId"))sessionStorage.setItem("fe_uaSessionId",${JSON.stringify(freshUaSessionId)});if(!sessionStorage.getItem("ngVisitId"))sessionStorage.setItem("ngVisitId",${JSON.stringify(freshVisitId)});}catch(e){}</script>`;
  if (/<head[^>]*>/i.test(html)) return html.replace(/<head[^>]*>/i, (m) => m + seed);
  return seed + html;
}

const HEAD_JS = fs.readFileSync(path.join(__dirname, "inject", "head.js"), "utf8");
const TAIL_JS = fs.readFileSync(path.join(__dirname, "inject", "tail.js"), "utf8");
const LOAD_HTML = fs.readFileSync(path.join(__dirname, "inject", "load.html"), "utf8");
const INIT_HTML = fs.readFileSync(path.join(__dirname, "inject", "init.html"), "utf8");

const NGG_ALPHA = "useandom26T198340PX75pxJACKVERYMINDBUSHWOLFGQZbfghjklqvwyzrict";
const crypto = require("crypto");
function nggId(prefix) {
  const bytes = crypto.randomBytes(21);
  let s = prefix;
  for (let i = 0; i < bytes.length; i++) s += NGG_ALPHA[bytes[i] % NGG_ALPHA.length];
  return s;
}

const app = express();
app.use(express.raw({ type: "*/*", limit: "10mb" }));

const HOP_BY_HOP = new Set([
  "connection", "keep-alive", "proxy-authenticate", "proxy-authorization",
  "te", "trailer", "transfer-encoding", "upgrade", "host", "content-length",
]);
const STRIP_RES = new Set([
  "content-security-policy", "content-security-policy-report-only",
  "x-frame-options", "report-to", "nel", "content-encoding", "content-length",
]);

function upstreamUrl(req) {
  return UPSTREAM + req.originalUrl;
}

function buildUpstreamHeaders(req) {
  const h = {};
  for (const [k, v] of Object.entries(req.headers)) {
    if (HOP_BY_HOP.has(k.toLowerCase())) continue;
    h[k] = v;
  }
  const proto = req.headers["x-forwarded-proto"] || req.protocol || "http";
  const host = req.get("host");
  h["host"] = "now.gg";
  h["origin"] = UPSTREAM;
  h["referer"] = UPSTREAM + "/";
  if (!h["user-agent"]) h["user-agent"] = "Mozilla/5.0";
  h["x-forwarded-for"] = req.ip;
  h["x-forwarded-host"] = host;
  h["x-forwarded-proto"] = proto;
  return h;
}

const BRAND_LOADING = "loading... (bypass by sealgod)";
const BRAND_BAR = "discord.gg/gCTFQZK6C6 | bypass by sealgod";

function rewriteUpstreamUrls(out) {
  return out
    .replace(/("launchingGame":")((?:[^"\\]|\\.)*)(")/g, "$1" + BRAND_LOADING + "$3")
    .replace(/("testDrive":")TEST DRIVE(")/g, "$1" + BRAND_BAR + "$2")
    .replace(/https?:\/\/cdn\.now\.gg\//gi, "/__cdn/")
    .replace(/https?:\/\/bugpilot\.now\.gg\//gi, "/__noop/")
    .replace(/https?:\\\/\\\/cdn\.now\.gg\\\//gi, "\\/__cdn\\/")
    .replace(/https?:\\\/\\\/bugpilot\.now\.gg\\\//gi, "\\/__noop\\/")
    .replace(/https?:\/\/now\.gg\//gi, "/")
    .replace(/https?:\/\/www\.now\.gg\//gi, "/")
    .replace(/https?:\\\/\\\/now\.gg\\\//gi, "\\/")
    .replace(/https?:\\\/\\\/www\.now\.gg\\\//gi, "\\/");
}

function rewriteHtml(html, req) {
  let out = html;
  const headTag = out.match(/<head[^>]*>/i);
  if (headTag) {
    out = out.replace(headTag[0], headTag[0] + `<script>${HEAD_JS}</script>`);
  } else {
    out = `<script>${HEAD_JS}</script>` + out;
  }
  out = rewriteUpstreamUrls(out);
  const tailTag = `<script>${TAIL_JS}</script>`;
  if (/<\/body\s*>/i.test(out)) {
    out = out.replace(/<\/body\s*>/i, tailTag + "</body>");
  } else {
    out = out + tailTag;
  }
  return out;
}

function copyStatusAndHeaders(upRes, res, req) {
  res.status(upRes.status);
  for (const [k, v] of upRes.headers.entries()) {
    if (STRIP_RES.has(k.toLowerCase())) continue;
    if (k.toLowerCase() === "location") {
      try {
        const loc = v;
        if (loc.startsWith(UPSTREAM + "/")) res.set("location", loc.slice(UPSTREAM.length));
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
  if (rawCookies && rawCookies.length) {
    const rewritten = rawCookies.map((c) => {
      let out = c.replace(/Domain=\.?now\.gg/gi, "");
      if (/;\s*Secure/gi.test(out)) {
        out = out.replace(/;\s*Secure/gi, "").replace(/;\s*SameSite=None/gi, "; SameSite=Lax");
      }
      return out;
    });
    res.set("set-cookie", rewritten);
  } else {
    const single = upRes.headers.get("set-cookie");
    if (single) res.set("set-cookie", single.replace(/Domain=\.?now\.gg/gi, ""));
  }
  res.set("x-proxied-by", "nowgg-proxy");
  const origin = req.headers.origin;
  if (origin) {
    res.set("access-control-allow-origin", origin);
    res.set("vary", "Origin");
  }
}

app.get("/", (_req, res) => {
  res.type("html").send(`<!doctype html><html><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>ngg bypass by sealgod</title>
<style>body{background:#111;color:#eee;font-family:system-ui,sans-serif;display:flex;min-height:100vh;align-items:center;justify-content:center;margin:0}
.card{text-align:center}.btn{display:inline-block;margin-top:16px;padding:12px 28px;background:#ff42a5;color:#fff;border-radius:10px;text-decoration:none;font-weight:700}</style>
</head><body><div class="card"><h1>ngg bypass by sealgod</h1>
<p>note: this is roblox only.</p>
<a class="btn" href="${ROBLOX_PATH}">launch</a></div></body></html>`);
});

app.get("/ip", (req, res) => res.type("text").send((req.ip || "").replace(/^.*:/, "") || "127.0.0.1"));
app.get("/health", (_req, res) => res.json({ ok: true, upstream: UPSTREAM, roblox: ROBLOX_PATH }));

app.all("/__noop/*", (_req, res) => res.status(204).end());

app.get("/__load.html", (_req, res) => {
  res.set("cache-control", "no-store").type("html").send(LOAD_HTML);
});

app.get("/apps/a/19900/b.html", (req, res, next) => {
  if (req.query && req.query.ngg_init) return next();
  res.set("cache-control", "no-store").type("html").send(INIT_HTML);
});

app.options("*", (req, res) => {
  const origin = req.headers.origin || "*";
  res.set("access-control-allow-origin", origin);
  res.set("vary", "Origin");
  res.set("access-control-allow-methods", "GET,POST,PUT,PATCH,DELETE,OPTIONS");
  res.set("access-control-allow-headers", req.headers["access-control-request-headers"] || "Content-Type, x-ngg-fe-version, x-ngg-skip-evar-check, Authorization");
  res.set("access-control-max-age", "86400");
  res.status(204).end();
});

app.use(async (req, res) => {
  if (req.path === "/favicon.ico") return res.status(204).end();
  let target = upstreamUrl(req);
  if (req.path === "/__cdn" || req.path.startsWith("/__cdn/")) {
    let suffix = req.originalUrl.slice("/__cdn".length);
    suffix = suffix
      .replace(/%252F__cdn%252F/gi, "https%253A%252F%252Fcdn.now.gg%252F")
      .replace(/%2F__cdn%2F/gi, "https%3A%2F%2Fcdn.now.gg%2F");
    target = "https://cdn.now.gg" + suffix;
  }
  try {
    const hasBody = !["GET", "HEAD"].includes(req.method) && req.body && req.body.length;
    const upRes = await fetch(target, {
      method: req.method,
      headers: buildUpstreamHeaders(req),
      body: hasBody ? req.body : undefined,
      redirect: "manual",
    });

    copyStatusAndHeaders(upRes, res, req);
    const ctype = (upRes.headers.get("content-type") || "").toLowerCase();

    if (ctype.includes("text/html")) {
      const html = await upRes.text();
      let rewritten = rewriteHtml(html, req);
      res.set("content-type", "text/html; charset=utf-8");
      res.set("cache-control", "no-store");
      if (req.path.startsWith("/apps/")) {
        const vend = await mintGuestSession();
        if (vend) {
          rewritten = injectVend(rewritten, vend);
          if (vend.nsid) {
            res.append("set-cookie", `_NSID=${vend.nsid}; Path=/; SameSite=Lax`);
          }
        }
      }
      return res.send(rewritten);
    }
    if (ctype.includes("javascript") || ctype.includes("ecmascript") || ctype.includes("text/css")) {
      const text = await upRes.text();
      const rewritten = rewriteUpstreamUrls(text);
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

app.listen(PORT, "0.0.0.0", () => {
  console.log(`now.gg proxy running on: http://localhost:${PORT}`);
  console.log(`made by sealgod`);
});

module.exports = app;
