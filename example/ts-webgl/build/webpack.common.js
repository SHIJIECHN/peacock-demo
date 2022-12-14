const path = require('path')
const webpack = require('webpack')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const { srcPath, tplPath } = require('./paths.js');

module.exports = {
    entry: path.join(srcPath, 'index'),
    module: {
        rules: [
            {
                test: /\.js$/,
                use: ['babel-loader'],
                include: srcPath,
                exclude: /node_modules/
            },
            {
                test: /\.tsx?$/,
                use: 'ts-loader',
                exclude: /node_modules/,
            },
            {
                test: /\.css$/,
                use: ['style-loader', 'css-loader', 'postcss-loader']  // loader 的执行顺序是：从后往前
            },
            {
                test: /\.less$/,
                use: ['style-loader', 'css-loader', 'postcss-loader', 'less-loader']  // 增加 'less-loader' ，注意顺序
            },
            {
                test: /\.(woff2?|ttf|eot|otf)(\?.*)?$/,
                use: [
                    {
                        loader: 'url-loader',
                        options: {
                            limit: 500 * 1024, // <=500kb 则使用 base64 （即，希望字体文件一直使用 base64 ，而不单独打包）
                        },
                    },
                ],
            },
            {
                test: /\.(png|jpg)?$/,
                type: 'asset/resource'
            },
            {
                test: /\.(glsl|vs|fs)$/,
                loader: 'ts-shader-loader'
            }
        ]
    },
    resolve: {
        extensions: ['.tsx', '.ts', '.js'],
        alias: {
            'utils': path.resolve('src/utils'),
            'resource': path.resolve('src/resource')
        }
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: path.join(tplPath, 'index.html'),
            filename: 'index.html'
        })
    ]
}
