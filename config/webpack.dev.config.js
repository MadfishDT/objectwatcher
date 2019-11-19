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
  target: 'node',
  mode: 'development',
  resolve: {
    extensions: [ '.tsx', '.ts', '.js' ]
  },
  output: {
    filename: 'lib.bundle.dev.js',
    libraryTarget: 'commonjs',
    path: path.resolve(__dirname, '../dist')
  }
};