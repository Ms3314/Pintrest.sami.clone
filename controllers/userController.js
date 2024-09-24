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



async function  loginFn  (req, res) {
    try {
        const { username, password } = req.body;
        const user = await userModel.findOne({ username: username });
        if (user) {
            bcrypt.compare(password, user.password, function(err, result) {
                if (err) {
                    console.error(err);
                    return res.render("login", { error: "An error occurred. Please try again." });
                }
                if (result) {
                    // Sign the JWT and set it in the cookie
                    const token = jwt.sign({ user: user._id }, JWT_SECRET);
                    res.cookie("token", token, { httpOnly: true }); // Secure the cookie
                    // console.log("Signed Token:", token);
                    return res.redirect("/profile");
                } else {
                    return res.render("login", { error: "Credentials are incorrect" });
                }
            });
        } else {
            return res.render("login", { error: "Credentials are incorrect" });
        }
    } catch (error) {
        console.error(error);
        return res.render("index", { error: "An error occurred. Please try again." });
    }
};

async function  profileFunction  (req , res , next) {
    try {
    const userid = req.user
    const LoggedUser = await userModel.findOne({_id : userid})
    const userContent = await contentModel.find({user : userid})
    username = LoggedUser.username
    email = LoggedUser.email
    profileImage = LoggedUser.profileImage
    res.render("profile" , {
        username , email , LoggedUser , userContent , profileImage

    })
    } catch (error) {
        console.error('Error fetching boards or some other error :', error);
    }

}
async function  homeFunction  (req , res , next) {
    try {
    const userid = req.user
    const LoggedUser = await userModel.findOne({_id : userid})
    const userContent = await contentModel.find({})
    console.log(userContent)
    username = LoggedUser.username
    email = LoggedUser.email
    res.render("home" , {
        username , email , LoggedUser , userContent

    })
    } catch (error) {
        console.error('Error fetching boards or some other error :', error);
    }

}



const logoutFn = (req , res) => {
    res.clearCookie("token")
    res.redirect("/login")
}

async function registerFn (req , res) {
    const {username , email , password} = req.body
    const userExist = await userModel.findOne({ username: username });
    const emailExist = await userModel.findOne({ email: email });

    bcrypt.genSalt(10, function(err, salt) {
        bcrypt.hash(password , salt, function(err, hash) {
            const data = new userModel({
                username,
                email ,
                password : hash
             })
            data.save()
            res.redirect("/login")
        });
    });

}


module.exports = {
    logoutFn , profileFunction ,  loginFn  , registerFn , homeFunction
}