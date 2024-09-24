var express = require('express');
var router = express.Router();
const userModel = require("../schema/users.js") ; 
const bcrypt = require('bcrypt');
var jwt = require('jsonwebtoken');
const JWT_SECRET = 'samiuddin'; 
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const {uploadToFirebase , deleteImageFromFirebase} =   require('../utils/firebaseFn.js')
const contentModel = require('../schema/content.js')
const {isLoggedIn} = require('../functions/CommonFn.js');
const userController = require("../controllers/userController.js")
const contentController = require("../controllers/contentController.js")


router.get('/savedpins', isLoggedIn, async (req, res) => {
    try {
        const userid = req.user;

        // Find the logged-in user and fetch savedPins
        const user = await userModel.findOne({ _id: userid });

        if (!user) {
            return res.status(404).send("User not found");
        }

        // Render the EJS page and pass savedPins to the template
        res.render('savedpins', { savedPins: user.savedPins });
    } catch (error) {
        console.error("Error fetching saved pins:", error);
        res.status(500).send("Internal server error");
    }
});

router.get("/register" , (req , res)=> {
    res.render("register" , {error : ""})
})
router.post('/logout', userController.logoutFn);

const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
      fileSize: 5 * 1024 * 1024, // 5MB limit
    },
  });


router.post("/upload", isLoggedIn, upload.single('myFile') , contentController.uploaderFunction )
router.post("/updateProfilePic" , isLoggedIn , upload.single('profilePic'), contentController.uploaderFunctionProfile )



router.get("/", isLoggedIn , function(req , res ) {
    res.redirect("/home")
})

router.get("/create" , (req , res )=> {
    res.render("create")
})

router.get("/profile", isLoggedIn  ,userController.profileFunction)

router.get("/login", function(req, res, next) {
    res.render('login',{error:""}); // This will render the views/index.ejs file
});

router.post("/register" , userController.registerFn)

// this route is the login route which has all the authentication to enter the login route 
router.post("/login", userController.loginFn )

router.post("/savepin/:url", isLoggedIn, async function (req, res) {
    try {
        const userid = req.user;
        const url = req.params.url;

        // Find the content and the user asynchronously
        const content = await contentModel.findOne({ imagePath: url });
        const user = await userModel.findOne({ _id: userid });

        if (!content || !user) {
            return res.status(404).send("Content or user not found");
        }

        // Prepare the data to save in user's savedPins
        const savedData = {
            title: content.title || "",
            description: content.description || "",
            img_url: url || "",
            posted_user: content.user || "",
        };

        // Add to user's savedPins array
        user.savedPins.push(savedData);

        // Save the updated user
        await user.save();

        // Send a success response
        res.redirect("/savedpins")
    } catch (error) {
        console.error("Error saving pin:", error);
        res.status(500).send("Internal server error");
    }
});

router.post("/delete/:url", isLoggedIn, async function (req, res) {
    const url = req.params.url;

    try {
        // Find and delete the content from the database
        const content = await contentModel.findOneAndDelete({ imagePath: url });

        if (!content) {
            // If no content was found and deleted
            console.log("error", "No content found to delete.");
            return res.redirect("/profile");
        }

        // Call the function to delete the image from Firebase
        await deleteImageFromFirebase(url); // Await for the deletion to complete

        // Success message for successful deletion
        console.log("success", "Content deleted successfully.");
        res.redirect("/profile");
    } catch (error) {
        console.error("Error deleting content:", error);
        console.log("error", "An error occurred while trying to delete the content.");
        res.redirect("/savedpins");
    }
});



router.get("/home" , isLoggedIn , userController.homeFunction)

module.exports = router;
