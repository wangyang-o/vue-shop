module.exports = {
    // publicPath: process.env.NODE_ENV === 'production' ? './' : '/',
    chainWebpack: config => {
        config.when(process.env.NODE_ENV === 'production', config => {
            config.set('externals', {
                vue: 'Vue',
                axios: 'axios',
                echarts: 'echarts',
                nprogress: 'NProgress',
              
            });
        });
    },

}