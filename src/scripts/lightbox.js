const lightbox = document.getElementById("lightbox")
const lightboxImg = document.querySelector(".lightbox-image")
const closeBtn = document.querySelector(".lightbox-close")
const prevBtn = document.querySelector(".lightbox-prev")
const nextBtn = document.querySelector(".lightbox-next")

const triggers = Array.from(document.querySelectorAll(".lightbox-trigger")) // gallery images
let currentIdx = 0

function openLightBox(idx) {
  currentIdx = idx
  const newSrc = triggers[currentIdx].dataset.full
  lightboxImg.style.opacity = "0" // hide image while loading new one

  lightboxImg.src = newSrc
  lightboxImg.onload = () => {
    lightboxImg.style.opacity = "1";
  }
  lightbox.setAttribute("aria-hidden", "false")
  document.body.style.overflow = "hidden" // prevent background scrolling
}

function closeLightBox() {
  lightbox.setAttribute("aria-hidden", "true")
  lightboxImg.style.opacity = "0" // reset opacity for next time
  lightboxImg.src = ""
  document.body.style.overflow = "" // restore scrolling
}

function showNext() {
  currentIdx = (currentIdx + 1) % triggers.length
  openLightBox(currentIdx)
}

function showPrev() {
  currentIdx = (currentIdx - 1 + triggers.length) % triggers.length
  openLightBox(currentIdx)
}

triggers.forEach((trigger, idx) => {
  trigger.addEventListener("click", () => {
    openLightBox(idx)
  })
})

closeBtn.addEventListener("click", closeLightBox)
nextBtn.addEventListener("click", showNext)
prevBtn.addEventListener("click", showPrev)

// click outside of image, the lightbox closes
lightbox.addEventListener("click", (e) => {
  if (e.target === lightbox) {
    closeLightBox()
  }
})

document.addEventListener("keydown", (e) => {
  if (lightbox.getAttribute("aria-hidden") === "true") return
  
  if (e.key === "Escape") closeLightBox()
  if (e.key === "ArrowRight") showNext()
  if (e.key === "ArrowLeft") showPrev()
})

