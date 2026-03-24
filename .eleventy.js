const faviconsPlugin = require("eleventy-plugin-gen-favicons")
const imageManifest = require("./src/_data/imageManifest.json")
const s3Url = "https://s3.dalen.ch/"

module.exports = function (eleventyConfig) {
  eleventyConfig.addPassthroughCopy("src/assets/css/style.css")
  eleventyConfig.addPassthroughCopy("src/scripts")
  eleventyConfig.addPassthroughCopy("src/robots.txt")

  eleventyConfig.addShortcode(
    "headers",
    (title, subtitle) =>
      `<h1>${title}</h1>
        <p>${subtitle}</p>`
  )
  eleventyConfig.addPlugin(faviconsPlugin, {})

  eleventyConfig.addNunjucksAsyncShortcode("heroImage", async function (name, galleryPrefix) {
    const imageData = imageManifest[galleryPrefix][name]
    if (!imageData) throw new Error(`Image ${name} in gallery ${galleryPrefix} not found`)

    // TODO: Create srcsets dynamically based on available formats and widths in the manifest
    const avifSrcSet = imageData.urls.avif.join(",\n  ")
    const jpegSrcSet = imageData.urls.jpeg.join(",\n  ")
    const sizes = imageData.sizes || "100vw"

    // TODO: Add placeholder image if not found
    return `
      <picture class="hero-image">
        <source type="image/avif" srcset="${avifSrcSet}" sizes="${sizes}">
        <source type="image/jpeg" srcset="${jpegSrcSet}" sizes="${sizes}">
        <img src="${imageData.urls.jpeg[0].split(" ")[0]}" 
            alt="${imageData.alt}" 
            loading="eager" 
            fetchpriority="high"
            decoding="sync" 
            sizes="${sizes}">
      </picture>
      `
  })

  eleventyConfig.addNunjucksAsyncShortcode("galleryImage", async function (name, galleryPrefix) {

    const imageData = imageManifest[galleryPrefix][name]

    if (!imageData) throw new Error(`Image ${name} in gallery ${galleryPrefix} not found`)

    // TODO: Create srcsets dynamically based on available formats and widths in the manifest
    const avifSrcSet = imageData.urls.avif.join(",\n  ")
    const jpegSrcSet = imageData.urls.jpeg.join(",\n  ")
    const sizes = imageData.sizes || "100vw"

    // TODO: Add placeholder image if not found
    const placeholderUrl = `${s3Url}${name}-20w.jpeg`
    return `
      <picture class="blur-load ${galleryPrefix}" style="background-image: url('${placeholderUrl}');">
        <source type="image/avif" srcset="${avifSrcSet}" sizes="${sizes}">
        <source type="image/jpeg" srcset="${jpegSrcSet}" sizes="${sizes}">
        <img src="${imageData.urls.jpeg[0].split(" ")[0]}" 
            alt="${imageData.alt}" 
            loading="lazy" 
            decoding="async" 
            class="gallery-image" 
            sizes="${sizes}"
            onload="this.classList.add('loaded')">
      </picture>
      `
  })

  eleventyConfig.addNunjucksAsyncShortcode("getLightboxImage", async function(name, galleryPrefix) {
    const imageData = imageManifest[galleryPrefix][name]
    if (!imageData) throw new Error(`Image ${name} in gallery ${galleryPrefix} not found`)

    const formats = imageData.urls.avif?.length
    ? imageData.urls.avif
    : imageData.urls.jpeg
    const largest = formats
      .map(entry => {
        const [url, width] = entry.split(" ")
        return { url, width: parseInt(width.replace("w", "")) }
      })
      .sort((a, b) => b.width - a.width)[0]

    return largest.url
  })

  const eleventyNavigationPlugin = require("@11ty/eleventy-navigation")
  eleventyConfig.addPlugin(eleventyNavigationPlugin)

  // Markdown-support:

  // const markdownIt = require("markdown-it")
  // const markdownItAttrs = require('markdown-it-attrs')

  // const markdownLib = markdownIt({
  //   html: true,
  //   linkify: true,
  //   breaks: true,
  //   typographer: true
  // }).use(markdownItAttrs)

  // eleventyConfig.setLibrary("md", markdownLib)

  return {
    dir: {
      input: "src",
      data: "_data",
      includes: "_includes",
      layouts: "_layouts"
      // output: "_site"
    }
  }
}