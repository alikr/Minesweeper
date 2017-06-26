/*
 * @author alikr 
 */

var webpack = require("webpack");
var config = require("./webpack.config.js");
var webpackMerge = require('webpack-merge');

//remove HotModuleReplacementPlugin
config.plugins.shift();

module.exports = webpackMerge(config, {
    plugins: [
        new webpack.optimize.UglifyJsPlugin({
            beautify: false,
            mangle: {
                screw_ie8: true,
                keep_fnames: true
            },
            compress: {
                screw_ie8: true,
                warnings: false,
                drop_console: true,
                drop_debugger: true,
                dead_code: true
            },
            comments: false
        }),
        new webpack.DefinePlugin({
            'process.env.NODE_ENV': JSON.stringify('production')
        })
    ]
});
