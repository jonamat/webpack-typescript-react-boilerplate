const path = require('path');
const { merge } = require('webpack-merge');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
// const workboxPlugin = require('workbox-webpack-plugin');
// const Visualizer = require('webpack-visualizer-plugin2');
// const StatsWriterPlugin = require('webpack-stats-plugin').StatsWriterPlugin;
const webpack = require('webpack');
const dotenv = require('dotenv');

const common = require('./webpack.common');

const rules = [
    {
        test: /\.tsx?$/,
        exclude: /node_modules/,
        use: [
            {
                loader: 'babel-loader',
                options: {
                    comments: true, // Preserve webpack config comments
                    sourceMaps: false,
                    presets: ['@babel/preset-env', '@babel/react', '@babel/typescript'],
                    plugins: [
                        [
                            'babel-plugin-jsx-remove-data-test-id', // Remove test attributes
                            {
                                attributes: 'data-testid',
                            },
                        ],
                    ],
                },
            },
        ],
    },
];

module.exports = merge(common, {
    mode: 'production',
    output: {
        filename: '[name].[fullhash].bundle.js',
        path: path.resolve(__dirname, '..', 'build'),
        chunkFilename: 'dynamic/[name].[fullhash].js',
    },
    module: { rules },
    plugins: [
        // Clean build dir
        new CleanWebpackPlugin(),

        // Override process.env with custom vars defined in .env
        new webpack.DefinePlugin(
            Object.fromEntries(
                Object.entries({
                    ...dotenv.config({ debug: true, path: path.resolve(__dirname, '..', '.env') }).parsed,
                    NODE_ENV: 'production',
                }).map(([key, value]) => ['process.env.' + key, JSON.stringify(value)]),
            ),
        ),

        // Generate views
        new HtmlWebpackPlugin({
            template: path.resolve(__dirname, '..', 'src', 'templates', 'index.ejs'),
            templateParameters: {
                // Put here vars
            },
            minify: true,
        }),

        // Copy static assets
        new CopyWebpackPlugin({
            patterns: [
                {
                    from: path.resolve(__dirname, '..', 'public'),
                    to: '.',
                },
            ],
        }),

        // Generate bundle statistics
        // new StatsWriterPlugin({
        //     filename: path.join('..', 'build_stats', 'logs.json'),
        //     fields: null,
        //     stats: { chunkModules: true },
        // }),
        // new Visualizer({
        //     filename: path.join('..', 'build_stats', 'build_stats.html'),
        // }),

        // Generate service worker and define runtime caching
        // new workboxPlugin.GenerateSW({
        //     swDest: 'service-worker.js',
        //     clientsClaim: true,
        //     skipWaiting: true,
        //     exclude: [/\.map$/, /manifest\.json$/],
        //     cleanupOutdatedCaches: true,
        //     maximumFileSizeToCacheInBytes: 50 * Math.pow(1024, 2),
        // }),
    ],
});