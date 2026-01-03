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
  const station4El = document.getElementById("station4-points");
let s4 = loadJSON("ts_station4_points", 0);
animateValue(station4El, s4);

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
})();// === Progress Page Logic ===
(function setupProgress() {
  const station1El = document.getElementById("station1-points");
  const station2El = document.getElementById("station2-points");
  const station3El = document.getElementById("station3-points");
  const station4El = document.getElementById("station4-points");
  const totalKmEl = document.getElementById("total-kilometers");

  if (!station1El || !station2El || !station3El || !totalKmEl) return;

  let s1 = loadJSON(STORAGE_KEYS.station1Points, 0);
  let s2 = loadJSON(STORAGE_KEYS.station2Points, 0);
  let s3 = loadJSON(STORAGE_KEYS.station3Points, 0);
  let s4 = loadJSON("ts_station4_points", 0);
  let km = loadJSON(STORAGE_KEYS.distance, 0);

  function animateValue(el, value, decimals = 0, duration = 600) {
    if (!el) return;
    const start = 0;
    const startTime = performance.now();

    function frame(now) {
      const progress = Math.min(1, (now - startTime) / duration);
      const current = start + (value - start) * progress;
      el.textContent = decimals
        ? current.toFixed(decimals)
        : Math.round(current);
      if (progress < 1) requestAnimationFrame(frame);
    }

    requestAnimationFrame(frame);
  }

  animateValue(station1El, s1);
  animateValue(station2El, s2);
  animateValue(station3El, s3);
  animateValue(station4El, s4);
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
      currentUserInfo.textContent =
        `Sie sind als ${current.username} (${current.role}${current.class ? ", " + current.class : ""}) angemeldet`;
    } else {
      currentUserInfo.textContent = "Du bist derzeit nicht eingeloggt.";
    }
  }

  updateCurrentUserInfo();

  // REGISTRIEREN
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

  // LOGIN
  loginForm.addEventListener("submit", (e) => {
    e.preventDefault();
    loginMessage.textContent = "";
    loginMessage.className = "ts-form-message";

    const username = document.getElementById("login-username").value.trim();
    const password = document.getElementById("login-password").value;

    const users = getUsers();
    const found = users.find(
      (u) => u.username === username && u.password === password
    );

    if (!found) {
      loginMessage.textContent = "Benutzername oder Passwort ist falsch.";
      loginMessage.classList.add("error");
      loginForm.classList.add("ts-shake");
      setTimeout(() => loginForm.classList.remove("ts-shake"), 400);
      return;
    }

    saveJSON(STORAGE_KEYS.currentUser, {
      username: found.username,
      role: found.role,
      class: found.class
    });

    loginMessage.textContent = "Login erfolgreich!";
    loginMessage.classList.add("success");
    updateCurrentUserInfo();
  });
})();

// === Station 1 Quiz Logic ===
// === Station 1 Multiple-Choice Quiz Logic ===
(function setupStation1() {
  const form = document.getElementById("station1-form");
  if (!form) return;

  const scoreMessage = document.getElementById("station1-score-message");

  const solutions = {
    q1: "b",
    q2: "b",
    q3: "c",
  };

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    let score = 0;

    Object.keys(solutions).forEach((q) => {
      const fb = document.querySelector(`[data-feedback-for="${q}"]`);
      const sel = form.querySelector(`input[name="${q}"]:checked`);

      if (!sel) {
        fb.textContent = "Keine Antwort gewählt.";
        fb.style.color = "var(--danger)";
        return;
      }

      if (sel.value === solutions[q]) {
        fb.textContent = "Richtig ✓";
        fb.style.color = "var(--success)";
        score++;
      } else {
        fb.textContent = "Falsch ✗";
        fb.style.color = "var(--danger)";
      }
    });

    saveJSON(STORAGE_KEYS.station1Points, score);
    scoreMessage.textContent = `Du hast ${score} von 3 Punkten erreicht.`;
    scoreMessage.className = "ts-form-message success";
  });
})();


// === Station 2 Quiz Logic ===
// === Station 2 Multiple-Choice Quiz Logic ===
(function setupStation2() {
  const form = document.getElementById("station2-form");
  if (!form) return;

  const scoreMessage = document.getElementById("station2-score-message");

  const solutions = {
    q1: "a",
    q2: "c",
    q3: "b",
    q4: "a",
    q5: "c",
    q6: "a",
    q7: "b",
    q8: "b",
    q9: "b",
  };

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    let score = 0;

    Object.keys(solutions).forEach((q) => {
      const fb = document.querySelector(`[data-feedback-for="${q}"]`);
      const sel = form.querySelector(`input[name="${q}"]:checked`);

      if (!sel) {
        fb.textContent = "Keine Antwort gewählt.";
        fb.style.color = "var(--danger)";
        return;
      }

      if (sel.value === solutions[q]) {
        fb.textContent = "Richtig ✓";
        fb.style.color = "var(--success)";
        score++;
      } else {
        fb.textContent = "Falsch ✗";
        fb.style.color = "var(--danger)";
      }
    });

    saveJSON(STORAGE_KEYS.station2Points, score);
    scoreMessage.textContent = `Du hast ${score} von 9 Punkten erreicht.`;
    scoreMessage.className = "ts-form-message success";
  });
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

// === Station 4 Multiple-Choice Quiz Logic ===
(function setupStation4() {
  const form = document.getElementById("station4-form");
  if (!form) return;

  const scoreMessage = document.getElementById("station4-score-message");

  const solutions = {
    q1: "a",
    q2: "b",
    q3: "a",
    q4: "b",
    q5: "a",
    q6: "b",
    q7: "a",
    q8: "a",
  };

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    let score = 0;

    Object.keys(solutions).forEach((q) => {
      const fb = document.querySelector(`[data-feedback-for="${q}"]`);
      const sel = form.querySelector(`input[name="${q}"]:checked`);

      if (!sel) {
        fb.textContent = "Keine Antwort gewählt.";
        fb.style.color = "var(--danger)";
        return;
      }

      if (sel.value === solutions[q]) {
        fb.textContent = "Richtig ✓";
        fb.style.color = "var(--success)";
        score++;
      } else {
        fb.textContent = "Falsch ✗";
        fb.style.color = "var(--danger)";
      }
    });

    saveJSON("ts_station4_points", score);
    scoreMessage.textContent = `Du hast ${score} von 8 Punkten erreicht.`;
    scoreMessage.className = "ts-form-message success";
  });
})();

// === MAP + GPS TRACKING (ECHT) ===
(function setupMapAndGPS() {
  const mapEl = document.getElementById("map-view");
  const distanceEl = document.getElementById("distance-value");
  const btnStart = document.getElementById("btn-start-tracking");
  const btnStop = document.getElementById("btn-stop-tracking");

  if (!mapEl || !distanceEl || !btnStart || !btnStop) return;

  let map, watchId = null;
  let lastPos = null;
  let distance = loadJSON(STORAGE_KEYS.distance, 0);

  // Stationen (Beispiel-Koordinaten – kannst du anpassen)
  const stations = [
    { name: "Station 1 – Digital Studio", lat: 48.3069, lng: 14.2858 },
    { name: "Station 2 – Ars Electronica", lat: 48.3071, lng: 14.2849 },
    { name: "Station 3 – Arbeiterkammer", lat: 48.3009, lng: 14.2841 },
    { name: "Station 4 – Wirtschaftskammer", lat: 48.3052, lng: 14.2865 },
  ];

  // Karte starten
  map = L.map("map-view").setView([48.3069, 14.2858], 15);
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "© OpenStreetMap"
  }).addTo(map);

  // Stationen anzeigen
  stations.forEach(s => {
    L.marker([s.lat, s.lng])
      .addTo(map)
      .bindPopup(`<strong>${s.name}</strong>`);
  });

  function updateDistanceDisplay() {
    distanceEl.textContent = distance.toFixed(2);
  }

  function calcDistance(a, b) {
    const R = 6371;
    const dLat = (b.lat - a.lat) * Math.PI / 180;
    const dLng = (b.lng - a.lng) * Math.PI / 180;
    const lat1 = a.lat * Math.PI / 180;
    const lat2 = b.lat * Math.PI / 180;

    const x =
      Math.sin(dLat / 2) ** 2 +
      Math.sin(dLng / 2) ** 2 * Math.cos(lat1) * Math.cos(lat2);

    return 2 * R * Math.asin(Math.sqrt(x));
  }

  btnStart.addEventListener("click", () => {
    if (!navigator.geolocation) {
      alert("GPS wird von deinem Browser nicht unterstützt.");
      return;
    }

    watchId = navigator.geolocation.watchPosition(
      pos => {
        const current = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude
        };

        if (lastPos) {
          distance += calcDistance(lastPos, current);
          updateDistanceDisplay();
        }

        lastPos = current;
        map.setView([current.lat, current.lng], 16);
        L.circleMarker([current.lat, current.lng], {
          radius: 6,
          color: "#f472b6"
        }).addTo(map);
      },
      err => alert("Standort konnte nicht abgerufen werden."),
      { enableHighAccuracy: true }
    );
  });

  btnStop.addEventListener("click", () => {
    if (watchId !== null) {
      navigator.geolocation.clearWatch(watchId);
      watchId = null;
      saveJSON(STORAGE_KEYS.distance, distance);
      alert("Reise gestoppt und gespeichert!");
    }
  });

  updateDistanceDisplay();
})();

document.getElementById("register-form")?.addEventListener("submit", e => {
  e.preventDefault();

  const username = document.getElementById("register-username").value.trim();
  const role = document.getElementById("register-role").value;
  const klass = document.getElementById("register-class").value.trim();
  const info = document.getElementById("current-user-info");

  if (!username) {
    alert("Bitte Benutzername eingeben");
    return;
  }

  // User als aktuell eingeloggt setzen
  localStorage.setItem(
    "ts_current_user",
    JSON.stringify({ username, role, class: klass })
  );

  // Anzeige aktualisieren
  info.innerHTML = `
    <strong>${username}</strong><br>
    <span class="ts-muted">
      ${role}${klass ? " · " + klass : ""}
    </span>
  `;
});

