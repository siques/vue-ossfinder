const config = {
  // 修改 src 目录 为 examples 目录
  pages: {
    index: {
      entry: "src/main.js",
      template: "public/index.html",
      filename: "index.html"
    }
  },
  configureWebpack: {
    output: {
      libraryExport: "default"
    }
  },
  css: { extract: false }
};

module.exports = config;
