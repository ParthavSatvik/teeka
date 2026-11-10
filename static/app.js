// Shared by the family pages: navigation, data access, the certificate and the help card.
window.Teeka = (() => {
  const $ = (id) => document.getElementById(id);
  const el = (tag, cls, text) => { const e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; };

  async function api(path, opts) {
    const r = await fetch(path, opts);
    if (!r.ok) { let m = r.statusText; try { m = (await r.json()).detail || m; } catch (e) {} throw new Error(m); }
    return r.json();
  }
  const post = (path, body) => api(path, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });

  const PAGES = [['/dashboard', 'Home'], ['/people', 'People'], ['/library', 'Library'], ['/reports', 'Reports']];
  function nav() {
    const here = location.pathname;
    $('nav').replaceChildren(...PAGES.map(([href, label]) => {
      const a = el('a', here === href ? 'on' : '', label);
      a.href = href;
      if (here === href) a.setAttribute('aria-current', 'page');
      return a;
    }));
  }

  // The header status, the same on every page.
  function paintMeters(st) {
    const cfg = st.config, pill = $('modePill');
    pill.textContent = cfg.mock ? 'Mock mode' : `Live · ${cfg.stt_model} · ${cfg.stt_mode}`;
    pill.className = 'pill' + (cfg.mock ? ' mock' : '');
    $('phonePill').textContent = st.phone_connected ? 'Phone: connected' : 'Phone: not connected';
    $('phonePill').className = 'pill' + (st.phone_connected ? '' : ' off');
    $('latency').textContent = [st.median_latency_ms != null ? `Prisma ${st.median_latency_ms} ms` : '', st.median_turn_ms != null ? `Reply to voice ${st.median_turn_ms} ms` : ''].filter(Boolean).join(' · ');
  }

  const stored = (key) => { try { return localStorage.getItem(key) || ''; } catch (e) { return ''; } };
  const STEPS = [
    ['Unexpected call', 'A stranger rings and says they are from a bank or company.', 'M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z'],
    ['Urgency', '“Do it now or something bad will happen.”', 'M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm1 11h-5v-2h3V6h2v7z'],
    ['The ask', 'An OTP, a PIN, an app to install, or money.', 'M18 8h-1V6A5 5 0 0 0 7 6v2H6a2 2 0 0 0-2 2v10c0 1.1.9 2 2 2h12a2 2 0 0 0 2-2V10a2 2 0 0 0-2-2zM9 6a3 3 0 0 1 6 0v2H9V6z'],
    ['Hang up and call back', 'Use the number on your card, or ask family.', 'M12 1 3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-2 16-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z'],
  ];
  const LOADING = '<p class="loading">Loading…</p>';
  const LEFT = `<section><h3>People</h3><ul id="railPeople"><li class="loading">Loading…</li></ul><p><a href="/people">Manage people</a></p></section>
    <section><h3>Immunity score</h3><p id="railWho" class="rail-who"></p><div class="dial"><svg viewBox="0 0 120 120" aria-hidden="true"><circle class="dial-bg" cx="60" cy="60" r="52"/><circle id="railDial" class="dial-fg" cx="60" cy="60" r="52" pathLength="100" stroke-dasharray="0 100"/></svg><span id="railImmunity" class="immunity-num">–</span></div><p class="muted">Share of their last 10 practice calls they refused or hung up on. <a href="/reports">Reports</a></p></section>
    <section><h3>Next dose</h3><div id="railNext">${LOADING}</div></section>
    <section><h3>How a scam call goes</h3><ol class="howto">${STEPS.map(([t, d, p]) => `<li><span class="ic"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="${p}"/></svg></span><b>${t}</b><small>${d}</small></li>`).join('')}</ol></section>
    <div class="rail-art otp" aria-hidden="true"></div>`;
  const RIGHT = `<section><h3>Red flags to work on</h3><div id="railFlags">${LOADING}</div></section>
    <section><h3>Scam of the week</h3><div id="railLibrary">${LOADING}</div><p><a href="/library">See all scams</a></p></section>
    <section id="railHelp"></section>
    <div class="rail-art call" aria-hidden="true"></div>`;

  function mountFrame() {
    const sheet = document.querySelector('.wrap');
    if (!sheet) return;
    const rail = (label, html) => { const a = el('aside', 'rail'); a.setAttribute('aria-label', label); a.innerHTML = html; return a; };
    const stage = el('div', 'stage');
    sheet.before(stage);
    stage.append(rail('Family', LEFT), sheet, rail('Learn', RIGHT));
    ['l', 'r'].forEach((side) => { const art = el('div', 'side-art ' + side); art.setAttribute('aria-hidden', 'true'); document.body.prepend(art); });
    nav();
    helpCard($('railHelp'));
    if ($('modePill')) return; // the dashboard paints these on its own refresh
    const meters = el('div', 'meters');
    meters.append(Object.assign(el('span', 'pill', '…'), { id: 'modePill' }), Object.assign(el('span', 'pill off', 'Phone: not connected'), { id: 'phonePill' }), Object.assign(el('span', 'muted'), { id: 'latency' }));
    document.querySelector('header.top').append(meters);
    const tick = () => api('/api/state').then(paintMeters).catch(() => {});
    tick();
    setInterval(tick, 5000);
    loadRails(stored('teeka-name'));
    scamOfWeek();
  }

  const unavailable = (id) => $(id).replaceChildren(el('p', 'empty-note', 'Not available right now.'));

  // Real results only. onPick is set on the dashboard, where choosing a person fills the form.
  async function loadRails(name, onPick) {
    try {
      const st = await api('/api/state?name=' + encodeURIComponent(name || ''));
      const who = name || st.card.name || '';
      const [people, rep] = await Promise.all([api('/api/people'), api('/api/reports' + (who ? '?name=' + encodeURIComponent(who) : ''))]);
      $('railPeople').replaceChildren(...(people.length ? people.map((p) => {
        const li = el('li'), b = el('button', 'person-row' + (p.name === who ? ' on' : ''));
        const pips = el('span', 'pips');
        for (let i = 0; i < 8; i++) pips.append(el('i', i < p.doses ? 'on' : ''));
        b.append(el('span', 'person-name', p.name), el('span', 'person-doses', `${p.doses} dose${p.doses === 1 ? '' : 's'}`), pips);
        b.onclick = () => { if (onPick) onPick(p); else location.href = '/reports?name=' + encodeURIComponent(p.name); };
        li.append(b);
        return li;
      }) : [el('li', 'empty-note', 'Nobody added yet.')]));
      $('railWho').textContent = who || 'No one chosen yet';
      $('railImmunity').textContent = rep.immunity == null ? '–' : `${rep.immunity}%`;
      $('railDial').setAttribute('stroke-dasharray', `${rep.immunity || 0} 100`);
      const nd = st.card.next_dose;
      $('railNext').replaceChildren(...(nd
        ? [el('span', 'next-date', shortDate(nd.due)), el('span', null, `“${nd.title}”, in ${nd.days} days`)]
        : [el('p', 'empty-note', 'Appears after their first practice call.')]));
      bars($('railFlags'), flagRows(rep.flags).slice(0, 5), 'Appears after their first practice call.');
    } catch (e) { ['railPeople', 'railNext', 'railFlags'].forEach(unavailable); }
  }

  // The same scam for everyone all week, taken from the library in their language.
  async function scamOfWeek(lang) {
    try {
      const code = lang || stored('teeka-lang') || 'hi-IN';
      const items = await api('/api/library?lang=' + encodeURIComponent(code));
      if (!items.length) { $('railLibrary').replaceChildren(el('p', 'empty-note', 'No scams in this language yet.')); return; }
      const s = items[Math.floor(Date.now() / (7 * 86400000)) % items.length];
      const out = [Object.assign(el('a', 'week-title', s.title), { href: '/library#' + s.fraud })];
      if (s.title !== s.title_local) { const t = el('p', 'week-local', s.title_local); t.lang = s.lang; out.push(t); }
      out.push(el('p', 'muted', `Practise saying no to: ${s.practise}`));
      const chips = el('div', 'chips');
      s.flags.slice(0, 2).forEach((f) => chips.append(el('span', 'chip still', f.en)));
      out.push(chips);
      $('railLibrary').replaceChildren(...out);
    } catch (e) { unavailable('railLibrary'); }
  }

  function helpCard(box) {
    box.replaceChildren(
      el('h3', null, 'If a real scam happened'),
      el('p', null, 'Stop paying and call your bank. Then report it straight away:'),
      Object.assign(el('a', 'help-num', 'Call 1930'), { href: 'tel:1930' }),
      Object.assign(el('a', 'help-link', 'cybercrime.gov.in'), { href: 'https://cybercrime.gov.in/', target: '_blank', rel: 'noopener' }),
      el('p', 'muted small', 'National cybercrime helpline and portal, as listed by I4C, Ministry of Home Affairs.'));
  }

  // One series: the share of times each red flag fooled them. The number sits beside the bar.
  function bars(box, rows, emptyText) {
    if (!rows.length) { box.replaceChildren(el('p', 'empty-note', emptyText)); return; }
    box.replaceChildren(...rows.map((r) => {
      const row = el('div', 'bar-row');
      row.title = r.title;
      const track = el('span', 'bar-track');
      const fill = el('i', 'bar-fill');
      fill.style.width = `${Math.max(r.pct, 2)}%`;
      track.append(fill);
      row.append(el('span', 'bar-label', r.label), track, el('span', 'bar-value', `${r.pct}%`));
      return row;
    }));
  }
  const flagRows = (flags) => flags.slice().sort((a, b) => b.pct - a.pct).map((f) => ({ label: f.en, pct: f.pct, title: `Fooled ${f.missed} of ${f.seen} times` }));

  // A share image with no name, phone number or anything said on a call.
  async function certificate(stats) {
    await document.fonts.load('48px "Tiro Devanagari Hindi"').catch(() => {});
    const W = 1200, H = 630, c = document.createElement('canvas');
    c.width = W; c.height = H;
    const g = c.getContext('2d');
    g.fillStyle = '#fbf6e9'; g.fillRect(0, 0, W, H);
    g.strokeStyle = '#0f5c4d'; g.lineWidth = 6; g.strokeRect(28, 28, W - 56, H - 56);
    g.lineWidth = 2; g.strokeRect(42, 42, W - 84, H - 84);
    g.textAlign = 'center'; g.fillStyle = '#0f5c4d';
    g.font = '76px "Tiro Devanagari Hindi", Georgia, serif'; g.fillText('Teeka टीका', W / 2, 150);
    g.fillStyle = '#55615a'; g.font = '30px Mukta, system-ui, sans-serif'; g.fillText('Scam-call vaccination card', W / 2, 200);
    g.fillStyle = '#22302b'; g.font = '50px "Tiro Devanagari Hindi", Georgia, serif';
    g.fillText(`${stats.doses} practice call${stats.doses === 1 ? '' : 's'} completed`, W / 2, 310);
    g.fillText(`${stats.protected} scam${stats.protected === 1 ? '' : 's'} refused`, W / 2, 380);
    g.save(); g.translate(W / 2, 498); g.rotate(-0.06);
    g.strokeStyle = '#0f5c4d'; g.lineWidth = 5; g.strokeRect(-210, -46, 420, 86);
    g.fillStyle = '#0f5c4d'; g.font = '800 46px Mukta, system-ui, sans-serif'; g.fillText('PRACTISED', 0, 14);
    g.restore();
    const a = el('a'); a.download = 'teeka-certificate.png';
    a.href = c.toDataURL('image/png');
    document.body.append(a); a.click(); a.remove();
    return a.href;
  }

  const shortDate = (iso) => { const [y, m, d] = iso.slice(0, 10).split('-').map(Number); return new Date(y, m - 1, d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }); };
  mountFrame();
  return { $, el, api, post, nav, helpCard, bars, flagRows, certificate, shortDate, paintMeters, loadRails, scamOfWeek };
})();
