module.exports = function(eleventyConfig) {
  eleventyConfig.addPassthroughCopy("src/assets/css/style.css");
  eleventyConfig.addPassthroughCopy("src/assets/images")
  eleventyConfig.addPassthroughCopy("src/scripts")

  eleventyConfig.addShortcode(
    "headers",
    (title, subtitle) => 
      `<h1>${title}</h1>
        <p>${subtitle}</p>`
  )

  

  const eleventyNavigationPlugin = require("@11ty/eleventy-navigation");

  module.exports = eleventyConfig => {
    eleventyConfig.addPlugin(eleventyNavigationPlugin);
  };


  const markdownIt = require("markdown-it")
  const markdownItAttrs = require('markdown-it-attrs')

  const markdownLib = markdownIt({
    html: true,
    linkify: true,
    breaks: true,
    typographer: true
  }).use(markdownItAttrs)

  eleventyConfig.setLibrary("md", markdownLib)



  return {
    dir: {
        input: "src",
        data: "_data",
        includes: "_includes",
        layouts: "_layouts",
    }
  }
}