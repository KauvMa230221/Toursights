/* station2.js – Quizlet-style sequential quiz
 * Eine Frage nach der anderen → Weiter → Zusammenfassung
 * "Weiß ich nicht" zeigt Hinweise (❓).
 */

// ---------- Helpers ----------
const norm = (s) =>
  s
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .replace(/\s+/g, ' ')
    .trim();

const equalsOneOf = (val, arr) => arr.some((v) => norm(val) === norm(v));

const containsAll = (val, req) => {
  const n = norm(val);
  return req.every((r) => n.includes(norm(r)));
};

// ---------- Question bank ----------
const QUESTIONS = [
  {
    id: 'q1',
    label: 'Wo befindet sich die mechanische Klangfabrik?',
    placeholders: ['z. B. Haslach'],
    check: (vals) => equalsOneOf(vals[0], ['Haslach']),
    correctText: 'Haslach',
    hints: ['Ortsname im Mühlviertel.', 'Beginnt mit H, 7 Buchstaben.']
  },
  {
    id: 'q2',
    label: 'Von wo kamen die Hoflieferanten der mechanischen Klangfabrik?',
    placeholders: ['z. B. Aus dem Englischen Königshaus'],
    check: (vals) =>
      equalsOneOf(vals[0], [
        'Aus dem Englischen Königshaus',
        'Englisches Königshaus'
      ]),
    correctText: 'Aus dem Englischen Königshaus',
    hints: ['Königliche Herkunft.', 'Land: England.']
  },
  {
    id: 'q3',
    label: 'Welche KI-generierten Visualisierungen gibt es hier?',
    placeholders: ['z. B. Musik'],
    check: (vals) =>
      equalsOneOf(vals[0], ['Musik', 'Musikvisualisierungen', 'KI Musik']),
    correctText: 'Musik (KI-Musikvisualisierungen)',
    hints: ['KI-generierte ___visualisierungen.', 'Man hört es – beginnt mit M.']
  },
  {
    id: 'q4',
    label: 'Zu welcher Ausstellung gehört der Klavierstimmer?',
    placeholders: ['z. B. AI x Music'],
    check: (vals) =>
      equalsOneOf(vals[0], ['AI x Music', 'AI×Music', 'AI x music']),
    correctText: 'AI x Music',
    hints: ['Titel mit „AI“.', 'AI × ____ (Musik).']
  },
  {
    id: 'q5',
    label: 'Wie heißt das Klavier (10 Melodien, 1900, Frankreich)?',
    placeholders: ['z. B. Walzenklavier'],
    check: (vals) => equalsOneOf(vals[0], ['Walzenklavier']),
    correctText: 'Walzenklavier',
    hints: ['Mechanik, spielt 10 Melodien.', 'Endet auf …klavier.']
  },
  {
    id: 'q6',
    label: 'Connected Earth: Wie heißt die „Kugel“ (Titel + Künstler*in)?',
    placeholders: ['Titel z. B. Ex.A.R.U.', 'Künstler*in z. B. Dorotea Dolinšek'],
    check: (vals) =>
      equalsOneOf(vals[0], [
        'Ex.A.R.U.',
        'Ex A R U',
        'ExARU',
        'Exo Auxiliary Respiratory Unit',
        'Exo-Auxiliary Respiratory Unit'
      ]) &&
      equalsOneOf(vals[1], ['Dorotea Dolinsek', 'Dorotea Dolinšek']),
    correctText:
      'Ex.A.R.U. – Exo Auxiliary Respiratory Unit (Dorotea Dolinšek)',
    hints: [
      'Akronym, auch „Exo Auxiliary Respiratory Unit“.',
      'Initialen D.D.'
    ]
  },
  {
    id: 'q7',
    label: 'Wie heißt das Projekt der Geosocial-AI Forschungsgruppe?',
    placeholders: ['z. B. DEGENET'],
    check: (vals) => equalsOneOf(vals[0], ['DEGENET']),
    correctText:
      'DEGENET (Stationsname: Conspiracies in Virtual and Geographic Space)',
    hints: ['7 Buchstaben.', 'Beginnt mit DE…']
  },
  {
    id: 'q8',
    label:
      'I Need More Space: Interaktive Installation zu Farbabstufungen (Korallenriffe)?',
    placeholders: ['z. B. FadingColours'],
    check: (vals) =>
      equalsOneOf(vals[0], [
        'FadingColours',
        'Fading Colours',
        'FadingColors'
      ]),
    correctText: 'FadingColours',
    hints: [
      'Englischer Titel, zwei Wörter.',
      'Fading ____ (britische Schreibweise).'
    ]
  },
  {
    id: 'q9',
    label: 'ESERO Austria: Nenne drei Schlagwörter (Space + Education + …).',
    placeholders: ['z. B. Space, Education, Science'],
    check: (vals) => {
      const v = vals[0];
      const must = containsAll(v, ['space', 'education']);
      const extra = ['science', 'stem', 'science & technology', 'science and technology']
        .some((k) => norm(v).includes(norm(k)));
      return must && extra;
    },
    correctText: 'Beispiel: Space, Education, Science',
    hints: [
      'Muss „Space“ und „Education“ enthalten.',
      'Drittes z. B. „Science“ oder „STEM“.'
    ]
  }
];

// ---------- State ----------
let idx = 0;          // aktuelle Frage
const results = [];   // {id, values, ok}

// ---------- Init ----------
document.addEventListener('DOMContentLoaded', () => {
  const root = document.getElementById('quizRoot');
  if (!root) {
    console.warn(
      'quizRoot nicht gefunden. Füge <div id="quizRoot" class="card"></div> in dein HTML ein.'
    );
    return;
  }
  renderCurrent(root);

  const year = document.getElementById('year');
  if (year) year.textContent = new Date().getFullYear();
});

// ---------- Rendering ----------
function renderCurrent(root) {
  const q = QUESTIONS[idx];
  if (!q) {
    return renderSummary(root);
  }

  root.innerHTML = `
    <h2>Frage ${idx + 1} / ${QUESTIONS.length}</h2>
    <p>${q.label}</p>
    <div class="qa">
      ${q.placeholders
        .map(
          (ph, i) =>
            `<input id="ans${i}" type="text" placeholder="${ph}">`
        )
        .join('')}
      <div class="muted" id="hintLine" style="display:none">
         <span id="hintText"></span>
      </div>
    </div>
    <div class="actions">
      <button class="btn" id="submitBtn" type="button">Weiter</button>
      <button class="btn btn-ghost" id="idkBtn" type="button" title="Hinweis anzeigen">
         Weiß ich nicht
      </button>
    </div>
  `;

  const submitBtn = document.getElementById('submitBtn');
  const idkBtn = document.getElementById('idkBtn');

  let hintIndex = 0;

  submitBtn.addEventListener('click', () => {
    const inputs = [...root.querySelectorAll('input')].map((i) => i.value);
    const ok = QUESTIONS[idx].check(inputs);
    results.push({ id: QUESTIONS[idx].id, values: inputs, ok });
    idx += 1;
    renderCurrent(root);
  });

  idkBtn.addEventListener('click', () => {
    const hintLine = document.getElementById('hintLine');
    const hintText = document.getElementById('hintText');
    const hints = QUESTIONS[idx].hints || [];
    const hint =
      hints[Math.min(hintIndex, hints.length - 1)] ||
      'Überleg noch einmal!';
    hintText.textContent = hint;
    hintLine.style.display = 'block';
    if (hintIndex < hints.length - 1) hintIndex += 1;
  });
}

function renderSummary(root) {
  const correct = results.filter((r) => r.ok).length;
  const total = results.length;

  const rows = results
    .map((r, i) => {
      const q = QUESTIONS.find((qq) => qq.id === r.id);
      const your = Array.isArray(r.values) ? r.values.join(' | ') : r.values;

      const statusText = r.ok ? 'Richtig' : 'Falsch';
      const statusClass = r.ok ? 'correct' : 'incorrect';

      return `
        <li class="result-row">
          <strong>F${i + 1}:</strong>
          <span class="${statusClass}">${statusText}</span>
          · Deine Antwort:
          <em>${escapeHtml(your || '—')}</em>
          · Lösung:
          <em class="solution">${escapeHtml(q.correctText)}</em>
        </li>`;
    })
    .join('');

  root.innerHTML = `
    <h2>Ergebnis</h2>
    <p class="lead">Punkte: <strong>${correct} / ${total}</strong></p>
    <ul class="muted" style="padding-left:18px">${rows}</ul>
    <div class="actions">
      <button class="btn" id="retryBtn" type="button">Nochmal starten</button>
    </div>
  `;

  document.getElementById('retryBtn').addEventListener('click', () => {
    idx = 0;
    results.length = 0;
    renderCurrent(root);
  });
}


// ---------- Utils ----------
function escapeHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}
