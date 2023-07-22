const path = require('path');
const webpack = require('webpack');

module.exports = {
  entry: './src/particleHelper.js',
  mode: 'production',
  output: {
    filename: 'particle-processing-rk.js',
    path: path.resolve(__dirname, 'dist'),
    library: 'particleHelper',
    libraryTarget: 'umd',
    umdNamedDefine: true
  },
  plugins: [
  ],
  resolve: {
    fallback: { 
        "buffer": false,
        "url": false 
    }
  }
};