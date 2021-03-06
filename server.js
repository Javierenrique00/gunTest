const path = require('path');
const express = require('express');
const app = express();
const Gun = require("gun");
const port = (process.env.PORT || 8080);

console.log("NODE_ENV="+process.env.NODE_ENV);
console.log("PORT="+port);

if (process.env.NODE_ENV !== 'production') {
  const webpack = require('webpack');
  const webpackDevMiddleware = require('webpack-dev-middleware');
  const webpackHotMiddleware = require('webpack-hot-middleware');
  const config = require('./webpack.config.js');
  const compiler = webpack(config);

  app.use(webpackHotMiddleware(compiler));
  app.use(webpackDevMiddleware(compiler));
}else{
  const indexPath = path.join(__dirname, 'dist/index.html');
  app.use(express.static('dist'));
  app.get('*', function (_, res) { 
    res.sendFile(indexPath);
  });
}

app.use(Gun.serve);

const server = app.listen(port);

Gun({ file: 'db/data.json',web: server});