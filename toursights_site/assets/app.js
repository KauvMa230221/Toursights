// Global constants for localStorage keys
const STORAGE_KEYS = {
  distance: "ts_travel_distance",
  station1Points: "ts_station1_points",
  station2Points: "ts_station2_points",
  users: "ts_users",
  currentUser: "ts_current_user",
};

// Helper to safely parse JSON from localStorage
function loadJSON(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

function saveJSON(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

// === GPS Tracking Logic ===
(function setupTracking() {
  const distanceEl = document.getElementById("distance-value");
  if (!distanceEl) return; // not on tracking page

  const btnStart = document.getElementById("btn-start-tracking");
  const btnStop = document.getElementById("btn-stop-tracking");
  const btnSave = document.getElementById("btn-save-tracking");

  let distance = loadJSON(STORAGE_KEYS.distance, 0);
  let intervalId = null;

  function updateDistanceDisplay() {
    distanceEl.textContent = distance.toFixed(2);
    distanceEl.classList.add("ts-highlight");
    setTimeout(() => distanceEl.classList.remove("ts-highlight"), 600);
  }

  updateDistanceDisplay();

  function startTracking() {
    if (intervalId !== null) return;
    intervalId = setInterval(() => {
      distance += 0.01; // simulated distance
      updateDistanceDisplay();
    }, 800);
  }

  function stopTracking() {
    if (intervalId !== null) {
      clearInterval(intervalId);
      intervalId = null;
    }
  }

  function saveTracking() {
    stopTracking();
    saveJSON(STORAGE_KEYS.distance, distance);
    alert("Reise gespeichert! Gesamt-Kilometer: " + distance.toFixed(2) + " km");
  }

  btnStart?.addEventListener("click", startTracking);
  btnStop?.addEventListener("click", stopTracking);
  btnSave?.addEventListener("click", saveTracking);
})();

// === Progress Page Logic ===
(function setupProgress() {
  const station1El = document.getElementById("station1-points");
  const station2El = document.getElementById("station2-points");
  const station3El = document.getElementById("station3-points");
  const totalKmEl = document.getElementById("total-kilometers");

  if (!station1El || !station2El || !station3El || !totalKmEl) return;

  let s1 = loadJSON(STORAGE_KEYS.station1Points, 0);
  let s2 = loadJSON(STORAGE_KEYS.station2Points, 0);
  let s3 = loadJSON(STORAGE_KEYS.station3Points, 0);
  let km = loadJSON(STORAGE_KEYS.distance, 0);

  function animateValue(el, value, decimals = 0, duration = 600) {
    const start = 0;
    const startTime = performance.now();

    function frame(now) {
      const progress = Math.min(1, (now - startTime) / duration);
      const current = start + (value - start) * progress;
      el.textContent = decimals ? current.toFixed(decimals) : Math.round(current);
      if (progress < 1) requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }

  animateValue(station1El, s1);
  animateValue(station2El, s2);
  animateValue(station3El, s3);
  animateValue(totalKmEl, km, 2);
})();


// === Profile / Login Logic ===
(function setupProfile() {
  const loginForm = document.getElementById("login-form");
  const registerForm = document.getElementById("register-form");
  const loginMessage = document.getElementById("login-message");
  const registerMessage = document.getElementById("register-message");
  const currentUserInfo = document.getElementById("current-user-info");

  if (!loginForm || !registerForm) return;

  function getUsers() {
    return loadJSON(STORAGE_KEYS.users, []);
  }

  function setUsers(users) {
    saveJSON(STORAGE_KEYS.users, users);
  }

  function updateCurrentUserInfo() {
    const current = loadJSON(STORAGE_KEYS.currentUser, null);
    if (!currentUserInfo) return;
    if (current) {
      currentUserInfo.textContent = `Eingeloggt als ${current.username} (${current.role}, ${current.class || "keine Klasse"})`;
    } else {
      currentUserInfo.textContent = "Du bist derzeit nicht eingeloggt.";
    }
  }

  updateCurrentUserInfo();

  registerForm.addEventListener("submit", (e) => {
    e.preventDefault();
    registerMessage.textContent = "";
    registerMessage.className = "ts-form-message";

    const username = document.getElementById("register-username").value.trim();
    const password = document.getElementById("register-password").value;
    const role = document.getElementById("register-role").value;
    const klass = document.getElementById("register-class").value.trim();

    if (!username || !password) {
      registerMessage.textContent = "Bitte Benutzername und Passwort eingeben.";
      registerMessage.classList.add("error");
      return;
    }

    const users = getUsers();
    if (users.some((u) => u.username === username)) {
      registerMessage.textContent = "Benutzername ist bereits vergeben.";
      registerMessage.classList.add("error");
      return;
    }

    users.push({ username, password, role, class: klass });
    setUsers(users);
    registerMessage.textContent = "Registrierung erfolgreich! Du kannst dich jetzt einloggen.";
    registerMessage.classList.add("success");
    registerForm.reset();
  });

  loginForm.addEventListener("submit", (e) => {
    e.preventDefault();
    loginMessage.textContent = "";
    loginMessage.className = "ts-form-message";

    const username = document.getElementById("login-username").value.trim();
    const password = document.getElementById("login-password").value;

    const users = getUsers();
    const found = users.find((u) => u.username === username && u.password === password);

    if (!found) {
      loginMessage.textContent = "Benutzername oder Passwort ist falsch.";
      loginMessage.classList.add("error");
      loginForm.classList.add("ts-shake");
      setTimeout(() => loginForm.classList.remove("ts-shake"), 400);
      return;
    }

    saveJSON(STORAGE_KEYS.currentUser, { username: found.username, role: found.role, class: found.class });
    loginMessage.textContent = "Login erfolgreich!";
    loginMessage.classList.add("success");
    updateCurrentUserInfo();
  });
})();

// === Station 1 Quiz Logic ===
(function setupStation1() {
  const form = document.getElementById("station1-form");
  if (!form) return;

  const feedbackEls = {
    "answer-1": document.querySelector('[data-feedback-for="answer-1"]'),
    "answer-2": document.querySelector('[data-feedback-for="answer-2"]'),
    "answer-3": document.querySelector('[data-feedback-for="answer-3"]'),
  };
  const scoreMessage = document.getElementById("station1-score-message");

  // Intern gespeicherte Lösungen – werden nicht angezeigt
  const solutions = {
    "answer-1": "künstliche intelligenz", // Platzhalter – Logik egal
    "answer-2": "universität",            // Platzhalter
    "answer-3": "keins",                  // Platzhalter
  };

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    let score = 0;

    Object.keys(feedbackEls).forEach((name) => {
      const input = form.elements[name];
      const feedback = feedbackEls[name];
      if (!input || !feedback) return;

      const userValue = String(input.value || "").trim().toLowerCase();
      const correctValue = solutions[name];

      if (!userValue) {
        feedback.textContent = "Keine Antwort eingegeben.";
        feedback.style.color = "var(--danger)";
        input.classList.add("ts-shake");
        setTimeout(() => input.classList.remove("ts-shake"), 350);
        return;
      }

      if (userValue === correctValue) {
        feedback.textContent = "Richtig ✓";
        feedback.style.color = "var(--success)";
        score += 1;
      } else {
        feedback.textContent = "Falsch ✗";
        feedback.style.color = "var(--danger)";
        input.classList.add("ts-shake");
        setTimeout(() => input.classList.remove("ts-shake"), 350);
      }
    });

    saveJSON(STORAGE_KEYS.station1Points, score);
    scoreMessage.textContent = `Du hast ${score} von 3 Punkten erreicht.`;
    scoreMessage.className = "ts-form-message success";
  });
})();

// === Station 2 Quiz Logic ===
(function setupStation2() {
  const questionView = document.getElementById("station2-question-view");
  const resultView = document.getElementById("station2-result-view");
  if (!questionView || !resultView) return;

  const titleEl = document.getElementById("station2-question-title");
  const textEl = document.getElementById("station2-question-text");
  const answerInput = document.getElementById("station2-answer");
  const nextBtn = document.getElementById("station2-next");
  const skipBtn = document.getElementById("station2-skip");
  const feedbackEl = document.getElementById("station2-feedback");

  const scoreEl = document.getElementById("station2-score");
  const resultList = document.getElementById("station2-result-list");
  const restartBtn = document.getElementById("station2-restart");

  const questions = [
    { text: "Wo befindet sich die mechanische Klangfabrik?", answer: "haslach" },
    { text: "Aus welchem Sprachraum stammt der Name der Station?", answer: "englisch" },
    { text: "Welches Medium wird bei der KI-Musikvisualisierung genutzt?", answer: "musik" },
    { text: "Wie heißt die Kombination aus künstlicher Intelligenz und Musik?", answer: "ai x music" },
    { text: "Welche historische Technik steht bei der Walzenmusik im Fokus?", answer: "walzenklavier" },
    { text: "Wie lautet die Abkürzung des Exo Auxiliary Respiratory Unit Projekts?", answer: "ex.a.r.u." },
    { text: "Wie heißt das Projekt zu Verschwörungstheorien im virtuellen Raum?", answer: "degenet" },
    { text: "Welches Projekt beschäftigt sich mit Farb- und Lichtübergängen?", answer: "fadingcolours" },
    { text: "Welches Beispiel verbindet Space, Education und Science?", answer: "space education science" },
  ];

  let currentIndex = 0;
  let results = [];

  function showQuestion(index) {
    const q = questions[index];
    titleEl.textContent = `Frage ${index + 1} / ${questions.length}`;
    textEl.textContent = q.text;
    answerInput.value = "";
    feedbackEl.textContent = "";
    questionView.classList.add("ts-animate-up");
    setTimeout(() => questionView.classList.remove("ts-animate-up"), 400);
  }

  function finishQuiz() {
    const score = results.filter((r) => r.correct).length;
    scoreEl.textContent = String(score);
    saveJSON(STORAGE_KEYS.station2Points, score);

    resultList.innerHTML = "";
    results.forEach((r, i) => {
      const li = document.createElement("li");
      li.textContent = `F${i + 1}: ${r.correct ? "Richtig" : "Falsch"}`;
      li.style.color = r.correct ? "var(--success)" : "var(--danger)";
      resultList.appendChild(li);
    });

    questionView.classList.add("ts-hidden");
    resultView.classList.remove("ts-hidden");
  }

  function handleAnswer(skip = false) {
    const userValue = String(answerInput.value || "").trim().toLowerCase();
    const correctValue = questions[currentIndex].answer;
    let correct = false;

    if (!skip) {
      if (!userValue) {
        feedbackEl.textContent = "Bitte gib eine Antwort ein oder klicke auf 'Weiß ich nicht'.";
        feedbackEl.classList.add("error");
        answerInput.classList.add("ts-shake");
        setTimeout(() => answerInput.classList.remove("ts-shake"), 350);
        return;
      }
      correct = userValue === correctValue;
    }

    results[currentIndex] = { correct };
    currentIndex += 1;

    if (currentIndex < questions.length) {
      showQuestion(currentIndex);
    } else {
      finishQuiz();
    }
  }

  nextBtn.addEventListener("click", () => handleAnswer(false));
  skipBtn.addEventListener("click", () => handleAnswer(true));

  restartBtn.addEventListener("click", () => {
    currentIndex = 0;
    results = [];
    resultView.classList.add("ts-hidden");
    questionView.classList.remove("ts-hidden");
    showQuestion(0);
  });

  // Initial question
  showQuestion(currentIndex);
})();

// === Navigation Helper (optional active state if needed) ===
(function highlightNav() {
  const page = document.body.dataset.page;
  const links = document.querySelectorAll(".ts-nav a[data-page-link]");
  links.forEach((link) => {
    if (link.dataset.pageLink === page) {
      link.classList.add("active");
    }
  });
})();

// === Station 3 Multiple-Choice Quiz Logic ===
// === Station 3 Multiple-Choice Quiz Logic ===
(function setupStation3() {
  const form = document.getElementById("station3-form");
  if (!form) return;

  const scoreMessage = document.getElementById("station3-score-message");

  const feedbackEls = {};
  for (let i = 1; i <= 8; i++) {
    feedbackEls["q" + i] = document.querySelector(`[data-feedback-for="q${i}"]`);
  }

  const solutions = {
    q1: "b",
    q2: "c",
    q3: "b",
    q4: "b",
    q5: "c",
    q6: "a",
    q7: "a",
    q8: "a",
  };

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    let score = 0;

    Object.keys(solutions).forEach((key) => {
      const correct = solutions[key];
      const feedback = feedbackEls[key];
      const selected = form.querySelector(`input[name="${key}"]:checked`);

      if (!selected) {
        feedback.textContent = "Keine Antwort gewählt.";
        feedback.style.color = "var(--danger)";
        return;
      }

      if (selected.value === correct) {
        feedback.textContent = "Richtig ✓";
        feedback.style.color = "var(--success)";
        score++;
      } else {
        feedback.textContent = "Falsch ✗";
        feedback.style.color = "var(--danger)";
      }
    });

    saveJSON(STORAGE_KEYS.station3Points, score);

    scoreMessage.textContent = `Du hast ${score} von 8 Punkten erreicht.`;
    scoreMessage.className = "ts-form-message success";
  });
})();

(function(){
const f=document.getElementById("station3-form");if(!f)return;
const msg=document.getElementById("station3-score-message");
const sol={q1:"b",q2:"c",q3:"b",q4:"b",q5:"c",q6:"a",q7:"a",q8:"a"};
f.onsubmit=e=>{
 e.preventDefault();let s=0;
 Object.keys(sol).forEach(k=>{
  const sel=f.querySelector(`input[name=${k}]:checked`);
  const fb=document.querySelector(`[data-feedback-for=${k}]`);
  if(!sel){fb.textContent="Keine Antwort";return;}
  if(sel.value===sol[k]){fb.textContent="✓";s++;}else fb.textContent="✗";
 });
 localStorage.setItem("ts_station3_points",s);
 msg.textContent=`${s}/8 Punkten erreicht`;
};
})();


