const path = require('path');
const webpack = require('webpack');
const newVersion = require('./version.js'); // Require the new version from bump-version.js

// Custom Plugin to Add Banner
class AddBannerPlugin {
  apply(compiler) {
    compiler.hooks.emit.tapAsync('AddBannerPlugin', (compilation, callback) => {
      const banner = `// Version ${newVersion}\n`;
      for (const filename in compilation.assets) {
        if (filename === 'bundle.js') {
          const source = compilation.assets[filename].source();
          const newSource = banner + source;
          compilation.assets[filename] = {
            source: () => newSource,
            size: () => newSource.length,
          };
        }
      }
      callback();
    });
  }
}

// Common configuration settings
const commonConfig = {
  entry: './src/index.ts',
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: {
          loader: 'ts-loader',
          options: {
            transpileOnly: false,
            compilerOptions: {
              sourceMap: true,
              preserveConstEnums: true,
              removeComments: false,
              inlineSourceMap: false,
              inlineSources: true
            }
          }
        },
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
  mode: 'production',
  plugins: [
    new AddBannerPlugin(),
  ],
};


// Log the applied plugins to ensure BannerPlugin is added
console.log('distConfig plugins:', distConfig.plugins);
console.log('Distribution Config Mode:', distConfig.mode);

// Configuration for testing
const devConfig = {
  ...commonConfig,
  mode: 'development',
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist'),
    libraryTarget: 'umd',
    library: 'ThisIsNotADrillSDK'
  },
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

console.log('Development Config Mode:', devConfig.mode);


module.exports = [
  distConfig,
  devConfig,
];

