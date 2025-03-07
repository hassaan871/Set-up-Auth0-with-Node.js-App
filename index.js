// Environment Setup

require('dotenv').config();

// Module Imports

const app = require('express')();
const session = require('express-session');
const passport = require('passport');
const Auth0Strategy = require('passport-auth0');
const { auth, requiresAuth } = require('express-openid-connect');

// Auth0 Configuration

const config = {
    authRequired: false,
    auth0Logout: true,
    secret: process.env.AUTH0_CLIENT_SECRET,
    baseURL: process.env.BASE_URL,
    clientID: process.env.AUTH0_CLIENT_ID,
    clientSecret: process.env.AUTH0_CLIENT_SECRET,
    issuerBaseURL: `https://${process.env.AUTH0_DOMAIN}/`,
    authorizationParams: {
        response_type: 'code',
        // scope: ''
    }
};

// Auth0 Middleware

app.use(auth(config));

// Auth0 Strategy (Passport)

passport.use(
    new Auth0Strategy(
        {
            domain: process.env.AUTH0_DOMAIN,
            clientID: process.env.AUTH0_CLIENT_ID,
            clientSecret: process.env.AUTH0_CLIENT_SECRET,
            callbackURL: process.env.AUTH0_CALLBACK_URL
        },
        function (accessToken, refreshToken, extraParams, profile, done) {
            return done(null, profile);
        }
    )
);

// Session Management

app.use(
    session({
        secret: "444d5ad87018706c226ec651bbe4cb71efaf62fb7488f56b5971ca19b8bf250d",
        resave: false,
        saveUninitialized: true,
    })
);

// Passport Initialization

app.use(passport.initialize());
app.use(passport.session());

// Serialization & Deserialization of User

passport.serializeUser((user, done) => {
    done(null, user);
});

passport.deserializeUser((user, done) => {
    done(null, user);
});

// Auth0 Routes
// Login Route

app.get(
    "/login",
    passport.authenticate("auth0", {
        scope: "openid email profile",
    }),
    function (req, res) {
        res.redirect("/");
    }
);

// Logout Route

app.get('/logout', (req, res) => {
    req.logout(() => {
        res.redirect(
            `https://${process.env.AUTH0_DOMAIN}/v2/logout?client_id=${process.env.AUTH0_CLIENT_ID}&returnTo=${encodeURIComponent(
                'http://localhost:5000'
            )}`
        );
    });
});

// Home route
app.get('/', (req, res) => {
    res.send(req.oidc.isAuthenticated() ? `Hello ${req.oidc.user.name}` : 'Logged out');
});



app.get('/profile', requiresAuth(), (req, res) => {
    res.send(JSON.stringify(req.oidc.user));
});


// Start the server
app.listen(5000, () => {
    console.log('Server is running on http://localhost:5000');
});