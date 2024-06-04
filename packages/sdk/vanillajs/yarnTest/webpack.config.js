const path = require('path');
const webpack = require('webpack');
const dotenv = require('dotenv');

dotenv.config();

const envKeys = Object.keys(process.env).reduce((prev, next) => {
  prev[`process.env.${next}`] = JSON.stringify(process.env[next]);
  return prev;
}, {});

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
    fallback: {
      path: require.resolve('path-browserify'),
      os: require.resolve('os-browserify/browser'),
      crypto: require.resolve('crypto-browserify'),
      vm: require.resolve("vm-browserify"),
      stream: require.resolve("stream-browserify"),
      process: require.resolve("process/browser"),
    },
    extensions: ['.tsx', '.ts', '.js'],
    alias: {
      '@this-is-not-a-drill/vanillajs-sdk': path.resolve(__dirname, '../dist/bundle.js')  // Adjust this path if necessary
    },
  },
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'public'), // Output to the public directory
  },
  plugins: [
    new webpack.ProvidePlugin({
      process: 'process/browser',  // Provide process wherever it's needed
    }),
    new webpack.DefinePlugin(envKeys)
  ]
};
