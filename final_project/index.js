const express = require('express');
const jwt = require('jsonwebtoken');
const session = require('express-session')
const customer_routes = require('./router/auth_users.js').authenticated;
const genl_routes = require('./router/general.js').general;

const app = express();

app.use(express.json());

app.use("/customer",session({secret:"fingerprint_customer",resave: true, saveUninitialized: true}))

app.use("/customer/auth/*", function auth(req,res,next){
//Write the authenication mechanism here

    if(!req.session || !req.session.authorization){
        return res.status(401).json({ message: "user not logged in" });
    }
    const token = req.session.authorization.accessToken;
    if (!token) {
        return res.status(401).json({ message: "access token missing" });
    }
    jwt.verify(token, "access", (err, user) => {
        if (err) {
        return res.status(403).json({ message: "invalid or expired token" });
        }
        req.user = user;
        next();
    });

});
 
const PORT =5001;

app.use("/customer", customer_routes);
app.use("/", genl_routes);

app.listen(PORT,()=>console.log("Server is running"));
