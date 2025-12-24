const { defineConfig } = require('@vue/cli-service');

module.exports = defineConfig({
  publicPath: process.env.DEPLOY_TARGET === 'netlify' ? '/' : '/political-spectrum/',
  transpileDependencies: true,
  devServer: {
    port: 8080,
    host: 'localhost',
  },
  configureWebpack: {
    resolve: {
      fallback: {
        crypto: false,
      },
    },
  },
  chainWebpack: (config) => {
    config.resolve.symlinks(false);
    config.module
      .rule('mjs')
      .test(/\.mjs$/)
      .include.add(/node_modules/)
      .end()
      .type('javascript/auto');
  },
});
