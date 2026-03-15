const Image = require("@11ty/eleventy-img")
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

  eleventyConfig.addNunjucksAsyncShortcode("Image", async (src, alt) => {
    if (!alt) {
      // throw new Error(`Missing \`alt\` on image from: ${src}`)
    }

    let stats = await Image(src, {
      widths: [25, 320, 640, 960, 1200, 1800, 2400, 4000],
      formats: ["webp", "jpeg"],
      urlPath: "/assets/images/",
      outputDir: "./_site/assets/images/",
    })

    let lowsestSrc = stats["jpeg"][0]
    const srcset = Object.keys(stats).reduce(
      (acc, format) => ({
        ...acc,
        [format]: stats[format].reduce(
          (_acc, curr) => `${_acc} ${curr.srcset} ,`,
          ""
        )
      })
    )

    const source = `<source type="image/webp" srcset="${srcset["webp"]}">`

    const img = `<img
      loading="lazy"
      alt="${alt}"
      src="${lowsestSrc.url}"
      sizes="(max-width: 1024) 1024px, 100vw"
      srcset="${srcset["jpeg"]}"
      width="${lowsestSrc.width}"
      height="${lowsestSrc.height}">`

    return `<div class="image-wrapper"><picture> ${source} ${img} </picture></div>`
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