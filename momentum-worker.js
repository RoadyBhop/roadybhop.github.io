/*
 * Momentum Mod API proxy — Cloudflare Worker
 * ------------------------------------------------------------------
 * The Momentum API only allows browser requests from its own dashboard
 * origin, so roadybhop.github.io cannot call it directly. This tiny proxy
 * (running on YOUR Cloudflare account) adds permissive CORS headers and
 * forwards read-only GET requests to the API. It is locked to
 * api.momentum-mod.org so it can't be abused as an open proxy.
 *
 * ONE-TIME SETUP (free, ~5 minutes):
 *   1. Sign up / log in at https://dash.cloudflare.com
 *   2. Left sidebar: Workers & Pages  ->  Create  ->  Create Worker
 *   3. Name it e.g.  momentum-proxy   ->  Deploy
 *   4. Click "Edit code", delete the sample, paste THIS whole file, Deploy
 *   5. Copy your Worker URL (looks like https://momentum-proxy.YOURNAME.workers.dev)
 *   6. Open the Stats page on your site, click "proxy", paste the URL, Save.
 *      (It is stored in your browser only — no code change needed.)
 *
 * Free plan allows 100,000 requests/day, far more than this needs.
 */

const ALLOWED_HOST = "api.momentum-mod.org";
const BROWSER_UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 " +
  "(KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Max-Age": "86400",
};

function json(status, obj) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { ...CORS, "Content-Type": "application/json" },
  });
}

export default {
  async fetch(request) {
    if (request.method === "OPTIONS") return new Response(null, { headers: CORS });
    if (request.method !== "GET") return json(405, { error: "GET only" });

    const target = new URL(request.url).searchParams.get("url");
    if (!target) return json(400, { error: "missing ?url= parameter" });

    let t;
    try { t = new URL(target); } catch { return json(400, { error: "invalid url" }); }
    if (t.protocol !== "https:" || t.hostname !== ALLOWED_HOST)
      return json(403, { error: "only https://" + ALLOWED_HOST + " is allowed" });

    let upstream;
    try {
      upstream = await fetch(t.toString(), {
        headers: { "User-Agent": BROWSER_UA, "Accept": "application/json" },
        cf: { cacheTtl: 120, cacheEverything: true },
      });
    } catch (e) {
      return json(502, { error: "upstream fetch failed", detail: String(e) });
    }

    const body = await upstream.text();
    return new Response(body, {
      status: upstream.status,
      headers: {
        ...CORS,
        "Content-Type": upstream.headers.get("content-type") || "application/json",
      },
    });
  },
};
