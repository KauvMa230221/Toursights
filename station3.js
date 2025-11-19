/* station2-seq.js – Quizlet-style sequential quiz
 * One question at a time → Next → Final summary
 * Hint symbol appears when user taps "Weiß ich nicht" (❓).
 * Uses existing theme/classes from station2.css (no extra CSS required).
 */

// ---------- Helpers ----------
const norm = (s) => s.toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu,'').replace(/\s+/g,' ').trim();
const equalsOneOf = (val, arr) => arr.some(v => norm(val) === norm(v));
const containsAll = (val, req) => { const n = norm(val); return req.every(r => n.includes(norm(r))); };
const $ = (id) => document.getElementById(id);

// ---------- Question bank (same content) ----------
const QUESTIONS_AK = [
  { id:'ak1', label:'Wofür können Jugendliche zur Arbeiterkammer gehen?',
    placeholders:['z. B. Arbeitsrecht'],
    check: (vals)=> equalsOneOf(vals[0], ['Arbeitsrecht','Fragen zum Arbeitsrecht','Beratung zum Arbeitsrecht']),
    correctText:'Beratung zum Arbeitsrecht',
    hints:['Thema: Rechte im Job.','Beginnt mit „A…“.'] },

  { id:'ak2', label:'Was kostet eine Beratung in der Arbeiterkammer?',
    placeholders:['z. B. kostenlos'],
    check: (vals)=> equalsOneOf(vals[0], ['kostenlos','Gratis','gratis']),
    correctText:'kostenlos',
    hints:['Kein Geld nötig.','Synonym zu „gratis“.'] },

  { id:'ak3', label:'Welche Altersgruppe wird hier angesprochen?',
    placeholders:['z. B. 15–19 Jahre'],
    check: (vals)=> equalsOneOf(vals[0], ['15-19','15–19','15 bis 19','Jugendliche 15-19']),
    correctText:'15–19 Jahre',
    hints:['Zwei Zahlen, jeweils zwischen 15 und 20.','Oberstufe.'] },

  { id:'ak4', label:'Was kann die AK für Jugendliche kontrollieren?',
    placeholders:['z. B. Arbeitsvertrag'],
    check: (vals)=> equalsOneOf(vals[0], ['Arbeitsvertrag','Vertrag','Praktikumsvertrag']),
    correctText:'Arbeitsvertrag / Praktikumsvertrag',
    hints:['Dokument, das man vor dem Arbeiten unterschreibt.','Beginnt mit „A…“.'] },

  { id:'ak5', label:'Bei welchen Problemen kann die AK helfen?',
    placeholders:['z. B. fehlender Lohn'],
    check: (vals)=> equalsOneOf(vals[0], ['fehlender Lohn','Lohnprobleme','nicht ausbezahlter Lohn']),
    correctText:'fehlender / nicht ausbezahlter Lohn',
    hints:['Es geht ums Geld.','Thema: Bezahlung.'] },

  { id:'ak6', label:'Wie heißt die Institution, die Arbeitnehmer*innen vertritt?',
    placeholders:['z. B. Arbeiterkammer'],
    check: (vals)=> equalsOneOf(vals[0], ['Arbeiterkammer','AK']),
    correctText:'Arbeiterkammer (AK)',
    hints:['Abkürzung: AK.','Vertretung der Arbeitnehmer*innen.'] },

  { id:'ak7', label:'Welche typischen Themen behandelt die AK für Jugendliche?',
    placeholders:['z. B. Arbeitszeit, Urlaub, Lohn'],
    check: (vals)=> {
      const v = norm(vals[0]);
      const must = containsAll(v, ['arbeitszeit','urlaub','lohn']);
      return must;
    },
    correctText:'Arbeitszeit, Urlaub, Lohn',
    hints:['Drei Begriffe.','Alles rund um Arbeit.'] },

  { id:'ak8', label:'Welche Art von Unterstützung bietet die AK?',
    placeholders:['z. B. kostenlose Beratung'],
    check: (vals)=> equalsOneOf(vals[0], ['kostenlose Beratung','Beratung','Rechtsberatung']),
    correctText:'kostenlose Beratung',
    hints:['Nichts kostet – alles gratis.','Hilft bei Rechtsfragen.'] },

  { id:'ak9', label:'Warum sollten Jugendliche ihre Rechte kennen?',
    placeholders:['z. B. um nicht ausgenutzt zu werden'],
    check: (vals)=> equalsOneOf(vals[0], ['um nicht ausgenutzt zu werden','damit man nicht ausgenutzt wird']),
    correctText:'Damit man nicht ausgenutzt wird',
    hints:['Schutz vor unfairer Behandlung.','Wichtig für junge Arbeitnehmer*innen.'] }
];


// ---------- State & results ----------
let idx = 0;
const results = []; // {id, value(s), ok}

// Root mount into an existing container in station2.html
// Replace the static inputs in HTML with: <section class="section"><div id="quizRoot" class="card"></div></section>

document.addEventListener('DOMContentLoaded', () => {
  const root = document.getElementById('quizRoot');
  if(!root){ console.warn('quizRoot not found. Add <div id="quizRoot" class="card"></div> to your HTML.'); return; }
  renderCurrent(root);
  const score = document.getElementById('score'); if(score) score.textContent = '';
  const year = document.getElementById('year'); if(year) year.textContent = new Date().getFullYear();
});

function renderCurrent(root){
  const q = QUESTIONS[idx];
  if(!q){ return renderSummary(root); }

  root.innerHTML = `
    <h2>Frage ${idx+1} / ${QUESTIONS.length}</h2>
    <p>${q.label}</p>
    <div class="qa">
      ${q.placeholders.map((ph,i)=>`<input id="ans${i}" type="text" placeholder="${ph}">`).join('')}
      <div class="muted" id="hintLine" style="display:none">❓ <span id="hintText"></span></div>
    </div>
    <div class="actions">
      <button class="btn" id="submitBtn">Weiter</button>
      <button class="btn btn-ghost" id="idkBtn" type="button" title="Hinweis anzeigen">❓ Weiß ich nicht</button>
    </div>
  `;

  document.getElementById('submitBtn').addEventListener('click', () => {
    const inputs = [...root.querySelectorAll('input')].map(i=> i.value);
    const ok = QUESTIONS[idx].check(inputs);
    results.push({ id: QUESTIONS[idx].id, values: inputs, ok });
    idx += 1;
    renderCurrent(root);
  });

  document.getElementById('idkBtn').addEventListener('click', () => {
    const step = Math.min( (results.filter(r=> r.id===QUESTIONS[idx].id).length), 1 );
    // show progressive hint (0 -> first, 1 -> second)
    const hint = QUESTIONS[idx].hints[Math.min(step, QUESTIONS[idx].hints.length-1)];
    const line = document.getElementById('hintLine');
    const text = document.getElementById('hintText');
    text.textContent = hint || 'Überleg noch einmal!';
    line.style.display = 'block';
  });
}

function renderSummary(root){
  // Tally
  const correct = results.filter(r=> r.ok).length;
  const total = results.length;

  // Build rows
  const rows = results.map((r,i)=>{
    const q = QUESTIONS.find(qq=> qq.id === r.id);
    const your = Array.isArray(r.values) ? r.values.join(' | ') : r.values;
    const status = r.ok ? '<span class="correct">Richtig</span>' : '<span class="incorrect">Falsch</span>';
    return `<li><strong>F${i+1}:</strong> ${status} · Deine Antwort: <em>${escapeHtml(your || '—')}</em> · Richtige Lösung: <em>${escapeHtml(q.correctText)}</em></li>`;
  }).join('');

  root.innerHTML = `
    <h2>Ergebnis</h2>
    <p class="lead">Punkte: <strong>${correct} / ${total}</strong></p>
    <ul class="muted" style="padding-left:18px">${rows}</ul>
    <div class="actions">
      <button class="btn" id="retryBtn">Nochmal starten</button>
    </div>
  `;

  document.getElementById('retryBtn').addEventListener('click', () => {
    idx = 0; results.length = 0; renderCurrent(root);
  });
}

function escapeHtml(s){
  return String(s).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;');
}
