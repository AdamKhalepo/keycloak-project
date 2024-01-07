const path = require('path');
const express = require('express');
const session = require('express-session');
const Keycloak = require('keycloak-connect');
const parseToken = require('./utils').parseToken;

const app = express();
const memoryStore = new session.MemoryStore();

//////////////////////////
// JS CONFIG
//////////////////////////
app.set('view engine', 'ejs');
app.set('views', require('path').join(__dirname, '/view'));
app.use(express.static('static'));

//////////////////////////
// KEYCLOAK CONFIG
//////////////////////////
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

//////////////////////////
// ROUTES
//////////////////////////
// No keycloak.protect() middleware here because PUBLIC
app.get('/', (req, res) => {
  console.log('Index page');
  // Check if the user is authenticated
  if (req.session['keycloak-token']) {
    return res.redirect('/home');
  } else {
    return res.redirect('/login');
  }
});

// No keycloak.protect() middleware here because PUBLIC
app.get('/login', (req, res, next) => {
  console.log('Login page');

  // Redirect to keycloack login page
  // Then, if user OK -> redirect to /home
  // Else -> redirect to / or error page with retry button
});

// ROUTE PROTECTED BY KEYCLOAK
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

app.get(
  '/asset01',
  keycloak.enforcer(['asset-01:read'], {
    resource_server_id: 'my-application',
  }),
  (req, res) => {
    return res.status(200).end('Success');
  },
);

app.get(
  '/asset01/update',
  keycloak.enforcer(['asset-01:write'], {
    resource_server_id: 'my-application',
  }),
  (req, res) => {
    return res.status(200).end('Success');
  },
);

//////////////////////////
// SERVER CONFIG
//////////////////////////
app.use((req, res, next) => {
  return res.status(404).end('Not Found');
});

app.use((err, req, res, next) => {
  return res
    .status(err.status || 500)
    .end(err.message || 'Internal server error');
});

//////////////////////////
// SERVER START
//////////////////////////
const server = app.listen(3000, '127.0.0.1', () => {
  const host = server.address().address;
  const port = server.address().port;

  console.log(`Server listening on http://${host}:${port}`);
});
