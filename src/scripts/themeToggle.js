const STORAGE_KEY = 'color-theme'

function applyTheme(theme) {
  if (theme) {
    document.documentElement.setAttribute('data-theme', theme)
  } else {
    document.documentElement.removeAttribute('data-theme')
  }
  document.querySelectorAll('.theme-btn').forEach(btn => {
    btn.setAttribute('aria-pressed', btn.dataset.theme === theme ? 'true' : 'false')
  })
}

const saved = localStorage.getItem(STORAGE_KEY) || ''
applyTheme(saved)

document.querySelectorAll('.theme-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const theme = btn.dataset.theme
    applyTheme(theme)
    if (theme) {
      localStorage.setItem(STORAGE_KEY, theme)
    } else {
      localStorage.removeItem(STORAGE_KEY)
    }
  })
})
