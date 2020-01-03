'use strict';

const glob = require('glob');//匹配规则，如路径
const path = require('path');
const webpack = require('webpack');

const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const PurgecssPlugin = require('purgecss-webpack-plugin');//擦除无用css

const OptimizeCssAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const HTMLInlineCSSWebpackPlugin = require('html-inline-css-webpack-plugin').default;
const HtmlWebpackExternalsPlugin = require('html-webpack-externals-plugin');
const FriendlyErrorsWebpackPlugin = require('friendly-errors-webpack-plugin');

const SpeedMeasureWebpackPlugin = require('speed-measure-webpack-plugin');//分析插件打包速度
const { BundleAnalyzerPlugin  } = require('webpack-bundle-analyzer');//打包体积分析
//多进程、缓存
const HappyPack = require('happypack');//多进程打包
const TerserPlugin = require('terser-webpack-plugin');//多进程并行压缩代码
const HardSourceWebpackPlugin = require('hard-source-webpack-plugin');//提升模块转换阶段的缓存
//TODO: build don't finish
// const threadLoader = require('thread-loader');

/* threadLoader.warmup({
    // pool options, like passed to loader options
    // must match loader options to boot the correct pool
    poolTimeout: 2000
}, [
    // modules to load
    // can be any module, i. e.
    'babel-loader',
    // 'babel-preset-es2015',
    // 'sass-loader',
]); */

const smp = new SpeedMeasureWebpackPlugin();

const PATHS = {
    src: path.join(__dirname, 'src')
};

//多页面（MPA打包）动态设置
const setMPA = () => {
    const entry = {};
    const htmlWebpackPlugins = [];

    const entryFiles = glob.sync(path.join(__dirname, './src/*/index.js'));

    Object.keys(entryFiles)
        .map((index) => {
            const entryFile = entryFiles[index];

            const match = entryFile.match(/src\/(.*)\/index\.js/);
            const pageName = match && match[1];

            entry[pageName] = entryFile;
            htmlWebpackPlugins.push(
                new HtmlWebpackPlugin({ //压缩HTML
                    template: path.join(__dirname, `src/${pageName}/index.html`), //模板
                    filename: `${pageName}.html`, //打包后文件的名称
                    chunks: [//生成的HTML引入js文件名称 使用那些chunk 对应entry中的key
                        'vendors',
                        'commons',
                        pageName
                    ],
                    inject: true, //打包后的chunk 自动注入到打包后的HTML文件中
                    minify: {
                        html5: true,
                        collapseWhitespace: true,
                        preserveLineBreaks: false,
                        minifyCSS: true,
                        minifyJS: true,
                        removeComments: false
                    }
                })
            )

        })
    return {
        entry,
        htmlWebpackPlugins
    }
};

const { entry, htmlWebpackPlugins } = setMPA();

// module.exports = smp.wrap({
module.exports = {
    // entry: './src/index.js',//打包入口 单入口
    // entry: { //多入口
    //     index: './src/index/index.js',
    //     search: './src/search/index.js'
    // },
    entry: entry,
    output: { //打包输出
        path: path.join(__dirname, 'dist'), //目录
        // filename: 'bundle.js'//文件名称  单入口
        filename: '[name]_[chunkhash:8].js' //多入口  + 文件指纹
    },
    mode: 'production', //当前的构建环境 production
    module: { //loaders 处理webpack不能解析的文件
        rules: [
            {
                test: /\.js$/,
                include: path.resolve('src'),
                use: [
/*                     {
                        loader: 'thread-loader',//webpack多进程多实例
                        options: {
                            workers: 3//进程
                        }
                    },
                    'babel-loader', */
                    // 'eslint-loader'
                    'happypack/loader'
                ]
            },
            {
                test: /\.css$/,
                use: [//loader 是链式调用，从右到左
                    MiniCssExtractPlugin.loader, //与'style-loader'产生冲突，删除
                    'css-loader',
                ]
            },
            {
                test: /\.less$/,
                use: [
                    MiniCssExtractPlugin.loader,
                    'css-loader',
                    'less-loader',
                    {
                        loader: 'postcss-loader',
                        options: {
                            plugins: () => [
                                require('autoprefixer')({
                                    browsers: ['last 2 version', '>1%', 'ios 7']
                                })
                            ]
                        }
                    },
                    {
                        loader: 'px2rem-loader',
                        options: {
                            remUnit: 75, //1rem = 75px
                            remPrecision: 8, //小数点后构建
                        }
                    }
                ]
            },
            {
                test: /\.scss$/,
                use: [
                    MiniCssExtractPlugin.loader,
                    'css-loader',
                    'sass-loader',
                    {
                        loader: 'postcss-loader',
                        options: {
                            plugins: () => [
                                require('autoprefixer')({
                                    overrideBrowserslist: ['last 2 version', '>1%', 'ios 7']
                                })
                            ]
                        }
                    },
                    {
                        loader: 'px2rem-loader',
                        options: {
                            remUnit: 75,//1rem = 75px
                            remPrecision: 8,//小数点后构建
                        }
                    }
                ]
            },
            // {
            //     test: /\.(png|jpg|gif|jpeg)$/,
            //     use: [
            //         {
            //             loader: 'file-loader',
            //             options: {
            //                 name: '[name]_[hash:8].[ext]'//图片的文件指纹
            //             }
            //         }
            //     ]
            // },
            {
                test: /\.(png|jpg|gif|jpeg)$/,
                use: [
                    {
                        loader: 'url-loader',
                        options: {
                            name: '[name]_[hash:8].[ext]', //图片的文件指纹
                            limit: 10240
                        }
                    }
                ]
            },
            {
                test: /\.(woff|woff2|eot|eot|ttf)$/,
                use: [
                    {
                        loader: 'file-loader',
                        options: {
                            name: '[name]_[hash:8].[ext]', //图片的文件指纹
                            limit: 10240
                        }
                    }
                ]
            }
        ]
    },
    plugins: [ //用于打包文件优化，资源管理，环境注入（loaders做不了的事情）；作用于构建过程
        new MiniCssExtractPlugin({
            filename: '[name]_[contenthash:8].css',//css 文件指纹 用contenthash
        }),
        new OptimizeCssAssetsPlugin({//压缩css
            assetNameRegExp: /\.css$/g,
            cssProcessor: require('cssnano')//cssnano预处理器
        }),
        new CleanWebpackPlugin(), //清除dist文件下内容
        new FriendlyErrorsWebpackPlugin(),//优化显示日志
        function () {/* 捕获并处理构件错误 */
            /* this.plugin('done', (stats) => { webpack3 */
            this.hooks.done.tap('done', (stats) => {
                if (stats.compilation.errors && stats.compilation.errors.length && process.argv.indexOf('--watch') == -1) {
                    /* 可以自动上报错误 */
                    console.log('build error');
                    process.exit(1);
                }
            })
        },
        new webpack.DllReferencePlugin({//预编译分包 如react
            manifest: require('./build/library/library.json')
        }),
        // new BundleAnalyzerPlugin(),
        new HappyPack({
            // 3) re-add the loaders you replaced above in #1:
            loaders: ['babel-loader?cacheDirectory=true']//设置开启缓存
        }),
        new HardSourceWebpackPlugin(),
        new PurgecssPlugin({
            paths: glob.sync(`${PATHS.src}/**/*`, {
                nodir: true
            }),
        }),
/*         new HtmlWebpackExternalsPlugin({//分离公共引入包如react
            externals: [
                {
                    module: 'react',
                    entry: 'https://cdn.bootcss.com/react/16.10.2/umd/react.production.min.js',
                    global: 'React',
                },
                {
                    module: 'react-dom',
                    entry: 'https://cdn.bootcss.com/react-dom/16.10.2/umd/react-dom.production.min.js',
                    global: 'ReactDOM',
                },
            ],
        }), */
    ]
    .concat(htmlWebpackPlugins),
    //TODO: HTMLInlineCSSWebpackPlugin与SpeedMeasureWebpackPlugin一起用会报错,目前没有解决方法
    // .concat(new HTMLInlineCSSWebpackPlugin()),//css 内联
    optimization: {
        splitChunks: {
            minSize: 0,//文件超过多少才打包，//提出公共文件
            cacheGroups: {
                // vendor: { //提出引用文件
                //     test: /(react|react-dom)/,
                //     name: 'vendors',
                //     chunks: 'all'
                // },
                commons: {
                    name: 'commons',
                    chunks: 'all',
                    minChunks: 2,//至少引用次数
                }
            }
        },
        minimizer: [
            new TerserPlugin({
                parallel: true,//并行
                cache: true
            }),
        ],
    },
    resolve: {//缩短构建目标
        alias: {
            'react': path.resolve(__dirname, './node_modules/react/umd/react.production.min.js'),
            'react-dom': path.resolve(__dirname, './node_modules/react-dom/umd/react-dom.production.min.js')
        },
        extensions: ['.js'],
        mainFields: ['main']
    },
    stats: 'errors-only'
};
// });