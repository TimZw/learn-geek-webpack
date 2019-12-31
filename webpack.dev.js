'use strict';

const glob = require('glob');
const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const FriendlyErrorsWebpackPlugin = require('friendly-errors-webpack-plugin');

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
                    chunks: [pageName], //生成的HTML 使用那些chunk 对应entry中的key
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

const {
    entry,
    htmlWebpackPlugins
} = setMPA();

module.exports = {
    // entry: './src/index.js',//打包入口 单入口
/*     entry: { //多入口
        index: './src/index/index.js',
        search: './src/search/index.js'
    }, */
    entry: entry, //多页面（MPA打包）
    output: { //打包输出
        path: path.join(__dirname, 'dist'), //目录
        // filename: 'bundle.js'//文件名称  单入口
        filename: '[name].js' //多入口
    },
    mode: 'development', //当前的构建环境 production
    module: { //loaders 处理webpack不能解析的文件
        rules: [
            {
                test: /\.js$/,
                use: 'babel-loader'
            },
            {
                test: /\.css$/,
                use: [//loader 是链式调用，从右到左
                    'style-loader',
                    'css-loader',
                ]
            },
            {
                test: /\.less$/,
                use: [
                    'style-loader',
                    'css-loader',
                    'less-loader'
                ]
            },
            {
                test: /\.scss$/,
                use: [
                    'style-loader',
                    'css-loader',
                    'sass-loader'
                ]
            },
            {
                test: /\.(png|jpg|gif|jpeg)$/,
                use: 'file-loader'
            },
            {
                test: /\.(png|jpg|gif|jpeg)$/,
                use: [
                    {
                        loader: 'url-loader',
                        options: {
                            limit: 10240
                        }
                    }
                ]
            },
            {
                test: /\.(woff|woff2|eot|eot|ttf)$/,
                use: 'file-loader'
            }
        ]
    },
    plugins: [ //用于打包文件优化，资源管理，环境注入（loaders做不了的事情）；作用于构建过程
        new webpack.HotModuleReplacementPlugin(),
        new CleanWebpackPlugin(),
        new FriendlyErrorsWebpackPlugin(),
    ].concat(htmlWebpackPlugins),
    devServer: {
        contentBase: './dist/',//服务基础目录
        hot: true,//开启热更新
        stats: 'errors-only'
    },
    devtool: 'source-map'
};