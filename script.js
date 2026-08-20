const ICONS = {
  download: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>',
  play: '<svg viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="1" stroke-linejoin="round"><polygon points="6 3 20 12 6 21 6 3"/></svg>',
  calendar: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>',
  external: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>',
  copy: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>',
  check: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>',
  arrow: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>',
  mappin: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>',
  zap: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>',
  menu: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>',
  x: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>',
};
function esc(s){return (s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');}

function initNav(){
  const nav = document.querySelector('.nav');
  if(nav){
    const onScroll = ()=> nav.classList.toggle('scrolled', window.scrollY>20);
    window.addEventListener('scroll', onScroll); onScroll();
  }
  const btn = document.querySelector('.menu-btn');
  const menu = document.querySelector('.mobile-menu');
  if(btn && menu){
    btn.innerHTML = ICONS.menu;
    btn.addEventListener('click', ()=>{
      const open = menu.classList.toggle('open');
      btn.innerHTML = open ? ICONS.x : ICONS.menu;
    });
  }
}

function initReveal(){
  const obs = new IntersectionObserver((entries)=>{
    entries.forEach(e=>{ if(e.isIntersecting) e.target.classList.add('in'); });
  }, {threshold:0.12});
  document.querySelectorAll('.reveal').forEach(el=>obs.observe(el));
}

function openModal(videoId, title){
  let modal = document.getElementById('yt-modal');
  if(!modal){
    modal = document.createElement('div');
    modal.id = 'yt-modal'; modal.className = 'modal';
    modal.innerHTML = `<div class="modal-box"><div class="modal-top"><span class="title"></span><button class="modal-close">${ICONS.x}</button></div><div class="modal-frame"><iframe allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe></div></div>`;
    document.body.appendChild(modal);
    modal.addEventListener('click', (e)=>{ if(e.target===modal) closeModal(); });
    modal.querySelector('.modal-close').addEventListener('click', closeModal);
    document.addEventListener('keydown', (e)=>{ if(e.key==='Escape') closeModal(); });
  }
  modal.querySelector('.title').textContent = title + ' // showcase';
  modal.querySelector('iframe').src = `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`;
  modal.classList.add('open');
  document.body.style.overflow='hidden';
}
function closeModal(){
  const modal = document.getElementById('yt-modal');
  if(modal){ modal.classList.remove('open'); modal.querySelector('iframe').src=''; document.body.style.overflow=''; }
}

function cardHTML(m){
  const badge = `<div class="date-badge">${ICONS.calendar}${esc(m.releaseDate)}</div>`;
  const overlay = m.showcase ? `<button class="play-overlay" data-yt="${m.showcase}" data-title="${esc(m.title)}"><span class="play-circle">${ICONS.play}</span></button>` : '';
  const showcaseBtn = m.showcase ? `<button class="btn btn-sm btn-ghost js-showcase" data-yt="${m.showcase}" data-title="${esc(m.title)}">${ICONS.play} Showcase</button>` : '';
  return `<div class="card glass reveal">
    <div class="card-img"><img src="${m.image}" alt="${esc(m.title)}" loading="lazy"><div class="fade"></div>${badge}${overlay}</div>
    <div class="card-body">
      <h3>${esc(m.title)}</h3>
      <p>${esc(m.description)}</p>
      <div class="card-actions">
        <a class="btn btn-sm btn-primary" href="${m.download}" target="_blank" rel="noopener noreferrer">${ICONS.download} Download</a>
        ${showcaseBtn}
      </div>
    </div>
  </div>`;
}
function renderMaps(){
  const mo = document.getElementById('momentum-grid');
  const cs = document.getElementById('css-grid');
  if(mo){ mo.innerHTML = MOMENTUM_MAPS.map(cardHTML).join(''); document.getElementById('momentum-count').textContent = MOMENTUM_MAPS.length + ' maps'; }
  if(cs){ cs.innerHTML = CSS_MAPS.map(cardHTML).join(''); document.getElementById('css-count').textContent = CSS_MAPS.length + ' maps'; }
  document.querySelectorAll('[data-yt]').forEach(el=>{
    el.addEventListener('click', ()=> openModal(el.getAttribute('data-yt'), el.getAttribute('data-title')));
  });
}

function linkCardHTML(item){
  const act = item.href ? `<span class="act">${ICONS.external}</span>` : `<button class="act js-copy" data-copy="${esc(item.value)}">${ICONS.copy}</button>`;
  const inner = `<div class="ico"><img src="${item.icon}" alt="${esc(item.label)}"></div>
    <div class="info"><div class="lbl">${esc(item.label)}</div><div class="val">${esc(item.value)}</div></div>${act}`;
  return item.href
    ? `<a class="link-card glass reveal" href="${item.href}" target="_blank" rel="noopener noreferrer">${inner}</a>`
    : `<div class="link-card glass reveal">${inner}</div>`;
}
function renderContacts(){
  const d = document.getElementById('direct-links');
  const o = document.getElementById('other-links');
  if(d) d.innerHTML = CONTACTS.map(linkCardHTML).join('');
  if(o) o.innerHTML = OTHER_LINKS.map(linkCardHTML).join('');
  document.querySelectorAll('.js-copy').forEach(btn=>{
    btn.addEventListener('click', (e)=>{
      e.preventDefault(); e.stopPropagation();
      navigator.clipboard && navigator.clipboard.writeText(btn.getAttribute('data-copy'));
      btn.innerHTML = ICONS.check;
      setTimeout(()=> btn.innerHTML = ICONS.copy, 1500);
    });
  });
}

function renderStats(){
  const full = document.getElementById('stats-grid');
  if(full) full.innerHTML = STATS.slice(0,2).map(s=>`<div class="stat"><div class="val glow-text">${s.value}</div><div class="lbl">${s.label}</div></div>`).join('');
  const mini = document.getElementById('stats-mini');
  if(mini) mini.innerHTML = STATS.slice(0,2).map(s=>`<div class="stat glass"><div class="val accent">${s.value}</div><div class="lbl">${s.label}</div></div>`).join('');
}

function renderAbout(){
  const list = document.getElementById('about-list');
  if(list) list.innerHTML = ABOUT.map(a=>`<div class="about-item reveal"><span class="dot"></span><span class="stem"></span><h2>${esc(a.heading)}</h2><p>${esc(a.body)}</p></div>`).join('');
}

function injectIcons(){
  document.querySelectorAll('[data-icon]').forEach(el=>{ el.innerHTML = ICONS[el.getAttribute('data-icon')] || ''; });
}

document.addEventListener('DOMContentLoaded', ()=>{
  injectIcons();
  renderStats();
  renderMaps();
  renderContacts();
  renderAbout();
  initNav();
  initReveal();
});
