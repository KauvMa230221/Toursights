// ==== Hilfsfunktionen ====
const norm = (s) => s
  .toLowerCase()
  .normalize('NFD').replace(/\p{Diacritic}/gu, '')
  .replace(/\s+/g, ' ')
  .trim();

const equalsOneOf = (val, variants) => variants.some(v => norm(val) === norm(v));
const containsAll = (val, required) => {
  const n = norm(val);
  return required.every(req => n.includes(norm(req)));
};

// ==== Hauptprüfung ====
function checkAll() {
  const results = [];

  // Q1
  results.push(setResult('q1o', equalsOneOf(q1.value, ['Haslach'])));

  // Q2
  results.push(setResult('q2o', equalsOneOf(q2.value, ['Aus dem Englischen Königshaus', 'Englisches Königshaus'])));

  // Q3
  results.push(setResult('q3o', equalsOneOf(q3.value, ['Musik', 'Musikvisualisierungen', 'KI Musik'])));

  // Q4
  results.push(setResult('q4o', equalsOneOf(q4.value, ['AI x Music', 'AI×Music', 'AI x music'])));

  // Q5
  results.push(setResult('q5o', equalsOneOf(q5.value, ['Walzenklavier'])));

  // Q6
  const titleOK = equalsOneOf(q6a.value, ['Ex.A.R.U.', 'Ex A R U', 'ExARU', 'Exo Auxiliary Respiratory Unit', 'Exo-Auxiliary Respiratory Unit']);
  const artistOK = equalsOneOf(q6b.value, ['Dorotea Dolinsek', 'Dorotea Dolinšek']);
  results.push(setResult('q6o', titleOK && artistOK));

  // Q7
  results.push(setResult('q7o', equalsOneOf(q7.value, ['DEGENET'])));

  // Q8
  results.push(setResult('q8o', equalsOneOf(q8.value, ['FadingColours', 'Fading Colours', 'FadingColors'])));

  // Q9
  const must = containsAll(q9.value, ['space', 'education']);
  const thirdOK = ['science', 'stem', 'science & technology', 'science and technology']
    .some(k => norm(q9.value).includes(norm(k)));
  results.push(setResult('q9o', must && thirdOK));

  // === Score ===
  const score = results.filter(Boolean).length;
  const total = results.length;
  document.getElementById('score').textContent = `Punkte: ${score} / ${total}`;
  document.getElementById('year').textContent = new Date().getFullYear();
}

// ==== Anzeige ====
function setResult(outId, ok) {
  const o = document.getElementById(outId);
  if (ok) {
    o.textContent = 'Richtig ✅';
    o.className = 'correct';
    return true;
  }
  o.textContent = 'Falsch ❌';
  o.className = 'incorrect';
  return false;
}

// ==== DOM-Referenzen ====
const q1 = document.getElementById('q1');
const q1o = document.getElementById('q1o');
const q2 = document.getElementById('q2');
const q2o = document.getElementById('q2o');
const q3 = document.getElementById('q3');
const q3o = document.getElementById('q3o');
const q4 = document.getElementById('q4');
const q4o = document.getElementById('q4o');
const q5 = document.getElementById('q5');
const q5o = document.getElementById('q5o');
const q6a = document.getElementById('q6a');
const q6b = document.getElementById('q6b');
const q6o = document.getElementById('q6o');
const q7 = document.getElementById('q7');
const q7o = document.getElementById('q7o');
const q8 = document.getElementById('q8');
const q8o = document.getElementById('q8o');
const q9 = document.getElementById('q9');
const q9o = document.getElementById('q9o');

// ==== Buttons verbinden ====
document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('checkBtn').addEventListener('click', checkAll);
  document.getElementById('resetBtn').addEventListener('click', () => {
    document.querySelectorAll('input').forEach(i => i.value = '');
    document.querySelectorAll('output').forEach(o => { o.textContent = ''; o.className = ''; });
    document.getElementById('score').textContent = '';
    document.getElementById('year').textContent = new Date().getFullYear();
  });
  document.getElementById('year').textContent = new Date().getFullYear();
});
