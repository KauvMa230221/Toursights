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

// ==== Auswertung ====
function checkAll() {
  const results = [];

  // 1. Was ist eine Möglichkeit für artificial Intelligence?
  results.push(setResult(
    'q1o',
    equalsOneOf(q1.value, ['GeoSocial', 'Geo Social']),
  ));

  // 2. Von welcher Universität wird Digital Network of Conspiracy durchgeführt?
  results.push(setResult(
    'q2o',
    equalsOneOf(q2.value, ['Uni Austria', 'Universität Austria']),
  ));

  // 3. Was ist kein Signalwort?
  results.push(setResult(
    'q3o',
    equalsOneOf(q3.value, ['Digital'])
  ));

  // Punkte anzeigen
  const score = results.filter(Boolean).length;
  const total = results.length;
  document.getElementById('score').textContent = `Punkte: ${score} / ${total}`;
  document.getElementById('year').textContent = new Date().getFullYear();
}

// ==== Ausgabe-Funktion ====
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
