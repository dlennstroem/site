const navContainer = document.querySelector(".nav-container")
const nav = document.querySelector("nav")
const toggle = document.querySelector(".nav-toggle")

let lastScrollY = window.scrollY
let scrollUpDistance = 0
const HIDE_THRESHOLD = 80
const SHOW_THRESHOLD = 120

window.addEventListener("scroll", () => {
  const currentScrollY = window.scrollY
  const delta = lastScrollY - currentScrollY

  if (currentScrollY < HIDE_THRESHOLD) {
    navContainer.classList.remove("nav-hidden")
    scrollUpDistance = 0
  } else if (delta < 0) {
    scrollUpDistance = 0
    navContainer.classList.add("nav-hidden")
    if (toggle) {
      nav.classList.remove("open")
      toggle.setAttribute("aria-expanded", "false")
      toggle.innerHTML = "&#9776;"
    }
  } else {
    scrollUpDistance += delta
    if (scrollUpDistance >= SHOW_THRESHOLD) {
      navContainer.classList.remove("nav-hidden")
    }
  }

  lastScrollY = currentScrollY
}, { passive: true })

if (toggle) {
  toggle.addEventListener("click", () => {
    const isOpen = nav.classList.toggle("open")
    toggle.setAttribute("aria-expanded", isOpen)
    toggle.innerHTML = isOpen ? "&times;" : "&#9776;"
  })

  // Close menu when a link is tapped
  document.querySelectorAll(".nav-links a").forEach((link) => {
    link.addEventListener("click", () => {
      nav.classList.remove("open")
      toggle.setAttribute("aria-expanded", "false")
      toggle.innerHTML = "&#9776;"
    })
  })

  // Close menu when tapping outside
  document.addEventListener("click", (e) => {
    if (!nav.contains(e.target)) {
      nav.classList.remove("open")
      toggle.setAttribute("aria-expanded", "false")
      toggle.innerHTML = "&#9776;"
    }
  })
}
