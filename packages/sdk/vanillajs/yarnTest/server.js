const express = require('express');
const path = require('path');

const app = express();
const port = 9000;  // You can adjust the port number as needed

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// Start the server
app.listen(port, () => {
  console.log(`Demo app listening at http://localhost:${port}`);
});

/*
const webpack = require('webpack');
const WebpackDevServer = require('webpack-dev-server');
const config = require('../webpack.config.js');

const devConfig = config.find(c => c.mode === 'development');

if (!devConfig) {
  throw new Error('Development configuration not found');
}

const compiler = webpack(devConfig);

const server = new WebpackDevServer({
  static: {
    directory: './public'
  },
  port: devConfig.devServer.port,
  headers: devConfig.devServer.headers,
  devMiddleware: {
    publicPath: devConfig.devServer.devMiddleware.publicPath,
  },
}, compiler);

server.startCallback(() => {
  console.log(`Server started on port ${devConfig.devServer.port}`);
});
*/
