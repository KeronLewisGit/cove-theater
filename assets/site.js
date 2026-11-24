/* Cove Movie Theater preview.
   The week's listing lives in ONE place (WEEK below). Change it each Wednesday and every page updates.
   Source for this sample week: Cove's own "Now Showing" post of 18 Nov 2026.
   `yt` is the official trailer on YouTube (studio or distributor channel); the still comes from the same video. */
const PRICE = 2700;                 // J$, all shows
const WA = '18764728044';
const TZ = 'America/Jamaica';       // every "today" and "starts in" is worked out in Jamaica time
const WEEK = {
  from: '2026-11-18', to: '2026-11-24',
  films: [
    { id: 'wicker', title: 'Wicker', rating: 'NR', tag: 'Evening show', yt: '3FqCH-Q_3TM', cast: 'With Olivia Colman and Alexander Skarsgård',
      shows: { '2026-11-18': ['6:00 PM'], '2026-11-19': ['6:00 PM'], '2026-11-20': ['6:00 PM'], '2026-11-21': ['6:50 PM'], '2026-11-22': ['6:50 PM'], '2026-11-23': ['6:00 PM'], '2026-11-24': ['6:00 PM'] } },
    { id: 'bank', title: 'How to Rob a Bank', rating: 'NR', tag: 'Late show', yt: 'ORxw68y3lyw', cast: 'With Nicholas Hoult',
      shows: { '2026-11-18': ['8:00 PM'], '2026-11-19': ['8:00 PM'], '2026-11-20': ['8:00 PM'], '2026-11-21': ['8:50 PM'], '2026-11-22': ['8:50 PM'], '2026-11-23': ['8:00 PM'], '2026-11-24': ['8:00 PM'] } },
    { id: 'cat', title: 'The Cat in the Hat', rating: 'U', tag: 'Family matinee', yt: 'jz8pLlPhSeY', cast: 'The Dr. Seuss classic, animated',
      shows: { '2026-11-21': ['2:00 PM'], '2026-11-22': ['2:00 PM'] } },
    { id: 'wildwood', title: 'Wildwood', rating: 'T 16', tag: 'Weekend matinee', yt: 'dtr5JL1zkiM', cast: 'From LAIKA, with Carey Mulligan',
      shows: { '2026-11-21': ['4:15 PM'], '2026-11-22': ['4:15 PM'] } },
  ],
};
const SOON = { title: 'Avengers: Doomsday', yt: 'irVNGjRFZGk', opens: '2026-12-18T05:00:00Z' }; // midnight in Jamaica

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const calm = matchMedia('(prefers-reduced-motion: reduce)').matches;
const iso = d => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
const parse = s => { const [y, m, d] = s.split('-').map(Number); return new Date(y, m - 1, d); };
const money = n => 'J$' + n.toLocaleString('en-US');
const mins = t => { const [, h, m, ap] = t.match(/(\d+):(\d+) (AM|PM)/); return ((+h % 12) + (ap === 'PM' ? 12 : 0)) * 60 + +m; };
const label = (d, o) => parse(d).toLocaleDateString('en-GB', o);
const still = id => `https://i.ytimg.com/vi/${id}/maxresdefault.jpg`;
const film = id => WEEK.films.find(f => f.id === id);

function nowJ() {
  const p = Object.fromEntries(new Intl.DateTimeFormat('en-CA', { timeZone: TZ, year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).formatToParts(new Date()).map(x => [x.type, x.value]));
  return { date: `${p.year}-${p.month}-${p.day}`, mins: +p.hour * 60 + +p.minute };
}
function days() { const out = []; for (let d = parse(WEEK.from); d <= parse(WEEK.to); d.setDate(d.getDate() + 1)) out.push(iso(d)); return out; }
function showsOn(d) { return WEEK.films.flatMap(f => (f.shows[d] || []).map(time => ({ time, film: f }))).sort((a, b) => mins(a.time) - mins(b.time)); }
// Today (Jamaica) if it is inside the listed week. Once the listed week has passed (a preview nobody has
// updated yet), show the same weekday from that listing and label it as a sample, so the page is never empty.
const stale = () => !days().includes(nowJ().date);
function activeDay() { const t = nowJ().date; if (!stale()) return t; const wd = parse(t).getDay(); return days().find(d => parse(d).getDay() === wd) || WEEK.from; }
function nextShow() { const n = nowJ(); return days().includes(n.date) ? showsOn(n.date).find(s => mins(s.time) > n.mins) : null; }
const wait = m => (m >= 60 ? `${Math.floor(m / 60)}h ${String(m % 60).padStart(2, '0')}m` : `${m} min`);
function status(s, d) {
  const n = nowJ(); if (d !== n.date) return '';
  const left = mins(s.time) - n.mins, nx = nextShow();
  if (left <= 0) return '<span class="st past">Started</span>';
  return nx && nx.time === s.time && nx.film === s.film ? `<span class="st next">Next · in ${wait(left)}</span>` : '<span class="st">Later today</span>';
}
// "6:00 PM weekdays, 6:50 PM Sat & Sun"
function timeGroups(f) {
  const by = {}; Object.entries(f.shows).forEach(([d, ts]) => ts.forEach(t => (by[t] = by[t] || []).push(parse(d).getDay())));
  return Object.entries(by).sort((a, b) => mins(a[0]) - mins(b[0])).map(([t, ds]) => {
    const wk = ds.every(x => x === 0 || x === 6), wd = ds.every(x => x > 0 && x < 6);
    return { t, when: wk ? 'Sat & Sun' : wd ? 'Weekdays' : 'Daily' };
  });
}
const playBtn = (f, text = 'Watch trailer') => `<button class="play" type="button" data-trailer="${f.yt}" data-title="${f.title}"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5.5v13l11-6.5z" fill="currentColor"/></svg>${text}</button>`;

/* ---------- shared chrome ---------- */
function chrome() {
  const b = $('.menu-btn'), n = $('nav.main');
  if (b) {
    const set = o => { n.classList.toggle('open', o); b.setAttribute('aria-expanded', String(o)); };
    b.addEventListener('click', () => set(!n.classList.contains('open')));
    document.addEventListener('keydown', e => { if (e.key === 'Escape') set(false); });
  }
  const wk = `${label(WEEK.from, { weekday: 'short', day: 'numeric', month: 'short' })} to ${label(WEEK.to, { weekday: 'short', day: 'numeric', month: 'short' })}`;
  $$('[data-week]').forEach(el => { el.textContent = wk; });
  $$('[data-price]').forEach(el => { el.textContent = money(PRICE); });
  const chip = $('#next-chip');
  const tick = () => {
    if (!chip) return; const nx = nextShow(), n = nowJ();
    chip.innerHTML = nx ? `<i class="live"></i><span>Next show: <b>${nx.film.title}</b>, ${nx.time} · in ${wait(mins(nx.time) - n.mins)}</span>` : `<span>${stale() ? 'Sample listing' : 'This week'}: ${wk}</span>`;
  };
  tick(); setInterval(tick, 30000);
  // ticker: film titles on a loop
  $$('.ticker .track').forEach(t => {
    const one = WEEK.films.map(f => `<span>${f.title}</span><i>★</i>`).join('') + `<span class="alt">All shows ${money(PRICE)}</span><i>★</i><span class="alt">Coming 18 Dec: ${SOON.title}</span><i>★</i>`;
    t.innerHTML = `<div>${one}</div><div aria-hidden="true">${one}</div>`;
  });
  // back-to-top reel that turns as the page scrolls
  const reel = $('.reel');
  if (reel) {
    let raf = 0;
    addEventListener('scroll', () => { if (raf) return; raf = requestAnimationFrame(() => { raf = 0; reel.classList.toggle('show', scrollY > 700); reel.style.setProperty('--turn', (scrollY / 4) + 'deg'); }); }, { passive: true });
    reel.addEventListener('click', () => scrollTo({ top: 0, behavior: calm ? 'auto' : 'smooth' }));
  }
  const flag = $('.preview-flag button'); if (flag) flag.addEventListener('click', () => flag.parentElement.remove());
  $$('[data-copy]').forEach(c => c.addEventListener('click', async () => {
    try { await navigator.clipboard.writeText(c.dataset.copy); const o = c.textContent; c.textContent = 'Address copied'; setTimeout(() => { c.textContent = o; }, 1800); } catch (e) { /* clipboard blocked: leave the button as it is */ }
  }));
  const dt = $('form.ask input[type=date]'); if (dt) dt.min = nowJ().date;
}

/* ---------- curtain intro (once per visit) + headline reveal ---------- */
function intro() {
  const root = document.documentElement;
  $$('[data-split]').forEach(h => {
    [...h.childNodes].forEach(node => {
      if (node.nodeType === 3) {
        const frag = document.createDocumentFragment();
        node.textContent.split(/(\s+)/).forEach(w => { if (!w.trim()) { frag.append(' '); return; } const o = document.createElement('span'); o.className = 'w'; o.innerHTML = `<span>${w}</span>`; frag.append(o); });
        node.replaceWith(frag);
      } else { const o = document.createElement('span'); o.className = 'w'; node.replaceWith(o); o.append(node); }
    });
    $$('.w > *', h).forEach((s, i) => s.style.setProperty('--i', i));
  });
  let seen = true; try { seen = !!sessionStorage.getItem('cove-intro'); sessionStorage.setItem('cove-intro', '1'); } catch (e) { /* storage blocked: skip the intro */ }
  if (seen || calm) { root.classList.add('ready'); return; }
  const c = document.createElement('div'); c.className = 'intro'; c.setAttribute('aria-hidden', 'true');
  c.innerHTML = '<div class="drape l"></div><div class="drape r"></div><img src="assets/cove-logo.png" alt="">';
  document.body.append(c);
  requestAnimationFrame(() => setTimeout(() => { c.classList.add('open'); root.classList.add('ready'); }, 450));
  setTimeout(() => c.remove(), 2400);
}

/* ---------- home: the marquee sign ---------- */
function scramble(el) {
  const txt = el.dataset.t, abc = 'ABCDEFGHIJKLMNOPRSTUVWY'; let f = 0; const total = 16;
  if (calm) { el.textContent = txt; return; }
  const id = setInterval(() => {
    f++; el.textContent = [...txt].map((ch, i) => (ch === ' ' || i < (f / total) * txt.length ? ch : abc[Math.random() * abc.length | 0])).join('');
    if (f >= total) { clearInterval(id); el.textContent = txt; }
  }, 45);
}
function bulbs(el) {
  const box = $('.bulbs', el); if (!box) return;
  const draw = () => {
    const w = el.offsetWidth, h = el.offsetHeight, m = 13, g = 28, nx = Math.max(2, Math.round((w - 2 * m) / g)), ny = Math.max(2, Math.round((h - 2 * m) / g)), pts = [];
    for (let i = 0; i < nx; i++) pts.push([m + (w - 2 * m) * i / nx, m]);
    for (let i = 0; i < ny; i++) pts.push([w - m, m + (h - 2 * m) * i / ny]);
    for (let i = 0; i < nx; i++) pts.push([w - m - (w - 2 * m) * i / nx, h - m]);
    for (let i = 0; i < ny; i++) pts.push([m, h - m - (h - 2 * m) * i / ny]);
    box.innerHTML = pts.map((p, i) => `<i style="left:${p[0].toFixed(1)}px;top:${p[1].toFixed(1)}px;animation-delay:${-(i % 3) * 0.3}s"></i>`).join('');
  };
  draw(); new ResizeObserver(draw).observe(el);
}
function sign() {
  const box = $('#tonight'); if (!box) return;
  const d = activeDay(), today = d === nowJ().date, list = showsOn(d);
  box.innerHTML = `<div class="bulbs" aria-hidden="true"></div><div class="board">
    <div class="sign-head"><b>${today ? 'Today at Cove' : label(d, { weekday: 'long' }) + 's at Cove'}</b><span>${today ? label(d, { weekday: 'short', day: 'numeric', month: 'short' }) : 'Sample listing'}</span></div>
    ${list.map((s, i) => `<a class="sign-row" href="showtimes.html#${s.film.id}" aria-label="${s.time}, ${s.film.title}, rated ${s.film.rating}"><span class="tm">${s.time.replace(' ', '')}</span><span class="ttl" data-t="${s.film.title.toUpperCase()}" aria-hidden="true">${s.film.title.toUpperCase()}</span><span class="stx" data-i="${i}"></span></a>`).join('') || '<p class="sign-none">No shows listed for this day.</p>'}
    <div class="sign-foot">All shows ${money(PRICE)}<a href="showtimes.html">Full week →</a></div></div>`;
  const upd = () => $$('.stx', box).forEach(el => { el.innerHTML = status(list[+el.dataset.i], d) || `<span class="st">Rated ${list[+el.dataset.i].film.rating}</span>`; });
  upd(); setInterval(upd, 30000); bulbs(box);
  setTimeout(() => $$('.ttl', box).forEach((t, i) => setTimeout(() => scramble(t), i * 220)), 900);
}

/* ---------- home: hero trailer playing silently behind the headline ---------- */
function heroVideo() {
  const media = $('.hero-media'); if (!media) return;
  const nx = nextShow(), f = nx ? nx.film : (showsOn(activeDay())[0] || { film: WEEK.films[0] }).film;
  $('img', media).src = still(f.yt);
  const cap = $('#hero-cap'); if (cap) cap.innerHTML = `<span>On screen</span><b>${f.title}</b>${playBtn(f, 'Play trailer with sound')}`;
  const slow = navigator.connection && navigator.connection.saveData;
  if (calm || slow || innerWidth < 760) return;
  const fr = document.createElement('iframe');
  fr.title = ''; fr.tabIndex = -1; fr.setAttribute('aria-hidden', 'true'); fr.allow = 'autoplay; encrypted-media'; fr.loading = 'eager';
  fr.src = `https://www.youtube-nocookie.com/embed/${f.yt}?autoplay=1&mute=1&controls=0&loop=1&playlist=${f.yt}&playsinline=1&rel=0&start=6&enablejsapi=1&disablekb=1&iv_load_policy=3&fs=0`;
  media.append(fr);
  const say = o => fr.contentWindow && fr.contentWindow.postMessage(JSON.stringify(o), '*');
  fr.addEventListener('load', () => say({ event: 'listening', id: 1, channel: 'widget' }));
  addEventListener('message', e => {
    if (e.source !== fr.contentWindow) return;
    try { const m = JSON.parse(e.data); if (m.info && m.info.playerState === 1) setTimeout(() => media.classList.add('playing'), 900); } catch (err) { /* not a player message */ }
  });
  const tg = $('#hero-pause');
  if (tg) { tg.hidden = false; tg.addEventListener('click', () => { const off = tg.getAttribute('aria-pressed') === 'true'; say({ event: 'command', func: off ? 'playVideo' : 'pauseVideo', args: [] }); tg.setAttribute('aria-pressed', String(!off)); tg.textContent = off ? 'Pause background video' : 'Play background video'; }); }
  // stop the background reel while a trailer is open or the tab is hidden
  document.addEventListener('trailer', e => say({ event: 'command', func: e.detail ? 'pauseVideo' : 'playVideo', args: [] }));
}

/* ---------- home: film strip ---------- */
function strip() {
  const box = $('#films'); if (!box) return;
  box.innerHTML = WEEK.films.map((f, i) => `<article class="frame" data-r style="--d:${i * 90}ms">
    <button class="still" type="button" data-trailer="${f.yt}" data-title="${f.title}" aria-label="Play the ${f.title} trailer">
      <img src="${still(f.yt)}" alt="" loading="lazy"><span class="no">${String(i + 1).padStart(2, '0')}A</span><span class="tag">${f.tag}</span>
      <span class="go"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5.5v13l11-6.5z" fill="currentColor"/></svg></span></button>
    <div class="meta"><div><h3>${f.title}</h3><p>${f.cast} · Rated ${f.rating}</p><a href="showtimes.html#${f.id}">All dates →</a></div>
      <ul class="times">${timeGroups(f).map(g => `<li><b>${g.t}</b><span>${g.when}</span></li>`).join('')}</ul></div></article>`).join('');
}

/* ---------- showtimes page ---------- */
function schedule() {
  const tabs = $('#days'), out = $('#sched'); if (!tabs || !out) return;
  let current = activeDay();
  const draw = () => {
    const n = nowJ().date;
    tabs.innerHTML = days().map(d => `<button class="day" type="button" data-d="${d}" aria-pressed="${d === current}">${d === n ? 'Today' : label(d, { weekday: 'short' })}<b>${parse(d).getDate()}</b></button>`).join('');
    const list = showsOn(current);
    out.innerHTML = list.length ? list.map((s, i) => `<div class="tk" style="--d:${i * 70}ms"><div class="tk-time"><b>${s.time.split(' ')[0]}</b><span>${s.time.split(' ')[1]}</span></div>
      <button class="tk-still" type="button" data-trailer="${s.film.yt}" data-title="${s.film.title}" aria-label="Play the ${s.film.title} trailer"><img src="${still(s.film.yt)}" alt="" loading="lazy"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5.5v13l11-6.5z" fill="currentColor"/></svg></button>
      <div class="tk-main"><h3>${s.film.title}<span class="rate">${s.film.rating}</span></h3><p>${s.film.cast}</p>${status(s, current)}</div>
      <div class="tk-stub"><b>${money(PRICE)}</b><span>per ticket</span></div></div>`).join('') : '<p class="sign-none">No shows listed for this day.</p>';
    $('#sched-title').textContent = label(current, { weekday: 'long', day: 'numeric', month: 'long' });
    const on = $('.day[aria-pressed="true"]', tabs); if (on) tabs.scrollLeft = on.offsetLeft - (tabs.clientWidth - on.offsetWidth) / 2; // keep the chosen day in view on phones
  };
  tabs.addEventListener('click', e => { const b = e.target.closest('.day'); if (b && b.dataset.d !== current) { current = b.dataset.d; draw(); $(`.day[data-d="${current}"]`, tabs).focus(); } });
  draw(); setInterval(() => { if (current === nowJ().date) $$('.tk-main .st', out).forEach((el, i) => { el.outerHTML = status(showsOn(current)[i], current); }); }, 30000);
}
function grid() {
  const t = $('#weekgrid'); if (!t) return; const n = nowJ().date, ds = days();
  t.innerHTML = `<thead><tr><th scope="col">Film</th>${ds.map(d => `<th scope="col"${d === n ? ' class="now"' : ''}>${label(d, { weekday: 'short' })}<b>${parse(d).getDate()}</b></th>`).join('')}</tr></thead><tbody>`
    + WEEK.films.map(f => `<tr id="${f.id}"><th scope="row">${f.title}<span>Rated ${f.rating}</span></th>${ds.map(d => `<td${d === n ? ' class="now"' : ''}>${(f.shows[d] || []).map(x => `<b>${x.replace(' PM', '').replace(' AM', '')}</b><small>${x.slice(-2)}</small>`).join('') || '<i aria-label="No show">·</i>'}</td>`).join('')}</tr>`).join('') + '</tbody>';
}

/* ---------- coming soon countdown ---------- */
function soon() {
  const box = $('#countdown'); if (!box) return;
  const img = $('#soon-still'); if (img) img.src = still(SOON.yt);
  const pb = $('#soon-play'); if (pb) pb.innerHTML = playBtn(SOON);
  const end = new Date(SOON.opens).getTime();
  const tick = () => {
    let s = Math.max(0, Math.floor((end - Date.now()) / 1000));
    if (!s) { box.innerHTML = '<p class="open-now">Now showing. See this week\'s times.</p>'; return; }
    const parts = [['days', Math.floor(s / 86400)], ['hours', Math.floor(s % 86400 / 3600)], ['min', Math.floor(s % 3600 / 60)], ['sec', s % 60]];
    if (!box.children.length) box.innerHTML = parts.map(p => `<div class="cd"><b data-u="${p[0]}"></b><span>${p[0]}</span></div>`).join('');
    parts.forEach(p => { const el = $(`[data-u="${p[0]}"]`, box), v = String(p[1]).padStart(2, '0'); if (el.textContent !== v) { el.textContent = v; if (!calm) el.animate([{ transform: 'translateY(-35%)', opacity: 0 }, { transform: 'none', opacity: 1 }], { duration: 320, easing: 'cubic-bezier(.2,.8,.2,1)' }); } });
  };
  tick(); setInterval(tick, 1000);
}

/* ---------- 120 seats ---------- */
function seats() {
  $$('.seats').forEach(box => {
    let h = '';
    for (let r = 0; r < 10; r++) { h += '<div class="srow">'; for (let c = 0; c < 12; c++) { const off = Math.abs(c - 5.5); h += `<i style="--i:${r * 12 + c};--y:${(off * off * 0.5).toFixed(1)}px"${c === 5 ? ' class="aisle"' : ''}></i>`; } h += '</div>'; }
    box.insertAdjacentHTML('beforeend', h);
  });
}

/* ---------- letter board: each letter sits a little unevenly, like a real one ---------- */
function board() {
  $$('.felt [data-letters]').forEach((li, r) => {
    const txt = li.textContent; li.setAttribute('aria-label', txt);
    li.innerHTML = [...txt].map((ch, i) => (ch === ' ' ? '<span class="sp" aria-hidden="true"></span>' : `<span aria-hidden="true" style="--r:${(((i * 7 + r * 13) % 9) - 4) * 0.55}deg;--y:${((i * 5 + r * 3) % 5) - 2}px;--i:${i + r * 4}">${ch}</span>`)).join('');
  });
}

/* ---------- scroll reveals and count-ups ---------- */
function reveal() {
  const els = $$('[data-r]');
  if (!('IntersectionObserver' in window) || calm) { els.forEach(e => e.classList.add('in')); $$('[data-count]').forEach(e => { e.textContent = e.dataset.count; }); return; }
  const io = new IntersectionObserver(es => es.forEach(e => {
    if (!e.isIntersecting) return; io.unobserve(e.target); e.target.classList.add('in');
    $$('[data-count]', e.target).concat(e.target.matches('[data-count]') ? [e.target] : []).forEach(c => {
      const to = +c.dataset.count, t0 = performance.now(), dur = 1500;
      const step = t => { const k = Math.min(1, (t - t0) / dur); c.textContent = Math.round(to * (1 - Math.pow(1 - k, 3))); if (k < 1) requestAnimationFrame(step); };
      requestAnimationFrame(step);
    });
  }), { threshold: 0.18, rootMargin: '0px 0px -6% 0px' });
  els.forEach(e => io.observe(e));
}

/* ---------- trailer player: a dialog with curtains that part ---------- */
function trailers() {
  const dlg = document.createElement('dialog'); dlg.className = 'trailer'; dlg.setAttribute('aria-label', 'Trailer');
  dlg.innerHTML = '<div class="screen"><div class="vid"></div><div class="tc l" aria-hidden="true"></div><div class="tc r" aria-hidden="true"></div></div><div class="tbar"><b></b><a href="showtimes.html">See showtimes</a><button type="button" class="x">Close</button></div>';
  document.body.append(dlg);
  const shut = () => dlg.close();
  $('.x', dlg).addEventListener('click', shut);
  dlg.addEventListener('click', e => { if (e.target === dlg) shut(); });
  dlg.addEventListener('close', () => { $('.vid', dlg).innerHTML = ''; document.dispatchEvent(new CustomEvent('trailer', { detail: false })); });
  document.addEventListener('click', e => {
    const b = e.target.closest('[data-trailer]'); if (!b) return;
    $('.tbar b', dlg).textContent = b.dataset.title + ' · official trailer';
    $('.vid', dlg).innerHTML = `<iframe src="https://www.youtube-nocookie.com/embed/${b.dataset.trailer}?autoplay=1&rel=0&playsinline=1" title="${b.dataset.title} trailer" allow="autoplay; encrypted-media; fullscreen" allowfullscreen></iframe>`;
    document.dispatchEvent(new CustomEvent('trailer', { detail: true }));
    dlg.showModal();
  });
}

/* ---------- enquiry form: opens WhatsApp with the message filled in ---------- */
function forms() {
  $$('form.ask').forEach(f => f.addEventListener('submit', e => {
    e.preventDefault();
    const v = n => (f.elements[n] ? f.elements[n].value.trim() : '');
    const lines = [`Hello Cove, my name is ${v('name')}.`, `Enquiry: ${v('type')}`, v('date') && `Date: ${v('date')}`, v('size') && `Group size: ${v('size')}`, v('message')].filter(Boolean);
    window.open(`https://wa.me/${WA}?text=${encodeURIComponent(lines.join('\n'))}`, '_blank', 'noopener');
  }));
}

document.addEventListener('DOMContentLoaded', () => {
  [chrome, intro, sign, heroVideo, strip, schedule, grid, soon, seats, board, trailers, forms, reveal].forEach(fn => { try { fn(); } catch (err) { console.error('[cove]', fn.name, err); } });
  // a film linked from the home page (#wicker) lands on its row in the week table
  if (location.hash && $(location.hash)) setTimeout(() => $(location.hash).scrollIntoView({ block: 'center' }), 60);
});
