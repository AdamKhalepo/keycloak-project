// keycloak-config.js
const Keycloak = require('keycloak-connect');

function configureKeycloak(app, session, Keycloak, memoryStore) {
  app.use(
    session({
      secret: '**********',
      resave: false,
      saveUninitialized: true,
      store: memoryStore,
    }),
  );

  const keycloak = new Keycloak({ store: memoryStore });
  app.use(
    keycloak.middleware({
      logout: '/logout',
    }),
  );

  return keycloak;
}

module.exports = configureKeycloak;
