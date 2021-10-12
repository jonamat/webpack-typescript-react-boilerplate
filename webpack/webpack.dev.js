const path = require('path');
const { merge } = require('webpack-merge');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const webpack = require('webpack');
const dotenv = require('dotenv');

const common = require('./webpack.common');

const rules = [
    {
        test: /\.tsx?$/,
        exclude: /node_modules/,
        use: {
            loader: 'babel-loader',
            options: {
                comments: true, // Preserve webpack config comments
                sourceMaps: true,
                presets: ['@babel/preset-env', '@babel/react', '@babel/typescript'],
                plugins: [
                    'babel-plugin-typescript-to-proptypes', // transform static to runtime type checking
                ],
            },
        },
    },
];

module.exports = merge(common, {
    mode: 'development',
    devtool: 'source-map',
    plugins: [
        // Override process.env with custom vars defined in .env
        new webpack.DefinePlugin(
            Object.fromEntries(
                Object.entries({
                    ...dotenv.config({ debug: true, path: path.resolve(__dirname, '..', '.env') }).parsed,
                    NODE_ENV: 'development',
                }).map(([key, value]) => ['process.env.' + key, JSON.stringify(value)]),
            ),
        ),

        // Generate views
        new HtmlWebpackPlugin({
            template: path.resolve(__dirname, '../', 'src', 'templates', 'index.ejs'),
            templateParameters: {
                // Put here vars
            },
            minify: false,
        }),
    ],
    module: { rules },
    devServer: {
        static: path.resolve(__dirname, '../', 'public'),
        compress: false,
        historyApiFallback: true,
        host: '0.0.0.0',
        port: 3000,
        client: {
            progress: true,
            overlay: true,
        },
    },
});