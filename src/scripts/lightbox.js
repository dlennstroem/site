const lightbox = document.getElementById("lightbox");
const lightboxImg = document.querySelector(".lightbox-image");
const closeBtn = document.querySelector(".lightbox-close");

document.addEventListener("click", (e) => {
  const trigger = e.target.closest(".lightbox-trigger");
  if (!trigger) return;

  lightboxImg.src = trigger.dataset.full;
  lightbox.setAttribute("aria-hidden", "false");
});

closeBtn.addEventListener("click", () => {
  lightbox.setAttribute("aria-hidden", "true");
  lightboxImg.src = "";
});

lightbox.addEventListener("click", (e) => {
  if (e.target === lightbox) {
    lightbox.setAttribute("aria-hidden", "true");
    lightboxImg.src = "";
  }
});

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    lightbox.setAttribute("aria-hidden", "true");
    lightboxImg.src = "";
  }
});
