const path = require('path');
const express = require('express');
const session = require('express-session');
const Keycloak = require('keycloak-connect');

const app = express();
const memoryStore = new session.MemoryStore();

app.set('view engine', 'ejs');
app.set('views', require('path').join(__dirname, '/view'));
app.use(express.static('static'));
app.use(session({
    secret:'auErxiQoVYpOBd04qEFitZfwmI5GLHCS',
    resave: false,
    saveUninitialized: true,
    store: memoryStore,
}));

const keycloak = new Keycloak({ store: memoryStore });

app.use(keycloak.middleware({
    logout:'/logout',
    admin:'/',
}));

app.get('/', (req,res) => res.redirect('/home'));

const parseToken = raw => {
    if(!raw || typeof raw !== 'string') return null;

    try {
        raw = JSON.parse(raw);
        const token = raw.id_token ? raw.id_token : raw.access_token;
        const content = token.split('.')[1];
        console.log("ID token");
        console.log(raw.id_token);
        console.log("Access token");
        console.log(raw.access_token);

        return JSON.parse(Buffer.from(content, 'base64').toString('utf-8'));
    } catch (e) {
        console.log(e);
    }
};

app.get('/home',keycloak.protect(), (req,res,next) => {
    const details = parseToken(req.session['keycloak-token']);
    const embedded_params = {};

    if(details) {
        embedded_params.name = details.name;
        embedded_params.email = details.email;
        embedded_params.username = details.preferred_username;
    }

    res.render('home', {
        user: embedded_params,
    });
        
});

app.get('/asset01', keycloak.enforcer(['asset-01:read'], {
    resource_server_id: 'my-application'
}), (req,res) => {
    return res.status(200).end('Succès');
});

app.get('/asset01/update', keycloak.enforcer(['asset-01:write'], {
    resource_server_id: 'my-application'
}), (req,res) => {
    return res.status(200).end('Succès');
});

app.get('/login', keycloak.protect(), (req,res,next) => {
    return res.redirect('home');
});

app.use((req,res,next) => {
    return res.status(404).end('Not Found');
});

app.use((err, req, next) => {
    return res.status(req.errorCode ? req.errorCode : 500).end(req.error ? req.error.toString() : 'Internal server error');
});

const server = app.listen(3000, '127.0.0.1', () => {
    const host = server.address().address;
    const post = server.address().port;
})