const fs = require('fs')
const path = require('path')

function getImages(dirPath) {
    try {
        const files = fs.readdirSync(dirPath)
        const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg']

        return files
            .filter(file => {
                const ext = path.extname(file).toLowerCase()
                return imageExtensions.includes(ext)
            })
            .sort()
    } catch (err) {
        console.error(`Error reading directory ${dirPath}:`, err)
        return []
    }
}

// TODO: Start migration
module.exports = function() {
    const landscapesPath = path.join(__dirname, '../assets/images/landscapes')
    const panoPath = path.join(__dirname, '../assets/images/617')
    const cameraPath = path.join(__dirname, '../assets/images/camera')

    return {
        landscape: {
            images: getImages(landscapesPath)
        },
        pano: {
            images: getImages(panoPath)
        },
        camera: {
            images: getImages(cameraPath)
        }
    }
}