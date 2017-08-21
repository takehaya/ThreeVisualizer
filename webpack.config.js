// webpack.config.js
const path = require('path');
const webpack = require('webpack');

module.exports = {
  entry: './src/MainNirvana.js',
  output: { path: __dirname, filename: 'bundle.js' },
  module: {
    loaders: [
      {
        test: /.(js|jsx)?$/,
        loader: 'babel-loader',
        exclude: /node_modules/,
        query: {
          presets: ['es2017', 'react'],
        }
      }
    ]
  },
  devtool: 'source-map',
}
