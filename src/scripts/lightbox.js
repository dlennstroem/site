const lightbox = document.getElementById("lightbox")
const lightboxImg = document.querySelector(".lightbox-image")
const closeBtn = document.querySelector(".lightbox-close")
const prevBtn = document.querySelector(".lightbox-prev")
const nextBtn = document.querySelector(".lightbox-next")

const triggers = Array.from(document.querySelectorAll(".lightbox-trigger"))
let currentIdx = 0

function openLightBox(idx) {
  currentIdx = idx
  document.body.style.overflow = "hidden"

  // Pre-load the image before revealing the lightbox so both fade in together
  lightboxImg.style.opacity = "0"
  lightboxImg.src = triggers[idx].dataset.full

  lightboxImg.onload = () => {
    lightbox.setAttribute("aria-hidden", "false")
    requestAnimationFrame(() => {
      lightboxImg.style.opacity = "1"
    })
    preloadAdjacentImages(idx)
  }
}

function closeLightBox() {
  lightbox.setAttribute("aria-hidden", "true")
  lightboxImg.style.opacity = "0"
  lightboxImg.src = ""
  document.body.style.overflow = ""
}

function preloadAdjacentImages(idx) {
  const nextSrc = triggers[(idx + 1) % triggers.length].dataset.full
  const prevSrc = triggers[(idx - 1 + triggers.length) % triggers.length].dataset.full
  new Image().src = nextSrc
  new Image().src = prevSrc
}

function loadLightboxImage(src) {
  const preload = new Image()
  preload.onload = () => {
    lightboxImg.style.opacity = "0"
    lightboxImg.addEventListener("transitionend", () => {
      lightboxImg.src = src
      requestAnimationFrame(() => {
        lightboxImg.style.opacity = "1"
      })
    }, { once: true })
  }
  preload.src = src
}

function showNext() {
  currentIdx = (currentIdx + 1) % triggers.length
  loadLightboxImage(triggers[currentIdx].dataset.full)
  preloadAdjacentImages(currentIdx)
}

function showPrev() {
  currentIdx = (currentIdx - 1 + triggers.length) % triggers.length
  loadLightboxImage(triggers[currentIdx].dataset.full)
  preloadAdjacentImages(currentIdx)
}

triggers.forEach((trigger, idx) => {
  trigger.addEventListener("click", () => openLightBox(idx))
})

closeBtn.addEventListener("click", closeLightBox)
nextBtn.addEventListener("click", showNext)
prevBtn.addEventListener("click", showPrev)

lightbox.addEventListener("click", (e) => {
  if (e.target === lightbox) closeLightBox()
})

document.addEventListener("keydown", (e) => {
  if (lightbox.getAttribute("aria-hidden") === "true") return
  if (e.key === "Escape") closeLightBox()
  if (e.key === "ArrowRight") showNext()
  if (e.key === "ArrowLeft") showPrev()
})

let touchStartX = 0

lightbox.addEventListener("touchstart", (e) => {
  touchStartX = e.changedTouches[0].clientX
}, { passive: true })

lightbox.addEventListener("touchend", (e) => {
  if (lightbox.getAttribute("aria-hidden") === "true") return
  const delta = e.changedTouches[0].clientX - touchStartX
  if (Math.abs(delta) < 40) return
  delta < 0 ? showNext() : showPrev()
}, { passive: true })
