const path = require('path');
const { merge } = require('webpack-merge');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const webpack = require('webpack');
const dotenv = require('dotenv');
const common = require('./webpack.common');

const envs = dotenv.config({ debug: true, path: path.resolve(__dirname, '..', '.env') }).parsed

module.exports = merge(common, {
    mode: 'development',
    devtool: 'eval-cheap-module-source-map',

    module: {
        rules: [
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
                            '@babel/plugin-transform-runtime',
                            'babel-plugin-typescript-to-proptypes', // transform static to runtime type checking
                        ],
                    },
                },
            },
        ]
    },
    plugins: [
        // Override process.env with custom vars defined in .env
        new webpack.DefinePlugin(
            Object.fromEntries(
                Object.entries({
                    ...envs,
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


    devServer: {
        static: path.resolve(__dirname, '../', 'public'),
        compress: false,
        historyApiFallback: true,
        host: 'localhost', // Set to 0.0.0.0 for external access
        open: ['/index.html'],
        watchFiles: ['src/**/*', 'public/**/*'],
        port: envs.PORT,
        client: {
            progress: true,
            logging: 'warn',
            overlay: {
                errors: true,
                warnings: false,
            },
        },
    },
});