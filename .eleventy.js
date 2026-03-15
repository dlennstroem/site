const Image = require("@11ty/eleventy-img")
const path = require("path")

module.exports = function(eleventyConfig) {
  eleventyConfig.addPassthroughCopy("src/assets/css/style.css")
  // eleventyConfig.addPassthroughCopy("src/assets/images")
  eleventyConfig.addPassthroughCopy("src/scripts")

  eleventyConfig.addShortcode(
    "headers",
    (title, subtitle) => 
      `<h1>${title}</h1>
        <p>${subtitle}</p>`
  )


  eleventyConfig.addNunjucksAsyncShortcode("optimizedImage", async function(src, alt, sizes) {
    let metadata = await Image(src, {
      widths: [400, 800, 1200, 1600], // Mobile to Desktop sizes
      formats: ["webp", "jpeg"],
      urlPath: "/assets/images/optimized/",
      outputDir: "./_site/assets/images/optimized/",
      filenameFormat: function (id, src, width, format, options) {
        const extension = path.extname(src);
        const name = path.basename(src, extension);
        return `${name}-${width}w.${format}`;
      }
    })
    let imageAttributes = {
      alt,
      sizes,
      loading: "lazy",
      decoding: "async",
      style: "width: 100%; height: auto;"
    }
    return Image.generateHTML(metadata, imageAttributes)
  })

  eleventyConfig.addNunjucksAsyncShortcode("getOptimizedUrl", async function(src) {
    let metadata = await Image(src, {
      widths: [1600],
      formats: ["jpeg"],
      urlPath: "/assets/images/optimized/",
      outputDir: "./_site/assets/images/optimized/",
      
      filenameFormat: function (id, src, width, format, options) {
        const extension = path.extname(src)
        const name = path.basename(src, extension)
        return `${name}-${width}w.${format}`
      }
    })

    // Return the URL of the last (largest) image in the jpeg array
    return metadata.jpeg[metadata.jpeg.length - 1].url
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
        layouts: "_layouts",
    }
  }
}