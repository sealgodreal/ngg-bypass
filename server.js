const express = require("express");
const fs = require("fs");
const path = require("path");

const UPSTREAM = "https://now.gg";
const ROBLOX_PATH = "/apps/a/19900/b.html";
const PORT = process.env.PORT || 3000;

const HEAD_JS = fs.readFileSync(path.join(__dirname, "inject", "head.js"), "utf8");
const TAIL_JS = fs.readFileSync(path.join(__dirname, "inject", "tail.js"), "utf8");
const LOAD_HTML = fs.readFileSync(path.join(__dirname, "inject", "load.html"), "utf8");
const INIT_HTML = fs.readFileSync(path.join(__dirname, "inject", "init.html"), "utf8");

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
]);
const STRIP_RES = new Set([
  "content-security-policy", "content-security-policy-report-only",
  "x-frame-options", "report-to", "nel", "content-encoding", "content-length",
]);

function upstreamUrl(req) {
  return UPSTREAM + req.originalUrl;
}

function proxyOrigin(req) {
  const proto = String(req.headers["x-forwarded-proto"] || req.protocol || "http").split(",")[0].trim();
  return proto + "://" + req.get("host");
}

function isHttpsReq(req) {
  return String(req.headers["x-forwarded-proto"] || req.protocol || "http").split(",")[0].trim() === "https";
}

function buildUpstreamHeaders(req) {
  const h = {};
  for (const [k, v] of Object.entries(req.headers)) {
    const lk = k.toLowerCase();
    if (HOP_BY_HOP.has(lk)) continue;
    if (PROXY_SIGNAL_HEADERS.has(lk)) continue;
    if (lk.startsWith("proxy-")) continue;

    if (lk.startsWith("sec-fetch-")) continue;
    if (lk.startsWith("sec-ch-ua")) continue;
    if (lk === "sec-gpc") continue;
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
    h["referer"] = String(req.headers.referer).split(porig).join(UPSTREAM);
    if (/localhost|127\.0\.0\.1/i.test(h["referer"])) {
      h["referer"] = UPSTREAM + ROBLOX_PATH;
    }
  } else {
    h["referer"] = UPSTREAM + ROBLOX_PATH;
  }

  h["sec-fetch-site"] = "same-origin";
  h["sec-fetch-mode"] = req.headers["sec-fetch-mode"] || "cors";
  h["sec-fetch-dest"] = req.headers["sec-fetch-dest"] || "empty";
  if (req.headers.referer || req.headers.origin) {

  }
  h["host"] = "now.gg";
  if (!h["user-agent"]) h["user-agent"] = "Mozilla/5.0";
  return h;
}

const BRAND_LOADING = "loading... | bypass by sealsarcade.xyz";
const BRAND_BAR = "bypass by sealsarcade.xyz";

function rewriteUpstreamUrls(out) {
  return out
    .replace(/("launchingGame":")((?:[^"\\]|\\.)*)(")/g, "$1" + BRAND_LOADING + "$3")

    .replace(/wss?:\/\/cdn\.now\.gg\//gi, "/__cdn/")
    .replace(/wss?:\/\/bugpilot\.now\.gg\//gi, "/__noop/")
    .replace(/wss?:\/\/now\.gg\//gi, "/")
    .replace(/wss?:\/\/www\.now\.gg\//gi, "/")
    .replace(/https?:\/\/cdn\.now\.gg\//gi, "/__cdn/")
    .replace(/https?:\/\/bugpilot\.now\.gg\//gi, "/__noop/")
    .replace(/https?:\\\/\\\/cdn\.now\.gg\\\//gi, "\\/__cdn\\/")
    .replace(/https?:\\\/\\\/bugpilot\.now\.gg\\\//gi, "\\/__noop\\/")
    .replace(/wss?:\\\/\\\/cdn\.now\.gg\\\//gi, "\\/__cdn\\/")
    .replace(/wss?:\\\/\\\/now\.gg\\\//gi, "\\/")
    .replace(/wss?:\\\/\\\/www\.now\.gg\\\//gi, "\\/")
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

function rewriteCookieForClient(c, https) {
  let out = c.replace(/Domain=\.?now\.gg/gi, "");
  if (https) {
    if (/;\s*SameSite=None/gi.test(out) && !/;\s*Secure/gi.test(out)) {
      out = out + "; Secure";
    }
    return out;
  }
  if (/;\s*Secure/gi.test(out)) {
    out = out.replace(/;\s*Secure/gi, "").replace(/;\s*SameSite=None/gi, "; SameSite=Lax");
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
  const https = isHttpsReq(req);
  const rawCookies = typeof upRes.headers.getSetCookie === "function"
    ? upRes.headers.getSetCookie()
    : null;
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

    try {
      if ([401, 403].includes(upRes.status) && /\/(oapi|accounts)\//.test(req.path)) {
        const clone = upRes.clone ? upRes.clone() : null;
        if (clone) {
          clone.text().then((t) => {
            try { console.log(`[upstream ${upRes.status}] ${req.method} ${req.path} -> ${target.slice(0,120)} :: ${String(t).slice(0,300)}`); } catch (e) {}
          }).catch(() => {});
        } else {
          console.log(`[upstream ${upRes.status}] ${req.method} ${req.path}`);
        }
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

const httpServer = app.listen(PORT, "0.0.0.0", () => {
  console.log(`now.gg proxy running on: http://localhost:${PORT}`);
  console.log(`made by sealgod`);
});

httpServer.on("upgrade", (req, socket, head) => {
  let host = "now.gg";
  let targetPath = req.url || "/";
  if (targetPath === "/__cdn" || targetPath.startsWith("/__cdn/")) {
    host = "cdn.now.gg";
    targetPath = targetPath.slice("/__cdn".length) || "/";
  }
  const fwd = {};
  for (const [k, v] of Object.entries(req.headers)) {
    const lk = k.toLowerCase();
    if (lk === "host" || lk === "origin" || lk === "referer") continue;
    if (PROXY_SIGNAL_HEADERS.has(lk)) continue;
    if (lk.startsWith("proxy-")) continue;
    if (lk.startsWith("sec-fetch-")) continue;
    if (lk.startsWith("sec-ch-ua")) continue;

    if (lk === "connection" || lk === "upgrade" || lk === "keep-alive" || lk === "transfer-encoding") continue;
    fwd[k] = v;
  }
  const porig = proxyOrigin(req);
  let rawOrigin = req.headers.origin ? String(req.headers.origin) : "";
  let rawReferer = req.headers.referer ? String(req.headers.referer) : "";
  let cleanOrigin = rawOrigin ? rawOrigin.split(porig).join(UPSTREAM) : UPSTREAM;
  let cleanReferer = rawReferer ? rawReferer.split(porig).join(UPSTREAM) : UPSTREAM + ROBLOX_PATH;
  if (/localhost|127\.0\.0\.1/i.test(cleanOrigin)) cleanOrigin = UPSTREAM;
  if (/localhost|127\.0\.0\.1/i.test(cleanReferer)) cleanReferer = UPSTREAM + ROBLOX_PATH;
  fwd["Origin"] = cleanOrigin;
  fwd["Referer"] = cleanReferer;
  fwd["Host"] = host;

  fwd["Connection"] = req.headers["connection"] || "Upgrade";
  fwd["Upgrade"] = req.headers["upgrade"] || "websocket";

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
