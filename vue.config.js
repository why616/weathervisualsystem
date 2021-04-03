module.exports = {
    configureWebpack: {
        externals: {
            vue:'Vue',
            'leaflet':"L",
            'echarts':'echarts',
            'element-ui': 'ELEMENT'
        }
    }
    // chainWebpack: config => {
    //     config
    //       .plugin('html')
    //       .tap(args => {
    //         args[0].title = '靛蓝椅子的小站'
    //         return args;
    //       })
    //   }
}
