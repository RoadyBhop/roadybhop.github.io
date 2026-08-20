/* Momentum completion lookup — client logic for stats.html
 * Denominators come baked in window.MOM_DATA (momentum-data.js).
 * The user's personal bests are fetched live through a Cloudflare Worker
 * proxy whose URL is stored in localStorage (see momentum-worker.js). */
(function () {
  "use strict";

  const API = "https://api.momentum-mod.org";
  const TT = { 0: "main", 1: "stage", 2: "bonus" };
  const GM = {
    1:{name:"Surf",cat:"Surf"}, 2:{name:"Bhop",cat:"Bhop"}, 3:{name:"Bhop HL1",cat:"Bhop"},
    7:{name:"Rocket Jump",cat:"RJ"}, 8:{name:"Sticky Jump",cat:"SJ"}, 9:{name:"Ahop",cat:"Ahop"},
    10:{name:"Conc",cat:"Conc"}, 11:{name:"Defrag CPM",cat:"Defrag"},
    12:{name:"Defrag VQ3",cat:"Defrag"}, 13:{name:"Defrag VTG",cat:"Defrag"}
  };
  const ORDER = Object.keys(GM);

  const $ = (id) => document.getElementById(id);
  const escf = (s) => (typeof esc === "function" ? esc(String(s ?? "")) :
    String(s ?? "").replace(/[&<>"]/g, m => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[m])));
  const pct = (c, t) => t > 0 ? 100 * c / t : 0;
  const fp  = (v) => v >= 99.95 ? "100" : (v === 0 ? "0" : v.toFixed(1));

  /* ---------------- proxy config ---------------- */
  let memProxy = "";  // fallback when localStorage is unavailable (privacy mode, data: URLs)
  const getProxy = () => {
    try { return (localStorage.getItem("mom_proxy") || "").trim(); }
    catch { return memProxy; }
  };
  function normalizeProxy(v) {
    let s = (v || "").trim();
    if (!s) return "";
    if (!/^https?:\/\//i.test(s)) s = "https://" + s;   // most common mistake: no scheme -> relative URL -> 404
    return s.replace(/\/+$/, "");                        // drop trailing slashes
  }
  const setProxy = (v) => {
    memProxy = normalizeProxy(v);
    try { localStorage.setItem("mom_proxy", memProxy); } catch { /* ignore */ }
  };
  async function testProxy() {
    try {
      const j = await apiGet("/v1/users?take=1");
      return (j && typeof j.totalCount === "number") ? { ok: true }
        : { ok: false, msg: "the proxy replied, but not with API data" };
    } catch (e) { return { ok: false, msg: String((e && e.message) || e) }; }
  }
  function proxied(url) {
    let p = getProxy();
    if (!p) return null;
    const enc = encodeURIComponent(url);
    if (p.includes("{url}")) return p.replace("{url}", enc);
    if (/[?&]url=$/.test(p)) return p + enc;
    return p + (p.includes("?") ? "&" : "?") + "url=" + enc;
  }

  async function apiGet(path) {
    const pu = proxied(API + path);
    if (!pu) throw new Error("NO_PROXY");
    const r = await fetch(pu, { headers: { "Accept": "application/json" } });
    if (!r.ok) throw new Error("HTTP " + r.status);
    return r.json();
  }
  async function* pages(base) {
    const sep = base.includes("?") ? "&" : "?";
    let skip = 0; const take = 100;
    while (true) {
      const j = await apiGet(`${base}${sep}take=${take}&skip=${skip}`);
      const data = j.data || [];
      yield { data, total: j.totalCount || 0 };
      if (data.length < take) break;
      skip += take;
    }
  }

  /* ---------------- user resolution ---------------- */
  async function resolveUser(q) {
    q = q.trim();
    const m = q.match(/steamcommunity\.com\/profiles\/(\d+)/);
    if (m) q = m[1];
    if (/^\d+$/.test(q)) {
      if (q.length >= 15) {
        const j = await apiGet(`/v1/users?steamID=${q}&take=1&expand=profile`);
        if (j.data && j.data[0]) return j.data[0];
        throw new Error("No Momentum user for that SteamID.");
      }
      return await apiGet(`/v1/users/${q}?expand=profile`);
    }
    const j = await apiGet(`/v1/users?search=${encodeURIComponent(q)}&take=20&expand=profile`);
    const c = j.data || [];
    if (!c.length) throw new Error(`No user matching "${q}".`);
    const exact = c.find(u => (u.alias || "").toLowerCase() === q.toLowerCase());
    return exact || c[0];
  }

  /* ---------------- map index (fetched live on first lookup, cached for the session) ---------------- */
  let RAWMAPS = null;                 // { mapID: [[g,tt,tn,type,tier], ...] }
  let MAPS_FETCHED_AT = null;
  async function loadMaps() {
    if (RAWMAPS) return RAWMAPS;
    const maps = {}; let n = 0;
    for await (const page of pages("/v1/maps?expand=leaderboards")) {
      for (const m of page.data) {
        const entries = [];
        for (const l of (m.leaderboards || [])) {
          if (l.style !== 0) continue;
          const ty = l.type;
          if (ty !== 0 && ty !== 1) continue;      // RANKED(0) / UNRANKED(1) only
          if (!GM[l.gamemode]) continue;
          entries.push([l.gamemode, l.trackType, l.trackNum, ty, l.tier]);
        }
        if (entries.length) maps[m.id] = entries;
      }
      n += page.data.length;
      status(`<span class="spin"></span>loading current map list &mdash; ${n}${page.total ? " / " + page.total : ""}`);
    }
    RAWMAPS = maps; MAPS_FETCHED_AT = new Date();
    return RAWMAPS;
  }

  /* ---------------- computation ---------------- */
  function newMode() {
    const t = (tiered) => tiered ? { total:0, completed:0, tiers:{} } : { total:0, completed:0 };
    return { main:{ranked:t(1),unranked:t(1)}, stage:{ranked:t(0),unranked:t(0)}, bonus:{ranked:t(1),unranked:t(1)} };
  }
  function buildIndex(maps) {
    const modes = {}, lookup = new Map();
    for (const mid in maps) {
      for (const e of maps[mid]) {
        const g = e[0], tt = e[1], tn = e[2], type = e[3], tier = e[4];
        if (!GM[g]) continue;
        if (!modes[g]) modes[g] = newMode();
        const b = modes[g][TT[tt]][type === 0 ? "ranked" : "unranked"];
        b.total++;
        if (b.tiers && tier != null) (b.tiers[tier] = b.tiers[tier] || {total:0,completed:0}).total++;
        lookup.set(mid + "|" + g + "|" + tt + "|" + tn, [type, tier]);
      }
    }
    return { modes, lookup };
  }
  function aggregateModes(modes) {
    const A = newMode();
    for (const g of ORDER) {
      const m = modes[g]; if (!m) continue;
      for (const tt of ["main","stage","bonus"]) {
        for (const rk of ["ranked","unranked"]) {
          const s = m[tt][rk], d = A[tt][rk];
          d.total += s.total; d.completed += s.completed;
          if (d.tiers && s.tiers) for (const t in s.tiers) {
            (d.tiers[t] = d.tiers[t] || {total:0,completed:0});
            d.tiers[t].total += s.tiers[t].total;
            d.tiers[t].completed += s.tiers[t].completed;
          }
        }
      }
    }
    return A;
  }
  async function compute(user) {
    const maps = await loadMaps();
    const { modes, lookup } = buildIndex(maps);
    let scanned = 0, seen = 0;
    for await (const page of pages(`/v1/runs?userID=${user.id}&isPB=true`)) {
      for (const r of page.data) {
        seen++;
        if (r.style !== 0) continue;
        scanned++;
        const info = lookup.get(r.mapID + "|" + r.gamemode + "|" + r.trackType + "|" + r.trackNum);
        if (!info) continue;
        const b = modes[r.gamemode] && modes[r.gamemode][TT[r.trackType]] &&
                  modes[r.gamemode][TT[r.trackType]][info[0] === 0 ? "ranked" : "unranked"];
        if (!b) continue;
        b.completed++;
        if (b.tiers && info[1] != null && b.tiers[info[1]]) b.tiers[info[1]].completed++;
      }
      status(`<span class="spin"></span>reading personal bests &mdash; ${seen}${page.total ? " / " + page.total : ""}`);
    }
    const prof = user.profile || {};
    return {
      user: { id:user.id, alias:user.alias || ("User "+user.id), steamID:user.steamID, avatar: prof.avatarURL || null },
      modes, scanned, generatedAt: new Date().toISOString()
    };
  }

  /* ---------------- rendering ---------------- */
  const EB = { total:0, completed:0, tiers:{} };
  const pair = (m, tt) => (m && m[tt]) ? m[tt] : { ranked:EB, unranked:EB };
  const comb = (p) => ({ c:(p.ranked.completed||0)+(p.unranked.completed||0), t:(p.ranked.total||0)+(p.unranked.total||0) });

  let REPORT = null, TIER_TRACK = "main", TIER_RANK = "ranked";

  function trackHTML(label, p) {
    const c = comb(p), pc = pct(c.c, c.t);
    const rp = pct(p.ranked.completed || 0, p.ranked.total || 0);
    const up = pct(p.unranked.completed || 0, p.unranked.total || 0);
    const sub = c.t === 0 ? "no maps"
      : `Ranked ${p.ranked.completed}/${p.ranked.total} (${p.ranked.total ? fp(rp) + "%" : "&mdash;"}) &middot; ` +
        `Unranked ${p.unranked.completed}/${p.unranked.total} (${p.unranked.total ? fp(up) + "%" : "&mdash;"})`;
    return `<div>
      <div class="trk-top">
        <span class="trk-l">${label}</span>
        <span class="bar"><i style="width:${pc.toFixed(1)}%"></i></span>
        <span class="trk-f"><b>${c.c}</b>/${c.t}</span>
        <span class="trk-p">${c.t ? fp(pc)+"%" : "&mdash;"}</span>
      </div>
      <div class="trk-sub">${sub}</div>
    </div>`;
  }

  function render(data) {
    REPORT = data;
    data.all = aggregateModes(data.modes);
    const u = data.user, gen = new Date(data.generatedAt);

    let mainC=0,mainT=0,stgC=0,stgT=0,bonC=0,bonT=0,played=0,best=null;
    for (const g of ORDER) {
      const mm=comb(pair(data.modes[g],"main")); mainC+=mm.c; mainT+=mm.t;
      const st=comb(pair(data.modes[g],"stage")); stgC+=st.c; stgT+=st.t;
      const bo=comb(pair(data.modes[g],"bonus")); bonC+=bo.c; bonT+=bo.t;
      if (mm.c>0){ played++; const p=pct(mm.c,mm.t); if(!best||p>best.p) best={g,p}; }
    }
    const kpis = [
      {v: fp(pct(mainC,mainT))+"%", l:"Main completion"},
      {v: mainC+" / "+mainT, l:"Main tracks"},
      {v: stgC+" / "+stgT, l:"Stages"},
      {v: bonC+" / "+bonT, l:"Bonuses"},
      {v: best ? GM[best.g].name : "&mdash;", l:"Strongest mode"}
    ];

    const initials = (u.alias||"?").slice(0,2).toUpperCase();
    const avatar = u.avatar
      ? `<img class="rep-av" src="${escf(u.avatar)}" alt="" onerror="this.replaceWith(Object.assign(document.createElement('div'),{className:'rep-av',textContent:'${initials}'}))">`
      : `<div class="rep-av">${initials}</div>`;

    const cards = ORDER.map(g => {
      const m = data.modes[g];
      const head = `<div class="gc-head"><span class="diamond"></span>
        <span class="gc-name">${escf(GM[g].name)}</span><span class="gc-cat">${escf(GM[g].cat)}</span>`;
      if (!m) return `<div class="gcard glass empty">${head}</div><div class="gc-frac" style="margin-top:8px">No ranked maps</div></div>`;
      const mc = comb(pair(m,"main")), mp = pct(mc.c, mc.t);
      return `<div class="gcard glass">
        ${head}<span class="gc-right"><div class="gc-pct">${fp(mp)}%</div><div class="gc-frac">${mc.c} / ${mc.t} main</div></span></div>
        <div class="tracks">
          ${trackHTML("Main",  pair(m,"main"))}
          ${trackHTML("Stages",pair(m,"stage"))}
          ${trackHTML("Bonus", pair(m,"bonus"))}
        </div>
        <div class="tier-h" data-mode="${g}"></div>
        <div class="tiers" data-mode="${g}"></div>
      </div>`;
    }).join("");

    const allCard = (() => {
      const all = data.all;
      const mc = comb(pair(all,"main")), mp = pct(mc.c, mc.t);
      return `<div class="gcard glass allcard">
        <div class="gc-head"><span class="diamond"></span>
          <span class="gc-name">All gamemodes</span><span class="gc-cat">Summary &mdash; every box combined</span>
          <span class="gc-right"><div class="gc-pct">${fp(mp)}%</div><div class="gc-frac">${mc.c} / ${mc.t} main</div></span></div>
        <div class="tracks">
          ${trackHTML("Main",  pair(all,"main"))}
          ${trackHTML("Stages",pair(all,"stage"))}
          ${trackHTML("Bonus", pair(all,"bonus"))}
        </div>
        <div class="tier-h" data-mode="all"></div>
        <div class="tiers alltiers" data-mode="all"></div>
      </div>`;
    })();

    $("report").innerHTML = `
      <div class="rep-head glass">${avatar}
        <div class="rep-who"><div class="nm">${escf(u.alias)}</div>
          <div class="sb">ID <code>${u.id}</code>${u.steamID?` &middot; Steam <code>${escf(u.steamID)}</code>`:""} &middot; ${data.scanned.toLocaleString()} PBs scanned</div>
        </div>
      </div>
      <div class="kpis">${kpis.map(k=>`<div class="kpi glass"><div class="v">${k.v}</div><div class="l">${k.l}</div></div>`).join("")}</div>
      <div class="controls">
        <span class="cl">Tier view &mdash; track</span>
        <div class="seg" id="segTrack"><button data-track="main" class="on">Main</button><button data-track="bonus">Bonus</button></div>
        <span class="cl">rank</span>
        <div class="seg" id="segRank"><button data-rank="ranked" class="on">Ranked</button><button data-rank="unranked">Unranked</button></div>
      </div>
      <div class="rgrid">${cards}</div>
      ${allCard}
      <div class="repnote"><b>How this is measured.</b> A track is <b>complete</b> when the player has a personal-best run on its
        default-style leaderboard. <b>Main</b> = full map, <b>Stages</b> = staged segments, <b>Bonus</b> = bonus tracks.
        <b>Ranked</b>/<b>Unranked</b> is the leaderboard's official status; auto-generated hidden cross-mode leaderboards are excluded.
        Stages carry no tier, so the by-tier view covers main tracks and bonuses.
        Map totals are fetched live from the current map list${MAPS_FETCHED_AT ? " at " + MAPS_FETCHED_AT.toLocaleTimeString() : ""};
        completion is live as of ${gen.toLocaleString()}.</div>`;

    wireSeg("segTrack", b => TIER_TRACK = b.getAttribute("data-track"));
    wireSeg("segRank",  b => TIER_RANK  = b.getAttribute("data-rank"));
    renderTiers();
    $("report").scrollIntoView({ behavior:"smooth", block:"start" });
  }

  function renderTiers() {
    const trackLabel = TIER_TRACK === "main" ? "Main tracks" : "Bonuses";
    const rankLabel = TIER_RANK[0].toUpperCase() + TIER_RANK.slice(1);
    document.querySelectorAll(".tier-h").forEach(h => {
      h.innerHTML = `${trackLabel} by tier &middot; <span>${rankLabel}</span>`;
    });
    document.querySelectorAll(".tiers").forEach(box => {
      const g = box.getAttribute("data-mode");
      const m = g === "all" ? REPORT.all : REPORT.modes[g];
      const bucket = (m && m[TIER_TRACK] && m[TIER_TRACK][TIER_RANK]) || { tiers:{} };
      const tiers = bucket.tiers || {};
      const keys = Object.keys(tiers).map(Number).sort((a,b)=>a-b);
      if (!keys.length) { box.innerHTML = `<div class="tempty">No ${TIER_RANK} ${trackLabel.toLowerCase()}.</div>`; return; }
      box.innerHTML = keys.map(t => {
        const td = tiers[t], tp = pct(td.completed, td.total), z = td.completed === 0 ? " z" : "";
        return `<div class="tr${z}"><span class="tl">Tier ${t}</span>
          <span class="tb"><i style="width:${tp.toFixed(1)}%"></i></span>
          <span class="tc"><b>${td.completed}</b>/${td.total}</span></div>`;
      }).join("");
    });
  }
  function wireSeg(id, apply) {
    const seg = $(id);
    seg.addEventListener("click", e => {
      const b = e.target.closest("button"); if (!b) return;
      seg.querySelectorAll("button").forEach(x => x.classList.remove("on"));
      b.classList.add("on"); apply(b); renderTiers();
    });
  }

  /* ---------------- status + proxy UI ---------------- */
  function status(html, isErr) {
    const s = $("status"); s.innerHTML = html || ""; s.className = "status" + (isErr ? " err" : "");
  }
  let setupOpen = false;
  function renderProxyBar() {
    const p = getProxy();
    $("proxybar").innerHTML = p
      ? `<span class="pill" id="proxytoggle"><span class="dotok"></span>proxy connected &middot; edit</span>`
      : `<span class="pill" id="proxytoggle"><span class="dotoff"></span>no proxy &middot; set up live lookup</span>`;
    $("proxytoggle").addEventListener("click", () => toggleSetup());
  }
  function setupHTML() {
    const p = getProxy();
    return `<div class="setup glass">
      <h3>Connect an API proxy (one-time, free)</h3>
      <ol>
        <li>Open <a href="https://dash.cloudflare.com" target="_blank" rel="noopener">dash.cloudflare.com</a> &rarr; <b>Workers &amp; Pages</b> &rarr; <b>Create</b> &rarr; <b>Create Worker</b>.</li>
        <li>Name it <code>momentum-proxy</code>, <b>Deploy</b>, then <b>Edit code</b>.</li>
        <li>Paste everything from <code>momentum-worker.js</code> (in this repo), then <b>Deploy</b>.</li>
        <li>Copy the Worker URL and paste it below.</li>
      </ol>
      <div class="row">
        <input id="proxyinput" type="text" placeholder="https://momentum-proxy.you.workers.dev" value="${p?escf(p):""}" />
        <button class="btn btn-primary btn-sm" id="proxysave">Save</button>
      </div>
    </div>`;
  }
  function toggleSetup(force) {
    setupOpen = force != null ? force : !setupOpen;
    $("setup").innerHTML = setupOpen ? setupHTML() : "";
    if (setupOpen) $("proxysave").addEventListener("click", saveProxy);
  }
  async function saveProxy() {
    setProxy($("proxyinput").value);
    renderProxyBar();
    if (!getProxy()) { toggleSetup(false); status("Proxy cleared."); return; }
    const inp = $("proxyinput"); if (inp) inp.value = getProxy();   // reflect normalized value
    status('<span class="spin"></span>testing proxy&hellip;');
    const t = await testProxy();
    if (t.ok) { toggleSetup(false); status("Proxy connected ✓ &mdash; enter a player and hit Look up."); }
    else status("Proxy saved, but the test failed: " + escf(t.msg) + ". Make sure it's your Worker's full https URL.", true);
  }

  /* ---------------- boot ---------------- */
  async function lookup(q) {
    if (!q) return;
    if (!getProxy()) { toggleSetup(true); status("Set your proxy URL first (one-time).", true); return; }
    $("report").innerHTML = "";
    status('<span class="spin"></span>finding player&hellip;');
    try {
      const user = await resolveUser(q);
      const data = await compute(user);
      status("");
      render(data);
    } catch (err) {
      let m = String((err && err.message) || err);
      if (m === "NO_PROXY") m = "Set your proxy URL first.";
      else if (/HTTP 404/.test(m)) m = "Player not found.";
      else if (/Failed to fetch|NetworkError|HTTP 5\d\d/.test(m))
        m = "Couldn't reach the proxy. Check the Worker URL is correct and deployed.";
      status(m, true);
    }
  }

  document.addEventListener("DOMContentLoaded", () => {
    renderProxyBar();
    $("lookup").addEventListener("submit", e => { e.preventDefault(); lookup($("q").value.trim()); });
    const pre = new URLSearchParams(location.search).get("u");
    if (pre) { $("q").value = pre; if (getProxy()) lookup(pre); }
  });
})();
