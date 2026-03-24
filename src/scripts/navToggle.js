const nav = document.querySelector("nav")
const toggle = document.querySelector(".nav-toggle")

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
