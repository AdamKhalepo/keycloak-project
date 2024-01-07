const path = require("path");
const express = require("express");
const session = require("express-session");
const Keycloak = require("keycloak-connect");
const parseToken = require("./utils").parseToken;

const app = express();
const memoryStore = new session.MemoryStore();

app.set("view engine", "ejs");
app.set("views", require("path").join(__dirname, "/view"));
app.use(express.static("static"));
app.use(
  session({
    secret: "auErxiQoVYpOBd04qEFitZfwmI5GLHCS",
    resave: false,
    saveUninitialized: true,
    store: memoryStore,
  }),
);

const keycloak = new Keycloak({ store: memoryStore });

app.use(
  keycloak.middleware({
    logout: "/logout",
  }),
);

// No keycloack.protect() middleware here cause PUBLIC
app.get("/", (req, res) => {
  // Check if the user is authenticated
  if (req.session["keycloak-token"]) {
    return res.redirect("/home");
  } else {
    return res.redirect("/login");
  }
});

// No keycloack.protect() middleware here cause PUBLIC
app.get("/login", (req, res, next) => {
  // Redirect to keycloak login page
  return keycloak.protect()(req, res, next);
});

app.get("/home", keycloak.protect(), (req, res, next) => {
  const details = parseToken(req.session["keycloak-token"]);
  const embedded_params = {};

  if (details) {
    embedded_params.name = details.name;
    embedded_params.email = details.email;
    embedded_params.username = details.preferred_username;
  }

  res.render("home", {
    user: embedded_params,
  });
});

app.get(
  "/asset01",
  keycloak.enforcer(["asset-01:read"], {
    resource_server_id: "my-application",
  }),
  (req, res) => {
    return res.status(200).end("Succès");
  },
);

app.get(
  "/asset01/update",
  keycloak.enforcer(["asset-01:write"], {
    resource_server_id: "my-application",
  }),
  (req, res) => {
    return res.status(200).end("Succès");
  },
);

app.use((req, res, next) => {
  return res.status(404).end("Not Found");
});

app.use((err, req, next) => {
  return res
    .status(req.errorCode ? req.errorCode : 500)
    .end(req.error ? req.error.toString() : "Internal server error");
});

const server = app.listen(3000, "127.0.0.1", () => {
  const host = server.address().address;
  const post = server.address().port;

  console.log(`Server listening on http://${host}:${post}`);
});
