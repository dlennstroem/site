 const imageManifest = require('../_data/imageManifest.json')

module.exports = function() {
    return {
        landscape: {
            images: Object.keys(imageManifest.landscape)
        },
        pano: {
            images: Object.keys(imageManifest.pano)
        },
        about: {
            images: Object.keys(imageManifest.about)
        }
    }
}