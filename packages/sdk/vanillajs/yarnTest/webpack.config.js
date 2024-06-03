const path = require('path');

module.exports = {
  mode: 'development', // 'production' for production builds
  entry: './index.ts', // Adjust to point to your TypeScript entry file
  output: {
    path: path.resolve(__dirname, 'dist'), // Ensure output is set correctly
    filename: 'bundle.js'
  },
  resolve: {
    symlinks: false,
    extensions: ['.ts', '.js'], // Add '.ts' since you are using TypeScript
    modules: ['node_modules', path.resolve(__dirname, 'node_modules')],
    alias: {
      '@this-is-not-a-drill/vanillajs-sdk': path.resolve(__dirname, '../dist/bundle.js')
    }
  },
  module: {
    rules: [
      {
        test: /\.ts$/, // Handle TypeScript files
        use: 'ts-loader', // Use ts-loader for TypeScript
        exclude: /node_modules/
      }
    ]
  },
  devServer: {
    contentBase: path.join(__dirname, 'public'), // Serve from the public folder
    compress: true,
    port: 9000
  }
};
