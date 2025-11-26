// ===============================
//  TourSights – Links JS
// ===============================

document.addEventListener("DOMContentLoaded", () => {

  // -------------------------------
  // Öffnet Links durch Klick auf Buttons
  // -------------------------------
  document.querySelectorAll(".reward-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const url = btn.dataset.url;
      if (url) {
        // Öffnet im selben Tab (wie gewünscht)
        window.location.href = url;
      }
    });
  });

  // -------------------------------
  // Footer – Jahr automatisch setzen
  // -------------------------------
  const year = document.getElementById("year");
  if (year) year.textContent = new Date().getFullYear();

  // -------------------------------
  // Mobile Navigation
  // -------------------------------
  const menuBtn = document.querySelector(".menu-btn");
  const mainnav = document.getElementById("mainnav");

  if (menuBtn && mainnav) {
    menuBtn.addEventListener("click", () => {
      const isOpen = mainnav.classList.toggle("open");
      menuBtn.setAttribute("aria-expanded", isOpen);
    });
  }

});
