// server.js
const express = require('express');
const session = require('express-session');
const Keycloak = require('keycloak-connect');
const configureKeycloak = require('./config/keycloak-config');
const configureRoutes = require('./routes');
const configureServer = require('./config/server-config');

const app = express();
const memoryStore = new session.MemoryStore();

const keycloakInstance = configureKeycloak(app, session, Keycloak, memoryStore);
configureRoutes(app, keycloakInstance);
configureServer(app);
