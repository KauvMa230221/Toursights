// Links nur öffnen – ohne Punkte
document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll(".reward-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const url = btn.dataset.url;
      window.location.href = url;
    });
  });

  // Jahr im Footer
  const year = document.getElementById("year");
  if (year) year.textContent = new Date().getFullYear();
});
