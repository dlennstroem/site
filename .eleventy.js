const Image = require("@11ty/eleventy-img")
const faviconsPlugin = require("eleventy-plugin-gen-favicons")
const path = require("path")
const fs = require("fs")

module.exports = function(eleventyConfig) {
  eleventyConfig.addPassthroughCopy("src/assets/css/style.css")
  // eleventyConfig.addPassthroughCopy({"src/assets/fonts": "assets/fonts"})
  eleventyConfig.addPassthroughCopy("src/scripts")

  eleventyConfig.addShortcode(
    "headers",
    (title, subtitle) => 
      `<h1>${title}</h1>
        <p>${subtitle}</p>`
  )
  eleventyConfig.addPlugin(faviconsPlugin, {})


  const imageOptions = {
    urlPath: "/assets/images/optimized/",
    outputDir: "./_site/assets/images/optimized/",
    cacheOptions: {
      duration: "1y",
      directory: ".cache/eleventy-img"
    }
  }

  eleventyConfig.addNunjucksAsyncShortcode("optimizedImage", async function(src, alt, sizes, widths) {
    widths = widths || [400, 1200, 1600]
    let metadata = await Image(src, {
      ...imageOptions,
      widths: widths,
      formats: ["avif", "jpeg"],
      // urlPath: "/assets/images/optimized/",
      // outputDir: "./_site/assets/images/optimized/",
      sharpAvifOptions: {
        quality: 70
      },
      filenameFormat: function (id, src, width, format) {
        const extension = path.extname(src)
        const name = path.basename(src, extension)
        return `${name}-${width}w.${format}`
      }
    })

    const placeholder = await Image(src, {
      ...imageOptions,
      widths: [20],
      formats: ["jpeg"],
      sharpWebpOptions: { quality: 40 }
    })
    
    const primaryImageData = metadata.jpeg[0]
    const aspectRatio = primaryImageData.width / primaryImageData.height

    // Generate base64 string for the lowest quality image (20px width) for blurred placeholder effect
    // const lowsrc = metadata.jpeg.find(image => image.width === 20)
    const base64 = fs.readFileSync(placeholder.jpeg[0].outputPath).toString("base64")
    const base64String = `data:image/jpeg;base64,${base64}`


    let imageAttributes = {
      alt,
      sizes,
      loading: "lazy",
      decoding: "async",
      class: "blur-load",
      style: `width: 100%; height: auto; aspect-ratio: ${aspectRatio}; background-image: url(${base64String}); background-size: cover;`, // style for blurred placeholder effect
      onload: "this.classList.add('loaded')"
    }
    return Image.generateHTML(metadata, imageAttributes)
  })

  eleventyConfig.addNunjucksAsyncShortcode("getOptimizedUrl", async function(src, widths) {
    widths = widths || [2000]
    let metadata = await Image(src, {
      ...imageOptions,
      widths: widths,
      formats: ["avif", "jpeg"],
      // urlPath: "/assets/images/optimized/",
      // outputDir: "./_site/assets/images/optimized/",
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
    return metadata.jpeg[0].url
  })

  eleventyConfig.addNunjucksAsyncShortcode("heroImage", async function(src, alt) {
    let metadata = await Image(src, {
      ...imageOptions,
      widths: [2000, 2400],
      formats: ["avif", "jpeg"],
      // urlPath: "/assets/images/optimized/",
      // outputDir: "./_site/assets/images/optimized/",
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
        layouts: "_layouts"
        // output: "_site"
    }
  }
}