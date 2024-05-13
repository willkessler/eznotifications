const path = require('path');
const webpack = require('webpack');

// Common configuration settings
const commonConfig = {
  entry: './src/index.ts',
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
      }
    ],
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
  },
  mode: 'development', // Or 'production' depending on your needs
  devtool: 'source-map',
};

// Configuration for distribution
const distConfig = {
  ...commonConfig,
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist'),
    libraryTarget: 'umd',
    library: 'ThisIsNotADrillSDK'
  },
};

// Configuration for testing
const devConfig = {
  ...commonConfig,
  mode: 'development',
  devServer: {
    static: {
      directory: path.join(__dirname, 'dist'),
    },
    port: 3500,
    headers: {
      'Content-Type' : 'application/javascript',
      'Access-Control-Allow-Origin': 'http://localhost:3000',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'X-Requested-With, content-type, Authorization'
    },
    devMiddleware: {
      publicPath: '/dist/'
    },
  },
  plugins: [
    new webpack.HotModuleReplacementPlugin()
  ],
};

module.exports = [
  distConfig,
  devConfig,
];

