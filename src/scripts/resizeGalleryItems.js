function resizeGalleryItems() {
    const grid = document.getElementById('gallery')
    const rowHeight = parseInt(window.getComputedStyle(grid).getPropertyValue('grid-auto-rows'))
    const rowGap = parseInt(window.getComputedStyle(grid).getPropertyValue('gap'))

    const items = grid.querySelectorAll('img')
    items.forEach(item => {
        const rowSpan = Math.ceil((item.getBoundingClientRect().height + rowGap) / (rowHeight + rowGap))
        item.style.gridRowEnd = `span ${rowSpan}`
    })
}

function waitForImages() {
    const images = document.querySelectorAll('#gallery img')
    let loadedImages = 0

    if (images.length === 0) return
    images.forEach(img => {
        if (img.complete) {
            loadedImages++
        } else {
            img.addEventListener('load', () => {
                loadedImages++
                if (loadedImages === images.length) {
                    resizeGalleryItems()
                }
            })
        }
    })

    if (loadedImages === images.length) {
        resizeGalleryItems()
    }
}

document.addEventListener('DOMContentLoaded', waitForImages)
window.addEventListener('resize', resizeGalleryItems)