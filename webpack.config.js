const path = require('path');
const webpack = require('webpack');

module.exports = {
  entry: './src/particleHelper.js',
  mode: 'production',
  output: {
    filename: 'particle-processing-rk.js',
    path: path.resolve(__dirname, 'dist'),
  },
  plugins: [
    new webpack.ProvidePlugin({
        'particleHelper': 'particleHelper'
    }),
  ],
  resolve: {
    fallback: { 
        "buffer": false,
        "url": false 
    }
  }
};