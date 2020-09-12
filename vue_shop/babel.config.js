module.exports = {
  presets: [
    '@vue/cli-plugin-babel/preset'
  ],
  'env': {
    // 开发环境
    'development': {
      'plugins': ['dynamic-import-node']
    },
    // 生产环境
    'production': {
      'plugins': ['transform-remove-console']
    }
  }
}
