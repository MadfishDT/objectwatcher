const path = require('path');

module.exports = {
  entry: './src/lib.ts',
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/
      }
    ]
  },
  devtool: 'source-map',
  target: 'web',
  resolve: {
    extensions: [ '.tsx', '.ts', '.js' ]
  },
  output: {
    filename: 'lib.bundle.umd.js',
    libraryTarget: 'umd',
    path: path.resolve(__dirname, '../dist')
  }
};