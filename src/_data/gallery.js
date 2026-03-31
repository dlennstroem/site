const imageManifest = require('./imageManifest.json')

module.exports = {
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