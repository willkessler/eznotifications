const path = require('path');

module.exports = {
  mode: 'development',
  entry: './src/index.ts', // Adjust path as necessary
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
    alias: {
      '@this-is-not-a-drill/vanillajs-sdk': path.resolve(__dirname, '../dist/bundle.js')  // Adjust this path if necessary
    },
  },
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'public'), // Output to the public directory
  },
};
