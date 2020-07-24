/*
 * @Author: Daiyu
 * @Date: 2019-10-10 16:29:54
 * @Last Modified by: Daiyu
 * @Last Modified time: 2020-07-24 16:38:11
 */

const path = require('path')
const vConsolePlugin = require('vconsole-webpack-plugin') // 引入 移动端模拟开发者工具 插件 （另：https://github.com/liriliri/eruda）
const CompressionPlugin = require('compression-webpack-plugin') //Gzip
const zopfli = require('@gfx/zopfli') //zopfli压缩
const BrotliPlugin = require('brotli-webpack-plugin') //brotli压缩
const productionGzipExtensions = /\.(js|css|json|txt|html|ico|svg)(\?.*)?$/i
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer')
  .BundleAnalyzerPlugin //Webpack包文件分析器
const baseUrl = process.env.NODE_ENV === 'production' ? '/static/' : '/' //font scss资源路径 不同环境切换控制
const resolve = dir => path.join(__dirname, dir)
const IS_PROD = ['production', 'prod'].includes(process.env.NODE_ENV)
module.exports = {
  //基本路径
  // 	baseUrl: './',
  publicPath: './', //vue-cli3.3新版本
  //输出文件目录
  outputDir: 'dist',
  // eslint-loader 是否在保存的时候检查 process.env.NODE_ENV !== 'production'
  lintOnSave: true,
  //放置生成的静态资源 (js、css、img、fonts) 的 (相对于 outputDir 的) 目录。
  assetsDir: 'static',
  //以多页模式构建应用程序。
  // pages: undefined,
  //是否使用包含运行时编译器的 Vue 构建版本,设置为 true 后你就可以在 Vue 组件中使用 template 选项了，但是这会让你的应用额外增加 10kb 左右。
  runtimeCompiler: true,
  // 默认情况下 babel-loader 会忽略所有 node_modules 中的文件。如果你想要通过 Babel 显式转译一个依赖，可以在这个选项中列出来。
  transpileDependencies: [],
  //是否为 Babel 或 TypeScript 使用 thread-loader。该选项在系统的 CPU 有多于一个内核时自动启用，仅作用于生产构建，在适当的时候开启几个子进程去并发的执行压缩
  parallel: require('os').cpus().length > 1,
  //生产环境是否生成 sourceMap 文件，一般情况不建议打开
  productionSourceMap: !IS_PROD,
  // webpack配置
  //对内部的 webpack 配置进行更细粒度的修改 https://github.com/neutrinojs/webpack-chain see https://github.com/vuejs/vue-cli/blob/dev/docs/webpack.md
  chainWebpack: config => {
    // 修复HMR
    config.resolve.symlinks(true)
    // 修复Lazy loading routes Error： Cyclic dependency https://github.com/vuejs/vue-cli/issues/1669
    config.plugin('html').tap(args => {
      args[0].chunksSortMode = 'none'
      return args
    })
    // 添加别名
    config.resolve.alias
      .set('@', resolve('src'))
      .set('assets', resolve('src/assets'))
      .set('components', resolve('src/components'))
      .set('layout', resolve('src/layout'))
      .set('base', resolve('src/base'))
      .set('static', resolve('src/static'))
    /**
     * 删除懒加载模块的prefetch，降低带宽压力
     * https://cli.vuejs.org/zh/guide/html-and-static-assets.html#prefetch
     * 而且预渲染时生成的prefetch标签是modern版本的，低版本浏览器是不需要的
     */
    // config.plugins.delete('prefetch');
    // if(process.env.NODE_ENV === 'production') { // 为生产环境修改配置...process.env.NODE_ENV !== 'development'
    // } else { // 为开发环境修改配置...
    // }
    // Webpack包文件分析器(https://github.com/webpack-contrib/webpack-bundle-analyzer)
    // 打包分析
    if (process.env.IS_ANALYZ) {
      config.plugin('webpack-report').use(BundleAnalyzerPlugin, [
        {
          analyzerMode: 'static'
        }
      ])
    }
    const cdn = {
      // 访问https://unpkg.com/element-ui/lib/theme-chalk/index.css获取最新版本
      css: ['//unpkg.com/element-ui@2.10.1/lib/theme-chalk/index.css'],
      js: [
        '//unpkg.com/vue@2.6.10/dist/vue.min.js', // 访问https://unpkg.com/vue/dist/vue.min.js获取最新版本
        '//unpkg.com/vue-router@3.0.6/dist/vue-router.min.js',
        '//unpkg.com/vuex@3.1.1/dist/vuex.min.js',
        '//unpkg.com/axios@0.19.0/dist/axios.min.js',
        '//unpkg.com/element-ui@2.10.1/lib/index.js'
      ]
    }

    // html中添加cdn
    // config.plugin('html').tap(args => {
    //   args[0].cdn = cdn
    //   return args
    // })
    return config
  },
  //调整 webpack 配置 https://cli.vuejs.org/zh/guide/webpack.html#%E7%AE%80%E5%8D%95%E7%9A%84%E9%85%8D%E7%BD%AE%E6%96%B9%E5%BC%8F
  configureWebpack: config => {
    // 修复HMR
    //生产and测试环境
    let pluginsPro = [
      // new CompressionPlugin({
      //   //文件开启Gzip，也可以通过服务端(如：nginx)(https://github.com/webpack-contrib/compression-webpack-plugin)
      //   filename: '[path].gz[query]',
      //   algorithm: 'gzip',
      //   test: productionGzipExtensions,
      //   threshold: 8192,
      //   minRatio: 0.8
      // })
      // new CompressionPlugin({
      //   algorithm(input, compressionOptions, callback) {
      //     return zopfli.gzip(input, compressionOptions, callback)
      //   },
      //   compressionOptions: {
      //     numiterations: 15,
      //   },
      //   minRatio: 0.8,
      //   test: productionGzipExtensions,
      // }),
      new BrotliPlugin({
        test: productionGzipExtensions,
        minRatio: 0.8
      })
    ]
    //开发环境
    let pluginsDev = [
      //移动端模拟开发者工具(https://github.com/diamont1001/vconsole-webpack-plugin  https://github.com/Tencent/vConsole)
      new vConsolePlugin({
        filter: [], // 需要过滤的入口文件
        enable: process.env.NODE_ENV !== 'production' // 发布代码前记得改回 false
      })
    ]
    // 配置externals引入cdn资源
    // 防止将某些 import 的包(package)打包到 bundle 中，而是在运行时(runtime)再去从外部获取这些扩展依赖
    // config.externals = {
    //   vue: 'Vue',
    //   'vue-router': 'VueRouter',
    //   vuex: 'vuex',
    //   axios: 'axios',
    //   'element-ui': 'ELEMENT'
    // }
    // 利用splitChunks单独打包第三方模块
    config.optimization = {
      splitChunks: {
        // chunks: 表示哪些代码需要优化，有三个可选值：initial(初始块)、async(按需加载块)、all(全部块)，默认为async
        chunks: 'all',
        // // 表示在压缩前的最小模块大小，默认为30000
        // minSize: 30000,
        // // 表示被引用次数，默认为1
        // minChunks: 1,
        // // 按需加载时候最大的并行请求数，默认为5
        // maxAsyncRequests: 5,
        // // 一个入口最大的并行请求数，默认为3
        // maxInitialRequests: 3,
        // // 命名连接符
        // automaticNameDelimiter: '~',
        // // 拆分出来块的名字，默认由块名和hash值自动生成
        // name: true,
        cacheGroups: {
          libs: {
            name: 'chunk-libs',
            test: /[\\/]node_modules[\\/]/,
            priority: 10,
            chunks: 'initial'
          },
          elementUI: {
            name: 'chunk-elementUI',
            priority: 20,
            test: /[\\/]node_modules[\\/]element-ui[\\/]/,
            chunks: 'all'
          },
          antdUI: {
            name: 'chunk-antdUI',
            priority: 20,
            test: /[\\/]node_modules[\\/]ant-design-vue[\\/]/,
            chunks: 'all'
          },
          commons: {
            name: 'chunk-commons',
            test: resolve('src/components'), // can customize your rules
            minChunks: 3, //  minimum common number
            priority: 5,
            reuseExistingChunk: true
          }
        }
      }
    }
    if (process.env.NODE_ENV === 'production') {
      // 为生产环境修改配置...process.env.NODE_ENV !== 'development'
      //			config.entry.app = ['babel-polyfill', './src/main.js'];
      config.plugins = [...config.plugins, ...pluginsPro]
    } else {
      // 为开发环境修改配置...
      config.plugins = [...config.plugins, ...pluginsDev]
    }
  },
  css: {
    // 启用 CSS modules
    modules: false,
    // 是否使用css分离插件
    extract: IS_PROD,
    // 开启 CSS source maps，一般不建议开启
    sourceMap: false,
    // css预设器配置项
    loaderOptions: {
      sass: {
        //设置css中引用文件的路径，引入通用使用的scss文件（如包含的@mixin）
        // data: `
        // $baseUrl: "/";
        // @import '@/assets/scss/_common.scss';
        // `,
      }
    }
  },
  // webpack-dev-server 相关配置 https://webpack.js.org/configuration/dev-server/
  devServer: {
    // host: 'localhost',
    // host: "0.0.0.0",
    port: 8000, // 端口号
    https: false, // https:{type:Boolean}
    open: true, //配置自动启动浏览器  http://XXX.XXX.X.XX:7071/rest/XXX/
    hotOnly: true, // 热更新
    // proxy: 'http://localhost:8000'           // 配置跨域处理,只有一个代理
    proxy: {
      //配置自动启动浏览器
      '/api*': {
        // 目标代理接口地址
        target: 'http://XXX.XXX.X.XX:7071',
        changeOrigin: true,
        // ws: true,//websocket支持
        secure: false,
        pathRewrite: {
          '^/api': '/'
        }
      }
      // "/x/*": {
      //   target: "http://XXX.XXX.X.XX:2018",
      //   changeOrigin: true,
      //   secure: false
      // }
    }
  },

  // 第三方插件配置 https://www.npmjs.com/package/vue-cli-plugin-style-resources-loader
  pluginOptions: {
    'style-resources-loader': {
      //https://github.com/yenshih/style-resources-loader
      preProcessor: 'scss', //声明类型
      patterns: [
        //				path.resolve(__dirname, './src/assets/scss/_common.scss'),
      ]
      //			injector: 'append'
    }
  }
}
