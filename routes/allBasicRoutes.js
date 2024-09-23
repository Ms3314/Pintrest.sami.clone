var express = require('express');
var router = express.Router();
const userModel = require("../schema/users.js") ; 
const bcrypt = require('bcrypt');
var jwt = require('jsonwebtoken');
const JWT_SECRET = 'samiuddin'; 
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const {uploadToFirebase} =   require('../utils/firebaseFn.js')
const contentModel = require('../schema/content.js')
const {isLoggedIn} = require('../functions/CommonFn.js');
const content = require('../schema/content.js');
const userController = require("../controllers/userController.js")
const contentController = require("../controllers/contentController.js")


router.get("/savedpins" , isLoggedIn , function(req , res , next) {
    res.render("savedpins")
})

router.post('/logout', userController.logoutFn);

const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
      fileSize: 5 * 1024 * 1024, // 5MB limit
    },
  });


router.post("/upload", isLoggedIn, upload.single('myFile') , contentController.uploaderFunction )

router.get("/", isLoggedIn , function(req , res ) {
    res.redirect("/home")
})

router.get("/profile", isLoggedIn  ,userController.profileFunction)

router.get("/login", function(req, res, next) {
    res.render('login',{error:""}); // This will render the views/index.ejs file
});

router.post("/register" ,)

// this route is the login route which has all the authentication to enter the login route 
router.post("/login", userController.loginFn )


router.get("/home" , isLoggedIn ,async function(req , res , next ) {
    try {
        const user = userMid
        
        // console.log(files , "this is the files from the firebase ")
        res.render("home")
    } catch (error) {
        console.error('Error fetching files:', error);
        res.status(500).send('Server Error');
    }
})

router.get("/register" , function(req , res , next) {
    res.render("register" , {error : ""});
})

module.exports = router;
