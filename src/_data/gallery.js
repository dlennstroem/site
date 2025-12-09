const fs = require('fs')
const path = require('path')

module.exports = function() {
    const galleryPath = path.join(__dirname, '../assets/images/gallery')

    try {
        const files = fs.readdirSync(galleryPath)
        const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg']

        const images = files
            .filter(file => {
                const ext = path.extname(file).toLowerCase()
                return imageExtensions.includes(ext)
            })
            .sort()
        return { images }
    } catch (err) {
        console.error('Error reading gallery directory:', err)
        return { images: [] }
    }
}