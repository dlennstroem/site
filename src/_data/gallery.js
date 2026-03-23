const fs = require('fs')
const path = require('path')
const imageManifest = require('../_data/imageManifest.json')

function getImages(dirPath) {
    try {
        const files = fs.readdirSync(dirPath)
        const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.avif']

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
    // const landscapesPath = path.join(__dirname, '../assets/images/landscapes')
    // const panoPath = path.join(__dirname, '../assets/images/617')
    // const cameraPath = path.join(__dirname, '../assets/images/camera')

    return {
        landscape: {
            // images: getImages(landscapesPath)
            images: Object.keys(imageManifest.landscape)
        },
        pano: {
            // images: getImages(panoPath)
            images: Object.keys(imageManifest.pano)
        },
        about: {
            // images: getImages(cameraPath)
            images: Object.keys(imageManifest.about)
        }
    }
}