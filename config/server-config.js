// server-config.js
const config = require('./config');
const express = require('express');

function configureServer(app) {
  app.set('view engine', 'ejs');
  app.set('views', require('path').join(__dirname, '../view'));
  app.use(express.static('static'));

  app.use((req, res, next) => {
    return res.status(404).end('Not Found');
  });

  app.use((err, req, res, next) => {
    console.error(err);
    return res
      .status(err.status || 500)
      .end(err.message || 'Internal server error');
  });

  const server = app.listen(config.port, config.host, () => {
    const host = server.address().address;
    const port = server.address().port;

    console.log(`Server listening on http://${host}:${port}`);
  });
}

module.exports = configureServer;
