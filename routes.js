// routes.js
const parseToken = require('./utils').parseToken;

function configureRoutes(app, keycloak) {
  app.get('/', (req, res) => {
    console.log('Index page');
    if (req.session['keycloak-token']) {
      return res.redirect('/home');
    } else {
      return res.redirect('/login');
    }
  });

  app.get('/home', keycloak.protect(), (req, res, next) => {
    console.log('Home page');
    const details = parseToken(req.session['keycloak-token']);
    const embedded_params = {};

    if (details) {
      embedded_params.name = details.name;
      embedded_params.email = details.email;
      embedded_params.username = details.preferred_username;
    }

    res.render('home', {
      user: embedded_params,
    });
  });

  app.get('/login', keycloak.protect(), (req, res) => {
    return res.redirect('home');
  });

  // Factorized route for UE
  app.get(
    '/UE/:ue',
    (req, res, next) => {
      const uePermission = `${req.params.ue}:l${req.params.ue.charAt(
        req.params.ue.length - 1,
      )}`;
      keycloak.enforcer([uePermission], {
        resource_server_id: 'app',
      })(req, res, next);
    },
    (req, res) => {
      // render the UE page
      return res.render(`UE`, {
        UE: { id: req.params.ue },
      });
    },
  );

  // Factorized route for UE (valider)
  app.post(
    '/UE/:ue/valider',
    (req, res, next) => {
      const uePermission = `${req.params.ue}:v${req.params.ue.charAt(
        req.params.ue.length - 1,
      )}`;
      keycloak.enforcer([uePermission], {
        resource_server_id: 'app',
      })(req, res, next);
    },
    (req, res) => {
      return res.status(200).end('OK');
    },
  );

  // Factorized route for UE (ecrire)
  app.post(
    '/UE/:ue/ecrire',
    (req, res, next) => {
      const uePermission = `${req.params.ue}:e${req.params.ue.charAt(
        req.params.ue.length - 1,
      )}`;
      keycloak.enforcer([uePermission], {
        resource_server_id: 'app',
      })(req, res, next);
    },
    (req, res) => {
      return res.status(200).end('OK');
    },
  );
}

module.exports = configureRoutes;
