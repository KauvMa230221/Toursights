// Schlüssel für localStorage
const POINTS_KEY = "punkte";
const CLICKED_KEY = "geklickteButtons";

function getPoints() {
  const value = localStorage.getItem(POINTS_KEY);
  const num = parseInt(value, 10);
  return Number.isNaN(num) ? 0 : num;
}

function setPoints(value) {
  localStorage.setItem(POINTS_KEY, String(value));
}

function getClickedButtons() {
  try {
    const raw = localStorage.getItem(CLICKED_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    return [];
  }
}

function setClickedButtons(arr) {
  localStorage.setItem(CLICKED_KEY, JSON.stringify(arr));
}

// Punkteanzeige aktualisieren
function updatePointsUI() {
  const span = document.getElementById("currentPoints");
  if (!span) return;
  span.textContent = getPoints();
}

// Logik für Seite mit Buttons (index.html)
function initButtonsPage() {
  updatePointsUI();

  const alreadyClicked = new Set(getClickedButtons());

  const buttons = document.querySelectorAll(".reward-btn");
  buttons.forEach((btn) => {
    const id = btn.dataset.id;

    // Wenn schon geklickt → optisch deaktivieren
    if (alreadyClicked.has(id)) {
      btn.classList.add("disabled");
    }

    btn.addEventListener("click", () => {
      const buttonId = btn.dataset.id;
      const pointsToAdd = parseInt(btn.dataset.points, 10) || 0;
      const url = btn.dataset.url;

      const clickedSet = new Set(getClickedButtons());

      // Wenn der Button schon einmal Punkte gegeben hat:
      if (clickedSet.has(buttonId)) {
        alert("Diesen Button hast du schon benutzt. Keine weiteren Punkte.");
        // Link darf trotzdem geöffnet werden, wenn gewünscht:
        if (url) {
          window.open(url, "_blank");
        }
        return;
      }

      // Punkte hinzufügen
      const newPoints = getPoints() + pointsToAdd;
      setPoints(newPoints);

      // Button-ID speichern, damit man ihn nicht erneut "belohnen" kann
      clickedSet.add(buttonId);
      setClickedButtons(Array.from(clickedSet));

      // UI aktualisieren
      btn.classList.add("disabled");
      updatePointsUI();

      // Link öffnen
      if (url) {
        window.open(url, "_blank");
      }

      alert(`Du hast ${pointsToAdd} Punkte bekommen!`);
    });
  });
}

// Logik für Fortschrittsseite
function initProgressPage() {
  updatePointsUI();
}

// Auto-Erkennung der Seite
document.addEventListener("DOMContentLoaded", () => {
  if (document.body.classList.contains("page-main")) {
    initButtonsPage();
  } else if (document.body.classList.contains("page-progress")) {
    initProgressPage();
  }
});
