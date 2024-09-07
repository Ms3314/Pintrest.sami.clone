var express = require('express');
var router = express.Router();
const userModel = require("./schema/users.js") ; 
const bcrypt = require('bcrypt');
var jwt = require('jsonwebtoken');
const JWT_SECRET = 'samiuddin'; 
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const {uploadToFirebase} =   require('./utils/firebaseFn.js')
const contentModel = require('./schema/content.js')
const {isLoggedIn} = require('./functions/CommonFn.js')
const {listAllFiles} = require('./utils/firebaseFn.js')
// adding all the get requests for different pages over here 

router.get("/", isLoggedIn , function(req , res ) {
    res.redirect("/home")
})

router.get("/login", function(req, res, next) {
    res.render('login',{error:""}); // This will render the views/index.ejs file
});

router.get("/register" , function(req , res , next) {
    res.render("register" , {error : ""});
})

router.get("/profile", isLoggedIn  ,async function(req , res , next) {
    try {
    const userid = req.user
    const LoggedUser = await userModel.findOne({_id : userid})
    username = LoggedUser.username
    email = LoggedUser.email
    res.render("profile" , {
        username , email , LoggedUser 

    })
    } catch (error) {
        console.error('Error fetching boards or some other error :', err);
    }

})

router.get("/home" , isLoggedIn ,async function(req , res , next ) {
    try {
        const users = await userModel.find({} , 'boards' ) 
        const files = await listAllFiles('images')
        console.log(files , "this is the files from the firebase ")
        res.render("home" )
    } catch (error) {
        console.error('Error fetching files:', error);
        res.status(500).send('Server Error');
    }
})


router.get("/savedpins" , isLoggedIn , function(req , res , next) {
    res.render("savedpins")
})


router.post("/register" ,async function(req , res) {
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

})

// this route is the login route which has all the authentication to enter the login route 
router.post("/login", async function(req, res) {
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
});


// this is the post request for the adding a pic 


const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
      fileSize: 5 * 1024 * 1024, // 5MB limit
    },
  });


router.post("/upload", isLoggedIn , upload.single('myFile') , async  (req,res)=> {
    try {
        console.log(req.file , "this is the file uploaded ")
        console.log(req.user , "this is the user id maybe ")
        const user = await userModel.findOne({_id : req.user})
        console.log(user , "this is the user data from the database ")
        if(req.file) {
        const newContent = new contentModel({
            imagePath : req.file.originalname,
            title : req.body.title || 'pin',
            description : req.body.description || 'pin',
            tags : req.body.tags || [],
            createdAt : new Date(),
            updatedAt : new Date(),
            user : req.user,
        })
        console.log(req.file , "this is the fike")
        console.log(req.file.path , 'FILEPATH')
        console.log(req.user , "this is the user")
        await newContent.save()
        const url = await uploadToFirebase(req.file , req.user).catch((err)=>console.log(err))

        newContent.imagePath = url
        console.log(newContent , "this is the new content ")
        // res.status(200).send(url)
       
        // user.boards.push(newContent)
        // await user.save()
        res.redirect("/home")
    }else {
        res.status(400).send("No file is uploaded")
    }
    } catch (error) {
        console.log(error)
        res.status(500).send("An error occured")
    }
})




// logging out 
router.post('/logout', function(req, res, next){
    res.clearCookie("token")
    res.redirect("/login")
});



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


module.exports = router;
