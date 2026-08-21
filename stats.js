/* Momentum completion lookup — client logic for stats.html
 * Map list (totals) and the player's personal bests are both fetched live
 * through a Cloudflare Worker proxy whose URL is stored in localStorage
 * (see momentum-worker.js). Clicking any section opens a filterable drawer
 * listing the completed/incomplete maps behind it. */
(function () {
  "use strict";

  const API = "https://api.momentum-mod.org";
  const DEFAULT_PROXY = "https://momentum-proxy.jessicahops69.workers.dev";  // used unless a viewer sets their own
  const TT = { 0: "main", 1: "stage", 2: "bonus" };
  const GM = {
    1:{name:"Surf",cat:"Surf"}, 2:{name:"Bhop",cat:"Bhop"}, 3:{name:"Bhop HL1",cat:"Bhop"},
    5:{name:"Climb KZT",cat:"Climb",climb:true,primary:"tp"}, 6:{name:"Climb 1.6",cat:"Climb",climb:true,primary:"pro"},
    7:{name:"Rocket Jump",cat:"RJ"}, 8:{name:"Sticky Jump",cat:"SJ"}, 9:{name:"Ahop",cat:"Ahop"},
    10:{name:"Conc",cat:"Conc"}, 11:{name:"Defrag CPM",cat:"Defrag"},
    12:{name:"Defrag VQ3",cat:"Defrag"}, 13:{name:"Defrag VTG",cat:"Defrag"}
  };
  const isClimb = (g) => !!(GM[g] && GM[g].climb);   // climb uses Pro(8)/Teleport(9), not Normal(0)
  const ORDER = Object.keys(GM);

  const $ = (id) => document.getElementById(id);
  const escf = (s) => (typeof esc === "function" ? esc(String(s ?? "")) :
    String(s ?? "").replace(/[&<>"]/g, m => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[m])));
  const pct = (c, t) => t > 0 ? 100 * c / t : 0;
  const fp  = (v) => v >= 99.95 ? "100" : (v === 0 ? "0" : v.toFixed(1));

  /* ---------------- proxy config ---------------- */
  let memProxy = "";  // custom override held in memory when localStorage is unavailable
  const storedProxy = () => {                // the viewer's own override ("" means use the default)
    try { const v = (localStorage.getItem("mom_proxy") || "").trim(); if (v) return v; } catch {}
    return memProxy;
  };
  const getProxy = () => storedProxy() || DEFAULT_PROXY;
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
  let RAWMAPS = null, RAWNAMES = null;   // maps: {id:[[g,tt,tn,type,tier]]}, names: {id:name}
  let MAPS_FETCHED_AT = null;
  async function loadMaps() {
    if (RAWMAPS) return { maps: RAWMAPS, names: RAWNAMES };
    const maps = {}, names = {}; let n = 0;
    for await (const page of pages("/v1/maps?expand=leaderboards")) {
      for (const m of page.data) {
        const entries = [];
        for (const l of (m.leaderboards || [])) {
          const g = l.gamemode;
          if (!GM[g]) continue;
          // normal modes count Normal style (0); climb counts Pro (8) / Teleport (9)
          if (isClimb(g) ? (l.style !== 8 && l.style !== 9) : (l.style !== 0)) continue;
          const ty = l.type;
          if (ty !== 0 && ty !== 1) continue;      // RANKED(0) / UNRANKED(1) only
          entries.push([g, l.trackType, l.trackNum, ty, l.tier, l.style]);
        }
        if (entries.length) { maps[m.id] = entries; names[m.id] = m.name || ("map " + m.id); }
      }
      n += page.data.length;
      status(`<span class="spin"></span>loading current map list &mdash; ${n}${page.total ? " / " + page.total : ""}`);
    }
    RAWMAPS = maps; RAWNAMES = names; MAPS_FETCHED_AT = new Date();
    return { maps, names };
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
        const g = e[0], tt = e[1], tn = e[2], type = e[3], tier = e[4], style = e[5];
        lookup.set(mid + "|" + g + "|" + tt + "|" + tn + "|" + style, [type, tier]);
        if (style !== 0) continue;                 // `modes` covers Normal-style modes; climb handled separately
        if (!modes[g]) modes[g] = newMode();
        const b = modes[g][TT[tt]][type === 0 ? "ranked" : "unranked"];
        b.total++;
        if (b.tiers && tier != null) (b.tiers[tier] = b.tiers[tier] || {total:0,completed:0}).total++;
      }
    }
    return { modes, lookup };
  }
  /* climb aggregation from the row list: { main:{pro,tp}, bonus:{pro,tp} } */
  function climbAgg(rows, g) {
    const mk = () => ({ total:0, completed:0, tiers:{} });
    const res = { main:{pro:mk(),tp:mk()}, bonus:{pro:mk(),tp:mk()} };
    for (const r of rows) {
      if (r.g !== +g) continue;
      const track = r.tt === 0 ? "main" : (r.tt === 2 ? "bonus" : null); if (!track) continue;
      const st = r.style === 8 ? "pro" : (r.style === 9 ? "tp" : null); if (!st) continue;
      const b = res[track][st];
      b.total++; if (r.done) b.completed++;
      if (r.tier != null) { const T = (b.tiers[r.tier] = b.tiers[r.tier] || {total:0,completed:0}); T.total++; if (r.done) T.completed++; }
    }
    return res;
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
  /* summary = every Normal-style box + each climb box counted once, by its Pro time */
  function aggregateAll(modes, climb) {
    const A = aggregateModes(modes);
    for (const g of ORDER) {
      if (!isClimb(g) || !climb[g]) continue;
      for (const track of ["main","bonus"]) {
        const src = climb[g][track][GM[g].primary], d = A[track].ranked;
        d.total += src.total; d.completed += src.completed;
        for (const t in src.tiers) {
          const T = (d.tiers[t] = d.tiers[t] || {total:0,completed:0});
          T.total += src.tiers[t].total; T.completed += src.tiers[t].completed;
        }
      }
    }
    return A;
  }
  /* ---------------- PBs: full fetch + incremental refresh ---------------- */
  const PBSTATE = {};   // userID -> { done:Set<key>, watermark:{createdAt,id} }
  const isNewer = (r, wm) => r.createdAt !== wm.createdAt ? r.createdAt > wm.createdAt : r.id > wm.id;

  // Fetch PBs newest-first. On refresh (prev given) stop as soon as we reach a PB we already had.
  async function fetchDone(uid, lookup, prev) {
    const done = prev ? new Set(prev.done) : new Set();
    const wm = prev ? prev.watermark : null;
    let newest = null, added = 0, seen = 0, stop = false, skip = 0; const take = 100;
    while (!stop) {
      const j = await apiGet(`/v1/runs?userID=${uid}&isPB=true&orderBy=createdAt&order=desc&take=${take}&skip=${skip}`);
      const data = j.data || [];
      if (!data.length) break;
      for (const r of data) {
        if (!newest) newest = { createdAt: r.createdAt, id: r.id };   // first row = newest PB
        if (wm && !isNewer(r, wm)) { stop = true; break; }            // reached previously-fetched PBs
        seen++;
        const key = r.mapID + "|" + r.gamemode + "|" + r.trackType + "|" + r.trackNum + "|" + r.style;
        if (lookup.has(key)) { if (!done.has(key)) added++; done.add(key); }
      }
      if (data.length < take) break;
      skip += take;
      status(`<span class="spin"></span>${prev ? "checking for new PBs &mdash; " + seen + " new" : "reading personal bests &mdash; " + done.size}`);
    }
    return { done, watermark: newest || wm, added };
  }

  // Build the report data object from the cached map list + a completed-key set.
  function buildReport(user, maps, names, done) {
    const key = (mid,g,tt,tn,style) => mid + "|" + g + "|" + tt + "|" + tn + "|" + style;
    const modes = {}, rows = [];
    for (const mid in maps) {
      for (const e of maps[mid]) {
        const g = e[0], tt = e[1], tn = e[2], type = e[3], tier = e[4], style = e[5];
        const isDone = done.has(key(mid,g,tt,tn,style));
        rows.push({ mid:+mid, name:names[mid], g, tt, tn, ranked:type===0, tier, style, done:isDone });
        if (style !== 0) continue;                    // modes cover Normal-style; climb derives from rows
        if (!modes[g]) modes[g] = newMode();
        const b = modes[g][TT[tt]][type === 0 ? "ranked" : "unranked"];
        b.total++; if (isDone) b.completed++;
        if (b.tiers && tier != null) { const T = (b.tiers[tier] = b.tiers[tier] || {total:0,completed:0}); T.total++; if (isDone) T.completed++; }
      }
    }
    const prof = user.profile || {};
    return {
      user: { id:user.id, alias:user.alias || ("User "+user.id), steamID:user.steamID, avatar: prof.avatarURL || null },
      modes, rows, scanned: done.size, generatedAt: new Date().toISOString()
    };
  }

  async function compute(user) {                       // full lookup
    const { maps, names } = await loadMaps();
    const { lookup } = buildIndex(maps);
    const res = await fetchDone(user.id, lookup, null);
    PBSTATE[user.id] = { done: res.done, watermark: res.watermark };
    return buildReport(user, maps, names, res.done);
  }
  async function refreshReport(user) {                 // incremental (only new PBs)
    const { maps, names } = await loadMaps();          // cached — no network
    const { lookup } = buildIndex(maps);
    const res = await fetchDone(user.id, lookup, PBSTATE[user.id] || null);
    PBSTATE[user.id] = { done: res.done, watermark: res.watermark };
    return { data: buildReport(user, maps, names, res.done), added: res.added };
  }

  /* ---------------- rendering ---------------- */
  const EB = { total:0, completed:0, tiers:{} };
  const pair = (m, tt) => (m && m[tt]) ? m[tt] : { ranked:EB, unranked:EB };
  const comb = (p) => ({ c:(p.ranked.completed||0)+(p.unranked.completed||0), t:(p.ranked.total||0)+(p.unranked.total||0) });

  let REPORT = null, TIER_TRACKS = ["main"], TIER_RANKS = ["ranked"], CURRENT_USER = null;

  /* encode/decode a filter into a data-nav attribute for click-through */
  function navAttr(f) {
    const tiers = f.tiers === "all" ? "all" : (Array.isArray(f.tiers) ? f.tiers.join(",") : String(f.tiers));
    return `data-nav="g=${f.g}&track=${f.track}&rank=${f.rank || "all"}&tiers=${tiers}&done=${f.done || "all"}&style=${f.style || "all"}"`;
  }
  function parseNav(str) {
    const p = new URLSearchParams(str), t = p.get("tiers");
    return {
      g: p.get("g") || "all",
      track: p.get("track") || "all",
      rank: p.get("rank") || "all",
      tiers: (!t || t === "all") ? "all" : t.split(",").map(Number),
      done: p.get("done") || "all",
      style: p.get("style") || "all"
    };
  }

  function trackHTML(label, p, g, trackKey) {
    const c = comb(p), pc = pct(c.c, c.t);
    const rp = pct(p.ranked.completed || 0, p.ranked.total || 0);
    const up = pct(p.unranked.completed || 0, p.unranked.total || 0);
    const base = { g, track: trackKey, tiers: "all", done: "all" };
    const sub = c.t === 0 ? "no maps"
      : `<span class="lnk" ${navAttr({ ...base, rank:"ranked" })}>Ranked ${p.ranked.completed}/${p.ranked.total} (${p.ranked.total ? fp(rp)+"%" : "&mdash;"})</span> &middot; ` +
        `<span class="lnk" ${navAttr({ ...base, rank:"unranked" })}>Unranked ${p.unranked.completed}/${p.unranked.total} (${p.unranked.total ? fp(up)+"%" : "&mdash;"})</span>`;
    return `<div>
      <div class="trk-top lnk" ${navAttr({ ...base, rank:"all" })}>
        <span class="trk-l">${label}</span>
        <span class="bar"><i style="width:${pc.toFixed(1)}%"></i></span>
        <span class="trk-f"><b>${c.c}</b>/${c.t}</span>
        <span class="trk-p">${c.t ? fp(pc)+"%" : "&mdash;"}</span>
      </div>
      <div class="trk-sub">${sub}</div>
    </div>`;
  }

  /* climb cards: Pro + Teleport shown as separate rows, each with its own tier column */
  const SHORT_L = { pro:"Pro", tp:"TP" }, LONG_L = { pro:"Pro", tp:"Teleport" };
  function climbCardHTML(g) {
    const c = REPORT.climb[g] || climbAgg([], g);
    const prim = GM[g].primary;
    const order = prim === "pro" ? ["pro","tp"] : ["tp","pro"];   // primary shown first
    const primMain = c.main[prim], mp = pct(primMain.completed, primMain.total);
    const headInner = `<span class="diamond"></span>
      <span class="gc-name">${escf(GM[g].name)}</span><span class="gc-cat">${escf(GM[g].cat)}</span>`;
    if (!(c.main.pro.total || c.main.tp.total || c.bonus.pro.total || c.bonus.tp.total))
      return `<div class="gcard glass empty"><div class="gc-head">${headInner}</div>
        <div class="gc-frac" style="margin-top:8px">No maps yet</div></div>`;
    const row = (track, style) => {
      const b = c[track][style]; if (!b.total) return "";
      const p = pct(b.completed, b.total);
      return `<div class="trk-top lnk" ${navAttr({ g, track, rank:"all", tiers:"all", done:"all", style })}>
        <span class="trk-l">${(track === "main" ? "Main" : "Bonus")} · ${SHORT_L[style]}</span>
        <span class="bar"><i style="width:${p.toFixed(1)}%"></i></span>
        <span class="trk-f"><b>${b.completed}</b>/${b.total}</span>
        <span class="trk-p">${fp(p)}%</span></div>`;
    };
    const tracks = order.map(st => row("main", st)).join("") + order.map(st => row("bonus", st)).join("");
    const cols = order.map(st =>
      `<div class="climb-col"><div class="climb-col-h">${LONG_L[st]}</div><div class="tiers" data-mode="${g}" data-style="${st}"></div></div>`).join("");
    return `<div class="gcard glass climbcard">
      <div class="gc-head lnk" ${navAttr({ g, track:"main", rank:"all", tiers:"all", done:"all", style:prim })}>${headInner}
        <span class="gc-right"><div class="gc-pct">${fp(mp)}%</div><div class="gc-frac">${primMain.completed} / ${primMain.total} ${LONG_L[prim]}</div></span></div>
      <div class="tracks">${tracks}</div>
      <div class="tier-h climb-th" data-mode="${g}"></div>
      <div class="climb-tiers">${cols}</div>
    </div>`;
  }

  function render(data) {
    REPORT = data;
    REPORT.climb = {};
    for (const g of ORDER) if (isClimb(g)) REPORT.climb[g] = climbAgg(data.rows, g);
    data.all = aggregateAll(data.modes, REPORT.climb);
    const u = data.user, gen = new Date(data.generatedAt);

    let mainC=0,mainT=0,stgC=0,stgT=0,bonC=0,bonT=0,played=0,best=null;
    for (const g of ORDER) {
      if (isClimb(g)) {                              // climb counts once, by its primary style
        const c = REPORT.climb[g], prim = GM[g].primary, pm = c.main[prim], pb = c.bonus[prim];
        mainC+=pm.completed; mainT+=pm.total; bonC+=pb.completed; bonT+=pb.total;
        if (pm.completed>0){ played++; const p=pct(pm.completed,pm.total); if(!best||p>best.p) best={g,p}; }
        continue;
      }
      const mm=comb(pair(data.modes[g],"main")); mainC+=mm.c; mainT+=mm.t;
      const st=comb(pair(data.modes[g],"stage")); stgC+=st.c; stgT+=st.t;
      const bo=comb(pair(data.modes[g],"bonus")); bonC+=bo.c; bonT+=bo.t;
      if (mm.c>0){ played++; const p=pct(mm.c,mm.t); if(!best||p>best.p) best={g,p}; }
    }
    const allNav = (track) => ({ g:"all", track, rank:"all", tiers:"all", done:"all" });
    const kpis = [
      {v: fp(pct(mainC,mainT))+"%", l:"Main completion", nav: allNav("main")},
      {v: mainC+" / "+mainT, l:"Main tracks", nav: allNav("main")},
      {v: stgC+" / "+stgT, l:"Stages", nav: allNav("stage")},
      {v: bonC+" / "+bonT, l:"Bonuses", nav: allNav("bonus")},
      {v: best ? GM[best.g].name : "&mdash;", l:"Strongest mode", nav: best ? {g:best.g,track:"main",rank:"all",tiers:"all",done:"all"} : null}
    ];

    const initials = (u.alias||"?").slice(0,2).toUpperCase();
    const avatar = u.avatar
      ? `<img class="rep-av" src="${escf(u.avatar)}" alt="" onerror="this.replaceWith(Object.assign(document.createElement('div'),{className:'rep-av',textContent:'${initials}'}))">`
      : `<div class="rep-av">${initials}</div>`;

    const headInner = (g) => `<span class="diamond"></span>
        <span class="gc-name">${escf(GM[g].name)}</span><span class="gc-cat">${escf(GM[g].cat)}</span>`;
    const cards = ORDER.map(g => {
      if (isClimb(g)) return climbCardHTML(g);
      const m = data.modes[g];
      if (!m) return `<div class="gcard glass empty"><div class="gc-head">${headInner(g)}</div>
        <div class="gc-frac" style="margin-top:8px">No ranked maps</div></div>`;
      const mc = comb(pair(m,"main")), mp = pct(mc.c, mc.t);
      return `<div class="gcard glass">
        <div class="gc-head lnk" ${navAttr({g, track:"main", rank:"all", tiers:"all", done:"all"})}>${headInner(g)}
          <span class="gc-right"><div class="gc-pct">${fp(mp)}%</div><div class="gc-frac">${mc.c} / ${mc.t} main</div></span></div>
        <div class="tracks">
          ${trackHTML("Main",  pair(m,"main"),  g, "main")}
          ${trackHTML("Stages",pair(m,"stage"), g, "stage")}
          ${trackHTML("Bonus", pair(m,"bonus"), g, "bonus")}
        </div>
        <div class="tier-h" data-mode="${g}"></div>
        <div class="tiers" data-mode="${g}"></div>
      </div>`;
    }).join("");

    const allCard = (() => {
      const all = data.all;
      const mc = comb(pair(all,"main")), mp = pct(mc.c, mc.t);
      return `<div class="gcard glass allcard">
        <div class="gc-head lnk" ${navAttr({g:"all", track:"main", rank:"all", tiers:"all", done:"all"})}><span class="diamond"></span>
          <span class="gc-name">All gamemodes</span><span class="gc-cat">Summary &mdash; every box combined</span>
          <span class="gc-right"><div class="gc-pct">${fp(mp)}%</div><div class="gc-frac">${mc.c} / ${mc.t} main</div></span></div>
        <div class="tracks">
          ${trackHTML("Main",  pair(all,"main"),  "all", "main")}
          ${trackHTML("Stages",pair(all,"stage"), "all", "stage")}
          ${trackHTML("Bonus", pair(all,"bonus"), "all", "bonus")}
        </div>
        <div class="tier-h" data-mode="all"></div>
        <div class="tiers alltiers" data-mode="all"></div>
      </div>`;
    })();

    $("report").innerHTML = `
      <div class="rep-head glass">${avatar}
        <div class="rep-who"><div class="nm">${escf(u.alias)}</div>
          <div class="sb">ID <code>${u.id}</code>${u.steamID?` &middot; Steam <code>${escf(u.steamID)}</code>`:""} &middot; ${data.scanned.toLocaleString()} completions</div>
        </div>
        <button class="btn btn-ghost btn-sm rep-refresh" id="refreshBtn" title="Fetch only new personal bests since the last check">&#8635; Refresh</button>
      </div>
      <div class="kpis">${kpis.map(k=>`<div class="kpi glass ${k.nav?"lnk":""}" ${k.nav?navAttr(k.nav):""}><div class="v">${k.v}</div><div class="l">${k.l}</div></div>`).join("")}</div>
      <div class="click-hint">Tip &mdash; click any number, bar, or tier to list the maps behind it.</div>
      <div class="controls">
        <span class="cl">Tier view &mdash; tracks</span>
        <div class="seg multi" id="segTrack"><button data-track="main" class="${TIER_TRACKS.includes("main")?"on":""}">Main</button><button data-track="bonus" class="${TIER_TRACKS.includes("bonus")?"on":""}">Bonus</button></div>
        <span class="cl">ranks</span>
        <div class="seg multi" id="segRank"><button data-rank="ranked" class="${TIER_RANKS.includes("ranked")?"on":""}">Ranked</button><button data-rank="unranked" class="${TIER_RANKS.includes("unranked")?"on":""}">Unranked</button></div>
      </div>
      <div class="rgrid">${cards}</div>
      ${allCard}
      <div class="repnote"><b>How this is measured.</b> A track is <b>complete</b> when the player has a personal-best run on its leaderboard.
        <b>Main</b> = full map, <b>Stages</b> = staged segments, <b>Bonus</b> = bonus tracks.
        <b>Ranked</b>/<b>Unranked</b> is the leaderboard's official status; hidden auto-generated cross-mode leaderboards are excluded.
        <b>Climb</b> modes have no Normal style, so they split into <b>Pro</b> (no teleports) and <b>Teleport</b>. The headline %, KPIs and All-gamemodes total use each mode's primary category (KZT &rarr; Teleport, 1.6 &rarr; Pro).
        Stages carry no tier, so by-tier views cover main tracks and bonuses.
        Map totals are fetched live from the current map list${MAPS_FETCHED_AT ? " at " + MAPS_FETCHED_AT.toLocaleTimeString() : ""};
        completion is live as of ${gen.toLocaleString()}.</div>`;

    wireMultiSeg("segTrack", TIER_TRACKS, "data-track");
    wireMultiSeg("segRank",  TIER_RANKS,  "data-rank");
    const rb = $("refreshBtn"); if (rb) rb.addEventListener("click", refresh);
    renderTiers();
    $("report").scrollIntoView({ behavior:"smooth", block:"start" });
  }

  async function refresh() {
    if (!CURRENT_USER) return;
    const btn = $("refreshBtn"); if (btn) btn.disabled = true;
    status('<span class="spin"></span>checking for new PBs&hellip;');
    try {
      const { data, added } = await refreshReport(CURRENT_USER);
      render(data);
      status(added > 0 ? `Updated &mdash; ${added} new completion${added === 1 ? "" : "s"}.` : "Up to date &mdash; no new completions.");
    } catch (err) {
      status("Refresh failed: " + escf(String((err && err.message) || err)), true);
      const b2 = $("refreshBtn"); if (b2) b2.disabled = false;
    }
  }

  function sumTiers(buckets) {
    const out = {};
    for (const b of buckets) {
      if (!b || !b.tiers) continue;
      for (const t in b.tiers) { const T = (out[t] = out[t] || {total:0,completed:0}); T.total += b.tiers[t].total; T.completed += b.tiers[t].completed; }
    }
    return out;
  }
  function renderTiers() {
    const trackLabel = TIER_TRACKS.length ? TIER_TRACKS.map(t => t === "main" ? "Main" : "Bonus").join(" + ") : "—";
    const rankLabel  = TIER_RANKS.length  ? TIER_RANKS.map(r => r[0].toUpperCase() + r.slice(1)).join(" + ") : "—";
    document.querySelectorAll(".tier-h").forEach(h => {
      h.innerHTML = h.classList.contains("climb-th")
        ? `${trackLabel} by tier`
        : `${trackLabel} by tier &middot; <span>${rankLabel}</span>`;
    });
    const navTrack = TIER_TRACKS.length === 1 ? TIER_TRACKS[0] : "all";
    document.querySelectorAll(".tiers").forEach(box => {
      const g = box.getAttribute("data-mode");
      const style = box.getAttribute("data-style");   // climb columns: "pro" | "tp"
      const buckets = [];
      let emptyLabel;
      if (style) {                                     // climb column: sum selected tracks for this style
        const c = REPORT.climb[g];
        for (const tr of TIER_TRACKS) { const b = c && c[tr] && c[tr][style]; if (b) buckets.push(b); }
        emptyLabel = TIER_TRACKS.length ? `No ${style === "pro" ? "Pro" : "Teleport"} maps here.` : "Pick a track above.";
      } else {                                         // normal: sum selected tracks × ranks
        const m = g === "all" ? REPORT.all : REPORT.modes[g];
        for (const tr of TIER_TRACKS) for (const rk of TIER_RANKS) { const b = m && m[tr] && m[tr][rk]; if (b) buckets.push(b); }
        emptyLabel = (TIER_TRACKS.length && TIER_RANKS.length) ? "No maps for this selection." : "Pick a track and rank above.";
      }
      const tiers = sumTiers(buckets);
      const keys = Object.keys(tiers).map(Number).sort((a,b)=>a-b);
      if (!keys.length) { box.innerHTML = `<div class="tempty">${emptyLabel}</div>`; return; }
      const navRank = style ? "all" : (TIER_RANKS.length === 1 ? TIER_RANKS[0] : "all");
      box.innerHTML = keys.map(t => {
        const td = tiers[t], tp = pct(td.completed, td.total), z = td.completed === 0 ? " z" : "";
        const nav = navAttr({ g, track:navTrack, rank:navRank, tiers:[t], done:"all", style: style || "all" });
        return `<div class="tr${z} lnk" ${nav}><span class="tl">Tier ${t}</span>
          <span class="tb"><i style="width:${tp.toFixed(1)}%"></i></span>
          <span class="tc"><b>${td.completed}</b>/${td.total}</span></div>`;
      }).join("");
    });
  }
  function wireMultiSeg(id, arr, attr) {
    const seg = $(id);
    seg.addEventListener("click", e => {
      const b = e.target.closest("button"); if (!b) return;
      const v = b.getAttribute(attr), i = arr.indexOf(v);
      if (i >= 0) arr.splice(i, 1); else arr.push(v);
      b.classList.toggle("on");
      renderTiers();
    });
  }

  /* ---------------- browse drawer (map list with filters) ---------------- */
  let FILTERS = null;
  const ICON = (name, fb) => (typeof ICONS !== "undefined" && ICONS[name]) || fb;

  function ensureDrawer() {
    if ($("browse")) return;
    const back = document.createElement("div"); back.className = "drawer-back"; back.id = "drawerBack";
    const dr = document.createElement("div"); dr.className = "drawer"; dr.id = "browse";
    dr.innerHTML = `
      <div class="dr-head">
        <div class="dr-title" id="drTitle">Maps</div>
        <button class="dr-close" id="drClose" aria-label="Close">${ICON("x","&times;")}</button>
      </div>
      <div class="dr-filters" id="drFilters"></div>
      <div class="dr-count" id="drCount"></div>
      <div class="dr-list" id="drList"></div>`;
    document.body.appendChild(back);
    document.body.appendChild(dr);
    back.addEventListener("click", closeDrawer);
    $("drClose").addEventListener("click", closeDrawer);
    document.addEventListener("keydown", e => { if (e.key === "Escape") closeDrawer(); });
  }
  function openDrawer(f) {
    if (!REPORT || !REPORT.rows) return;
    ensureDrawer();
    FILTERS = f;
    renderFilters(); renderList();
    $("drawerBack").classList.add("open");
    $("browse").classList.add("open");
    document.body.style.overflow = "hidden";
  }
  function closeDrawer() {
    const b = $("drawerBack"), d = $("browse");
    if (b) b.classList.remove("open");
    if (d) d.classList.remove("open");
    document.body.style.overflow = "";
  }

  function segHTML(name, values, cur, labels) {
    return `<div class="seg drseg" data-seg="${name}">` +
      values.map(v => `<button data-val="${v}" class="${cur === v ? "on" : ""}">${labels[v]}</button>`).join("") + `</div>`;
  }
  function maxTier() { let mx = 0; for (const r of REPORT.rows) if (r.tier > mx) mx = r.tier; return mx || 10; }
  function renderFilters() {
    const f = FILTERS;
    const gmOpts = `<option value="all">All gamemodes</option>` +
      ORDER.map(g => `<option value="${g}" ${String(f.g) === String(g) ? "selected" : ""}>${escf(GM[g].name)}</option>`).join("");
    const stageOnly = f.track === "stage";
    const showStyle = isClimb(f.g);   // Pro/Teleport only means something for climb
    const mx = maxTier();
    const chips = stageOnly ? `<span class="dr-note">stages have no tier</span>`
      : `<button class="chip ${f.tiers === "all" ? "on" : ""}" data-tier="all">All</button>` +
        Array.from({ length: mx }, (_, i) => i + 1).map(t => {
          const on = f.tiers !== "all" && f.tiers.includes(t);
          return `<button class="chip ${on ? "on" : ""}" data-tier="${t}">${t}</button>`;
        }).join("");
    const styleField = showStyle
      ? `<div class="dr-field"><span>Style</span>${segHTML("style", ["all","pro","tp"], f.style, {all:"All",pro:"Pro",tp:"Teleport"})}</div>` : "";
    $("drFilters").innerHTML = `
      <label class="dr-field"><span>Gamemode</span><select id="fGm">${gmOpts}</select></label>
      <div class="dr-field"><span>Track</span>${segHTML("track", ["all","main","stage","bonus"], f.track, {all:"All",main:"Main",stage:"Stage",bonus:"Bonus"})}</div>
      <div class="dr-field"><span>Rank</span>${segHTML("rank", ["all","ranked","unranked"], f.rank, {all:"All",ranked:"Ranked",unranked:"Unranked"})}</div>
      ${styleField}
      <div class="dr-field"><span>Completion</span>${segHTML("done", ["all","no","yes"], f.done, {all:"All",no:"Incomplete",yes:"Completed"})}</div>
      <div class="dr-field"><span>Tier</span><div class="chips">${chips}</div></div>`;
    $("fGm").addEventListener("change", e => {
      FILTERS.g = e.target.value;
      if (!isClimb(FILTERS.g)) FILTERS.style = "all";
      renderFilters(); renderList();
    });
    ["track","rank","done"].concat(showStyle ? ["style"] : []).forEach(name => {
      $("drFilters").querySelector(`.drseg[data-seg="${name}"]`).addEventListener("click", e => {
        const b = e.target.closest("button"); if (!b) return;
        FILTERS[name] = b.getAttribute("data-val");
        if (name === "track" && FILTERS.track === "stage") FILTERS.tiers = "all";
        renderFilters(); renderList();
      });
    });
    $("drFilters").querySelectorAll(".chip").forEach(ch => ch.addEventListener("click", () => {
      const t = ch.getAttribute("data-tier");
      if (t === "all") FILTERS.tiers = "all";
      else {
        const n = +t;
        if (FILTERS.tiers === "all") FILTERS.tiers = [n];
        else {
          const i = FILTERS.tiers.indexOf(n);
          if (i >= 0) FILTERS.tiers.splice(i, 1); else FILTERS.tiers.push(n);
          if (!FILTERS.tiers.length) FILTERS.tiers = "all";
        }
      }
      renderFilters(); renderList();
    }));
  }
  function applyFilters(rows, f) {
    return rows.filter(r => {
      if (f.g !== "all" && r.g !== +f.g) return false;
      if (f.track !== "all" && TT[r.tt] !== f.track) return false;
      if (f.rank !== "all" && (f.rank === "ranked") !== r.ranked) return false;
      if (f.style && f.style !== "all") { if (r.style !== (f.style === "pro" ? 8 : 9)) return false; }
      if (f.tiers !== "all") { if (r.tier == null || !f.tiers.includes(r.tier)) return false; }
      if (f.done === "yes" && !r.done) return false;
      if (f.done === "no" && r.done) return false;
      return true;
    });
  }
  function renderList() {
    const f = FILTERS;
    $("drTitle").innerHTML = f.g === "all" ? "All gamemodes" : escf(GM[f.g].name);
    const rows = applyFilters(REPORT.rows, f).sort((a, b) =>
      (a.done - b.done) || (a.g - b.g) || (a.tt - b.tt) || ((a.tier||0) - (b.tier||0)) || a.name.localeCompare(b.name));
    const doneN = rows.filter(r => r.done).length;
    $("drCount").innerHTML = `${rows.length} track${rows.length === 1 ? "" : "s"} &middot; <b>${doneN}</b> completed &middot; ${fp(pct(doneN, rows.length))}%`;
    if (!rows.length) { $("drList").innerHTML = `<div class="dr-empty">No maps match these filters.</div>`; return; }
    const check = ICON("check", "&#10003;");
    $("drList").innerHTML = rows.map(r => {
      const styleTag = r.style === 8 ? " &middot; Pro" : r.style === 9 ? " &middot; TP" : "";
      const meta = `${escf(GM[r.g].cat)} &middot; ${TT[r.tt]}${r.tn > 1 ? " " + r.tn : ""}${r.tier != null ? " &middot; T" + r.tier : ""}${styleTag} &middot; ${r.ranked ? "ranked" : "unranked"}`;
      return `<div class="mrow ${r.done ? "is-done" : ""}">
        <span class="mmark">${r.done ? check : ""}</span>
        <span class="mname">${escf(r.name)}</span>
        <span class="mmeta">${meta}</span>
      </div>`;
    }).join("");
  }

  /* ---------------- status + proxy UI ---------------- */
  function status(html, isErr) {
    const s = $("status"); s.innerHTML = html || ""; s.className = "status" + (isErr ? " err" : "");
  }
  let setupOpen = false;
  function renderProxyBar() {
    const custom = !!storedProxy();
    $("proxybar").innerHTML =
      `<span class="pill" id="proxytoggle"><span class="dotok"></span>${custom ? "custom proxy &middot; edit" : "using shared proxy &middot; change if slow"}</span>`;
    $("proxytoggle").addEventListener("click", () => toggleSetup());
  }
  function setupHTML() {
    const stored = storedProxy();
    return `<div class="setup glass">
      <h3>API proxy (optional)</h3>
      <p class="setup-note">A shared proxy is used by default. If it's ever slow or rate-limited, deploy your own free Cloudflare Worker and paste its URL here to override it.</p>
      <ol>
        <li>Open <a href="https://dash.cloudflare.com" target="_blank" rel="noopener">dash.cloudflare.com</a> &rarr; <b>Workers &amp; Pages</b> &rarr; <b>Create</b> &rarr; <b>Create Worker</b>.</li>
        <li>Name it <code>momentum-proxy</code>, <b>Deploy</b>, then <b>Edit code</b>.</li>
        <li>Paste everything from <code>momentum-worker.js</code> (in this repo), then <b>Deploy</b>.</li>
        <li>Copy the Worker URL and paste it below (leave blank to use the default).</li>
      </ol>
      <div class="row">
        <input id="proxyinput" type="text" placeholder="${escf(DEFAULT_PROXY)}" value="${stored ? escf(stored) : ""}" />
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
    const custom = !!storedProxy();
    const inp = $("proxyinput"); if (inp) inp.value = custom ? getProxy() : "";   // normalized value, or blank for default
    status('<span class="spin"></span>testing proxy&hellip;');
    const t = await testProxy();
    if (t.ok) { toggleSetup(false); status((custom ? "Custom proxy" : "Default proxy") + " connected ✓ &mdash; enter a player and hit Look up."); }
    else status("Proxy saved, but the test failed: " + escf(t.msg) + ". Make sure it's a full https Worker URL.", true);
  }

  /* ---------------- boot ---------------- */
  async function lookup(q) {
    if (!q) return;
    if (!getProxy()) { toggleSetup(true); status("Set your proxy URL first (one-time).", true); return; }
    $("report").innerHTML = "";
    status('<span class="spin"></span>finding player&hellip;');
    try {
      const user = await resolveUser(q);
      CURRENT_USER = user;
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
    $("report").addEventListener("click", e => {
      const el = e.target.closest("[data-nav]");
      if (el) openDrawer(parseNav(el.getAttribute("data-nav")));
    });
    const pre = new URLSearchParams(location.search).get("u");
    if (pre) { $("q").value = pre; if (getProxy()) lookup(pre); }
  });
})();
