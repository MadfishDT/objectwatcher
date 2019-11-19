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
  target: 'node',
  resolve: {
    extensions: [ '.tsx', '.ts', '.js' ]
  },
  output: {
    filename: 'lib.bundle.prod.js',
    libraryTarget: 'commonjs',
    path: path.resolve(__dirname, '../dist')
  }
};