var path = require('path')
var webpack = require('webpack')
var dependencies = require('./build/getVendorDependencies.js')
var ExtractTextPlugin = require("extract-text-webpack-plugin")

var env = process.env.NODE_ENV || 'development'

var isProduction = env.trim().toUpperCase() === 'PRODUCTION'
var isDevelopment = !isProduction
var entryPoints = ['./src/app.js']

//only start the hot-server if we are in development
if(isDevelopment) {
  console.log('detected development - will use hot-reload')
  entryPoints.push('webpack-dev-server/client?http://localhost:8090')
}

module.exports = {
  name: "Browser",
  entry: {
    app: entryPoints,
    vendor: dependencies
  },
  eslint: {
    configFile: '.eslintrc'
  },
  resolve: {
    // you can now require('file') instead of require('file.coffee')
    extensions: ['', '.js', '.json', '.jsx'],
    alias: {
      services: path.join(__dirname, '/src/services/browser')
    }
  },
  output: {
    path: path.join(__dirname, './dist/'),
    filename: 'browser.js'
  },
  module: {
    preLoaders: [
      { test: /(\.js$|\.jsx$)/,exclude: /node_modules/, loader: 'eslint-loader' }
    ],
    loaders: [
      { test: /\.js$/, exclude: /(node_modules)/, loaders: ['react-hot', 'babel-loader'] },
      { test: /\.jsx$/, exclude: /(node_modules)/, loaders: ['react-hot', 'babel-loader'] },
      { test: /\.(less|css)$/, loader: ExtractTextPlugin.extract('style-loader', 'css!less') },
      { test: /\.(otf|eot|png|svg|ttf|woff|woff2)(\?v=[0-9]\.[0-9]\.[0-9])?$/, loader: 'url-loader?limit=10000&minetype=application/font-woff' },
      { test: /\.(ttf|eot|svg)(\?v=[0-9]\.[0-9]\.[0-9])?$/, loader: 'file-loader' },
      { test: /\.json$/, loader: 'json-loader' }
    ]
  },
  devServer: {
    contentBase: './dist',
    hot: isDevelopment,
    inline: true
  },
  devtool: 'sourcemap',
  plugins: [
    new webpack.optimize.CommonsChunkPlugin("vendor", "vendor.bundle.js"),
    new webpack.NoErrorsPlugin(),
    new webpack.HotModuleReplacementPlugin(),
    new ExtractTextPlugin('styles.css')
  ],
  node: {
    console: true,
    fs: 'empty',
    net: 'empty',
    tls: 'empty'
  }
}
