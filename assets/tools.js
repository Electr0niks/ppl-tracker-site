/* Outils gratuits du site : calculateur 1RM, calculateur de disques, générateur de split.
   Chaque page déclare data-tool sur <body> ; la langue vient de <html lang>. Aucun appel réseau. */
(function () {
  'use strict';
  const LANG = (document.documentElement.lang || 'fr').slice(0, 2) === 'en' ? 'en' : 'fr';
  const T = {
    fr: {
      reps: (n) => n + (n > 1 ? ' reps' : ' rep'),
      est: 'Ton 1RM estimé',
      inaccurate: 'Au-delà de 10 répétitions, l\'estimation devient approximative.',
      pct: '% du 1RM', weight: 'Charge', repsCol: 'Reps possibles',
      perSide: 'Disques de chaque côté',
      total: 'Total réel',
      unreachable: (d, u) => `Impossible d'atteindre exactement ce poids avec ces disques : il manque ${d} ${u}.`,
      lessThanBar: 'Le poids visé est inférieur à celui de la barre.',
      emptyBar: 'Barre seule, aucun disque.',
      days: ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'],
      rest: 'Repos',
      labels: { push: 'Push', pull: 'Pull', legs: 'Legs', upper: 'Haut', lower: 'Bas', fb: 'Full body' },
      splits: {
        2: { name: 'Full body ×2', why: 'Avec 2 séances, chaque muscle doit être travaillé à chaque séance : le full body est le plus efficace.' },
        3: { name: 'Push Pull Legs', why: 'Une séance Push, une Pull, une Legs : chaque muscle est travaillé une fois par semaine avec beaucoup de volume. Idéal pour démarrer.' },
        4: { name: 'Haut / Bas ×2', why: 'Chaque muscle est travaillé deux fois par semaine, avec des séances plus courtes qu\'en PPL.' },
        5: { name: 'PPL + Haut / Bas', why: 'Un cycle PPL complet, puis une séance haut du corps et une bas du corps : tout est travaillé presque deux fois par semaine.' },
        6: { name: 'Push Pull Legs ×2', why: 'Le PPL complet deux fois par semaine : le maximum de volume, pour les pratiquants qui récupèrent bien.' }
      },
      beginner6: 'Débutant : 6 séances, c\'est beaucoup. Tu progresseras aussi bien avec 3 ou 4 séances au début, et tu récupéreras mieux.',
      beginner5: 'Débutant : 5 séances, c\'est possible si tu dors et manges bien. Sinon, 3 ou 4 suffisent largement.',
      programLink: 'Le programme PPL détaillé (gratuit)'
    },
    en: {
      reps: (n) => n + (n > 1 ? ' reps' : ' rep'),
      est: 'Your estimated 1RM',
      inaccurate: 'Above 10 reps, the estimate gets rough.',
      pct: '% of 1RM', weight: 'Weight', repsCol: 'Reps possible',
      perSide: 'Plates on each side',
      total: 'Actual total',
      unreachable: (d, u) => `Can't hit this weight exactly with these plates: ${d} ${u} short.`,
      lessThanBar: 'The target is lighter than the bar.',
      emptyBar: 'Empty bar, no plates.',
      days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      rest: 'Rest',
      labels: { push: 'Push', pull: 'Pull', legs: 'Legs', upper: 'Upper', lower: 'Lower', fb: 'Full body' },
      splits: {
        2: { name: 'Full body ×2', why: 'With 2 sessions, every muscle should be trained every session: full body is the most effective layout.' },
        3: { name: 'Push Pull Legs', why: 'One Push, one Pull, one Legs day: each muscle gets a high-volume session once a week. Great for getting started.' },
        4: { name: 'Upper / Lower ×2', why: 'Each muscle is trained twice a week, with shorter sessions than PPL.' },
        5: { name: 'PPL + Upper / Lower', why: 'A full PPL rotation, then an upper and a lower day: everything gets hit almost twice a week.' },
        6: { name: 'Push Pull Legs ×2', why: 'The full PPL twice a week: maximum volume, for lifters who recover well.' }
      },
      beginner6: 'Beginner: 6 sessions is a lot. You\'ll progress just as well on 3 or 4 at first, and recover better.',
      beginner5: 'Beginner: 5 sessions can work if your sleep and food are on point. Otherwise 3 or 4 is plenty.',
      programLink: 'The detailed PPL program (free)'
    }
  }[LANG];

  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const num = (v) => { const n = parseFloat(String(v).replace(',', '.')); return isFinite(n) ? n : NaN; };
  const fmt = (n, step) => {
    const r = Math.round(n / step) * step;
    return r.toLocaleString(LANG === 'fr' ? 'fr-FR' : 'en-US', { maximumFractionDigits: 2 });
  };
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

  function segment(el, onChange) {
    $$('button', el).forEach((b) => b.addEventListener('click', () => {
      $$('button', el).forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
      onChange(b.dataset.value);
    }));
    const on = $('button[aria-pressed="true"]', el);
    return on ? on.dataset.value : null;
  }

  /* ───────────── 1RM ───────────── */
  function oneRepMax() {
    let unit = segment($('#unit'), (u) => { unit = u; run(); });
    const PCTS = [[100, 1], [95, 2], [93, 3], [90, 4], [87, 5], [85, 6], [83, 7], [80, 8], [77, 9], [75, 10], [70, 12], [65, 15], [60, 20]];
    function run() {
      const w = num($('#w').value), r = Math.round(num($('#r').value));
      const out = $('#out');
      if (!(w > 0) || !(r >= 1) || r > 30) { out.hidden = true; return; }
      const epley = r === 1 ? w : w * (1 + r / 30);
      const brzycki = r === 1 ? w : w * 36 / (37 - Math.min(r, 36));
      const orm = r === 1 ? w : (epley + brzycki) / 2;
      const step = unit === 'lb' ? 1 : 0.5;
      const plateStep = unit === 'lb' ? 5 : 2.5;
      let rows = '';
      for (const [p, n] of PCTS) {
        rows += `<tr><td class="num">${p} %</td><td class="num"><strong>${fmt(orm * p / 100, plateStep)} ${unit}</strong></td><td class="num">${T.reps(n)}</td></tr>`;
      }
      out.innerHTML =
        `<div class="muted">${T.est}</div><div class="big">${fmt(orm, step)} <small>${unit}</small></div>` +
        (r > 10 ? `<p class="muted" style="margin-top:6px">${T.inaccurate}</p>` : '') +
        `<div class="table-wrap" style="margin-top:14px"><table><thead><tr><th>${T.pct}</th><th>${T.weight}</th><th>${T.repsCol}</th></tr></thead><tbody>${rows}</tbody></table></div>`;
      out.hidden = false;
    }
    ['#w', '#r'].forEach((s) => $(s).addEventListener('input', run));
    run();
  }

  /* ───────────── Disques ───────────── */
  function plates() {
    const SETS = {
      kg: { bars: [20, 15, 10], plates: [25, 20, 15, 10, 5, 2.5, 1.25], def: 100, collar: 2.5 },
      lb: { bars: [45, 35, 15], plates: [45, 35, 25, 10, 5, 2.5], def: 225, collar: 5 }
    };
    const COLORS = { 25: '#d6402e', 20: '#2f6fd6', 15: '#e8c43a', 10: '#3fa45b', 5: '#e9e4de', 2.5: '#d6402e', 1.25: '#b8b2ab', 45: '#2f6fd6', 35: '#e8c43a' };
    let unit = 'kg';

    function build() {
      const s = SETS[unit];
      $('#bar').innerHTML = s.bars.map((b, i) => `<option value="${b}"${i === 0 ? ' selected' : ''}>${b} ${unit}</option>`).join('');
      $('#avail').innerHTML = s.plates.map((p) => `<label><input type="checkbox" value="${p}" checked> ${fmt(p, 0.01)} ${unit}</label>`).join('');
      $('#target').value = s.def;
      $('#collarLabel').textContent = `${fmt(s.collar, 0.01)} ${unit}`;
      $$('#avail input').forEach((c) => c.addEventListener('change', run));
    }
    unit = segment($('#unit'), (u) => { unit = u; build(); run(); });

    function run() {
      const s = SETS[unit];
      const target = num($('#target').value), bar = num($('#bar').value);
      const collars = $('#collars').checked ? s.collar * 2 : 0;
      const out = $('#out');
      if (!(target > 0)) { out.hidden = true; return; }
      const base = bar + collars;
      if (target < base) { out.innerHTML = `<p>${T.lessThanBar}</p>`; out.hidden = false; return; }
      const avail = $$('#avail input:checked').map((c) => num(c.value)).sort((a, b) => b - a);
      let side = (target - base) / 2;
      const used = [];
      for (const p of avail) { while (side >= p - 1e-9) { used.push(p); side -= p; } }
      const missing = Math.round(side * 2 * 100) / 100;
      const total = target - missing;
      const maxPlate = Math.max(...s.plates);
      const plateHtml = (p) => {
        const h = 40 + 70 * (p / maxPlate), w = 10 + 10 * (p / maxPlate);
        return `<div class="plate" style="height:${h}px;width:${w}px;background:${COLORS[p] || '#999'}" title="${p} ${unit}"></div>`;
      };
      const left = used.slice().reverse().map(plateHtml).join('');
      const right = used.map(plateHtml).join('');
      const counts = {};
      used.forEach((p) => { counts[p] = (counts[p] || 0) + 1; });
      const list = Object.keys(counts).map(Number).sort((a, b) => b - a)
        .map((p) => `<li><strong>${counts[p]} × ${fmt(p, 0.01)} ${unit}</strong></li>`).join('');
      out.innerHTML =
        `<div class="muted">${T.perSide}</div>` +
        (used.length ? `<ul class="list" style="margin:6px 0 0">${list}</ul>` : `<p>${T.emptyBar}</p>`) +
        `<div class="bar-visual" aria-hidden="true">${left}<div class="sleeve" style="width:120px"></div>${right}</div>` +
        `<p class="muted">${T.total}${LANG === 'fr' ? ' :' : ':'} <strong style="color:var(--text)">${fmt(total, 0.01)} ${unit}</strong></p>` +
        (missing > 0 ? `<p style="color:#ff8a73;margin-top:6px">${T.unreachable(fmt(missing, 0.01), unit)}</p>` : '');
      out.hidden = false;
    }
    build();
    ['#target', '#bar', '#collars'].forEach((s) => { $(s).addEventListener('input', run); $(s).addEventListener('change', run); });
    run();
  }

  /* ───────────── Split ───────────── */
  function split() {
    const PLANS = {
      2: ['fb', 0, 0, 'fb', 0, 0, 0],
      3: ['push', 0, 'pull', 0, 'legs', 0, 0],
      4: ['upper', 'lower', 0, 'upper', 'lower', 0, 0],
      5: ['push', 'pull', 'legs', 0, 'upper', 'lower', 0],
      6: ['push', 'pull', 'legs', 'push', 'pull', 'legs', 0]
    };
    const CLS = { push: 'push', pull: 'pull', legs: 'legs', upper: 'push', lower: 'legs', fb: 'pull' };
    let days = segment($('#days'), (d) => { days = d; run(); });
    let level = segment($('#level'), (l) => { level = l; run(); });
    function run() {
      const plan = PLANS[days];
      const info = T.splits[days];
      const cells = plan.map((k, i) => `<div class="card" style="padding:10px;text-align:center">
          <div class="muted" style="font-size:13px">${T.days[i]}</div>
          ${k ? `<span class="tag ${CLS[k]}" style="display:inline-block;margin-top:6px">${esc(T.labels[k])}</span>` : `<div class="muted" style="margin-top:6px">${T.rest}</div>`}
        </div>`).join('');
      let warn = '';
      if (level === 'beg' && days == 6) warn = T.beginner6;
      if (level === 'beg' && days == 5) warn = T.beginner5;
      const prog = $('body').dataset.program;
      $('#out').innerHTML =
        `<div class="big" style="font-size:30px">${esc(info.name)}</div>` +
        `<p style="margin:8px 0 14px">${esc(info.why)}</p>` +
        `<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(78px,1fr));gap:8px">${cells}</div>` +
        (warn ? `<p style="margin-top:14px;color:var(--soft)">${esc(warn)}</p>` : '') +
        (prog && plan.includes('push') ? `<p style="margin-top:14px"><a href="${prog}">${T.programLink} →</a></p>` : '');
      $('#out').hidden = false;
    }
    run();
  }

  const tool = document.body.dataset.tool;
  if (tool === '1rm') oneRepMax();
  if (tool === 'plates') plates();
  if (tool === 'split') split();
})();
