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
// const {listAllImagesWithMetadata} = require('./utils/firebaseFn.js')
// adding all the get requests for different pages over here 



// this is the post request for the adding a pic 




const uploaderFunction =  async (req, res) => {
    try {
        // Check if file is uploaded
        if (!req.file) {
            return res.status(400).send("No file is uploaded");
        }

        // Find the user in the database
        const user = await userModel.findOne({ _id: req.user });
        if (!user) {
            return res.status(404).send("User not found");
        }
        
        // Upload file to Firebase (or another service) and get the URL
        const url = await uploadToFirebase(req.file, req.user);
        if (!url) {
            return res.status(500).send("File upload to Firebase failed");
        }

        // Create new content document
        const newContent = new contentModel({
            imagePath: url,                       // File URL from Firebase
            title: req.body.title || 'pin',       // Default title if none provided
            description: req.body.description || 'pin', // Default description
            tags: req.body.tags || [],            // Optional tags
            createdAt: new Date(),
            updatedAt: new Date(),
            user: req.user,                       // Associate content with the user
        });

        // Save the new content to the database
        await newContent.save();

        // (Optional) Associate new content with user's boards and save
        // user.boards.push(newContent);
        // await user.save();

        // Redirect to home page
        res.redirect("/home");

    } catch (error) {
        console.error(error);
        res.status(500).send("An error occurred while processing the upload");
    }
}

const uploaderFunctionProfile =  async (req, res) => {
    try {
        console.log(req.file)
        // Check if file is uploaded
        if (!req.file) {
            return res.status(400).send("No file is uploaded");
        }

        // Find the user in the database
        const user = await userModel.findOne({ _id: req.user });
        if (!user) {
            return res.status(404).send("User not found");
        }
        
        // Upload file to Firebase (or another service) and get the URL
        const url = await uploadToFirebase(req.file, req.user);
        if (!url) {
            return res.status(500).send("File upload to Firebase failed");
        }

        // Create new content document
        user.profileImage = url
        user.save()

        res.redirect("/profile");

    } catch (error) {
        console.error(error);
        res.status(500).send("An error occurred while processing the upload");
    }
}


// logging out 





// this one checks the authentication i could just change it to a cookie checker thingy 



// router.post('/delete/uploads/:img_id', isLoggedIn, async function(req, res, next) {
//     const imageId = req.params.img_id; // The ID of the image to be removed
//     const userId = req.user; // User ID of the current user
//     console.log(userId)
//     try {
//         const LoggedUser = await userModel.findOne({_id : userId})
//         // Find the user and update their boards array by pulling the board object with the specified imagePath
//         // console.log(LoggedUser , "details of logged one ")
//         const length2 = LoggedUser.boards.length
//         var shit = `uploads\\\\${imageId}`
//         let updatedStr = shit.replace("\\", "");
//         for(var i = 0 ; i < length2 ; i++ ) {
//             if (LoggedUser.boards[i].imagePath == updatedStr || LoggedUser.boards[i].imagePath == shit) {
//                 LoggedUser.boards.splice(i, 1);
//                 console.log("Board removed");
//                 // Save the updated user document
//                 await LoggedUser.save();
//             }
//         }

//         // Delete the file from the file system
//         // atleast this part works now i need to remove it from the database 
//         fs.unlink(`uploads/${imageId}`, (err) => {
//             if (err) {
//                 console.error('Error removing image:', err);
//                 res.redirect('/home')
                
//             }
//         });
//         res.redirect("/home")
//     } catch (err) {
//         console.error('Error removing image:', err);
//         res.redirect("/home")
//     }
// });




module.exports = {
    uploaderFunction , uploaderFunctionProfile
};
