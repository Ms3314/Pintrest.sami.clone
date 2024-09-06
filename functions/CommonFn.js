var express = require('express');
var router = express.Router();
// const userModel = require("./schema/users.js") ; 
// const bcrypt = require('bcrypt');
var jwt = require('jsonwebtoken');
const JWT_SECRET = 'samiuddin'; 
// const multer = require('multer');
// const path = require('path');
// const fs = require('fs');
// const {uploadToFirebase} =   require('./utils/firebaseFn.js')
// const contentModel = require('./schema/content.js')

function isLoggedIn(req, res, next) {
    const token = req.cookies.token;
    console.log("Token from Cookie:", token); // Log the token from the cookie

    if (!token) {
        console.log("You are not authenticated ")    
        return res.redirect('/login');
    }

    jwt.verify(token, JWT_SECRET, function(err, decoded) {
        if (err) {
            console.error('Token verification failed:', err);
            return res.redirect('/login');
        }

        req.user = decoded.user;
        // console.log('Decoded token:', decoded); // Log the decoded token
        next();
    });
}

module.exports = { isLoggedIn };