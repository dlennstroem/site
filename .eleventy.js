const Image = require("@11ty/eleventy-img")
const path = require("path")

module.exports = function(eleventyConfig) {
  eleventyConfig.addPassthroughCopy("src/assets/css/style.css")
  eleventyConfig.addPassthroughCopy({"src/assets/favicon": "/favicon"})
  // eleventyConfig.addPassthroughCopy("src/assets/images")
  eleventyConfig.addPassthroughCopy("src/scripts")

  eleventyConfig.addShortcode(
    "headers",
    (title, subtitle) => 
      `<h1>${title}</h1>
        <p>${subtitle}</p>`
  )


  eleventyConfig.addNunjucksAsyncShortcode("optimizedImage", async function(src, alt, sizes, widths) {
    widths = widths || [400, 800, 1200, 1600]
    let metadata = await Image(src, {
      widths: widths,
      formats: ["avif", "webp", "jpeg"],
      urlPath: "/assets/images/optimized/",
      outputDir: "./_site/assets/images/optimized/",
      filenameFormat: function (id, src, width, format, options) {
        const extension = path.extname(src)
        const name = path.basename(src, extension)
        return `${name}-${width}w.${format}`
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

  eleventyConfig.addNunjucksAsyncShortcode("getOptimizedUrl", async function(src, widths) {
    widths = widths || [2000]
    let metadata = await Image(src, {
      widths: widths,
      formats: ["avif", "webp", "jpeg"],
      urlPath: "/assets/images/optimized/",
      outputDir: "./_site/assets/images/optimized/",
      sharpAvifOptions: {
        quality: 70
      },
      filenameFormat: function (id, src, width, format, options) {
        const extension = path.extname(src)
        const name = path.basename(src, extension)
        return `${name}-${width}w.${format}`
      }
    })

    if (metadata.avif?.[0]) return metadata.avif[0].url
    if (metadata.webp?.[0]) return metadata.webp[0].url
    return metadata.jpeg[0].url
  })

  eleventyConfig.addNunjucksAsyncShortcode("heroImage", async function(src, alt) {
    let metadata = await Image(src, {
      widths: [2000, 2400],
      formats: ["avif", "webp", "jpeg"],
      urlPath: "/assets/images/optimized/",
      outputDir: "./_site/assets/images/optimized/",
      sharpAvifOptions: {
        quality: 70
      }
    });

    let imageAttributes = {
      alt,
      sizes: "100vw", 
      loading: "eager", 
      fetchpriority: "high",
      decoding: "sync",
    };

    return Image.generateHTML(metadata, imageAttributes);
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