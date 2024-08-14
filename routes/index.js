var express = require('express');
var router = express.Router();
const userModel = require("./users") ; 
const bcrypt = require('bcrypt');
var jwt = require('jsonwebtoken');
const JWT_SECRET = 'samiuddin'; 
const multer = require('multer');
const path = require('path')
const fs = require('fs')


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

        const allBoards =await Promise.all(
            users.reduce( (acc , user)=> {
            const userBoardwithEmail  = user.boards.map(async board => {
                const data = await userModel.findById(user._id)
                const {username , email } = data
                console.log(data)
                return {
                    ...board ,
                    username ,
                    email
                }
            })
            return acc.concat(userBoardwithEmail);
        }, [])
    )
    
        console.log(allBoards)
        res.render("home" , {boards : allBoards})
        

    } catch (error) {
        console.error('Error fetching boards:', error);
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

    // so we are avoiding same username and email 
    if (userExist) return  res.render("register" , {error : "User already used"})
    if (emailExist) return  res.render("register" , {error : "Email already used"})
    

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
                    console.log("Signed Token:", token);
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

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({ storage: storage });

router.post("/upload", isLoggedIn , upload.single('myFile') , async  (req,res)=> {
    try {
        console.log(req.user.user)
    if (req.file) {
        const LoggedUser = await userModel.findById(req.user)
        console.log("this shit works ")
        if(LoggedUser) {
            const newBoard  = {
                imagePath : req.file.path,
                title: req.body.title || 'Untitled',
            }
            LoggedUser.boards.push(newBoard)
            await LoggedUser.save()
        res.redirect("/profile")
        } else {
            res.status(404).send("User not found")
        }
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
function isLoggedIn(req, res, next) {
    const token = req.cookies.token;
    console.log("Token from Cookie:", token); // Log the token from the cookie

    if (!token) {
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

// making the delete images wala option 

// router.post('/delete/uploads/:img_id' , isLoggedIn ,async function(req , res , next) {
//     const image = "uploads/" + req.params.img_id //the id of the image which we have to remove 
//     const user_id = req.user //userid of the the current one cause i cant remove which is not mine 
    
//     try {
//         const insider = await userModel.findById({_id : user_id})
//         const inderboards = insider.boards
//         inderboards.map((e)=> {
//             console.log(e)
//         })
        
//         fs.unlink(image)
//         res.render("profile")

//     } catch (error) {
//         console.error('Error removing image:', error);
//         res.status(500).send('Error removing image');
//     }



// })


router.post('/delete/uploads/:img_id', isLoggedIn, async function(req, res, next) {
    const imageId = req.params.img_id; // The ID of the image to be removed
    const userId = req.user; // User ID of the current user
    console.log(userId)
    try {
        const LoggedUser = await userModel.findOne({_id : userId})
        // Find the user and update their boards array by pulling the board object with the specified imagePath
        // console.log(LoggedUser , "details of logged one ")
        const length2 = LoggedUser.boards.length
        var shit = `uploads\\\\${imageId}`
        let updatedStr = shit.replace("\\", "");
        for(var i = 0 ; i < length2 ; i++ ) {
            if (LoggedUser.boards[i].imagePath == updatedStr || LoggedUser.boards[i].imagePath == shit) {
                // console.log("match hogaya bc")
                // console.log(shit , "true shit ")
                // console.log(updatedStr , "updated shit ")
                // console.log("true the part is same " , i )
                // console.log(LoggedUser.boards[i] , "rechecking life descition lols ")
                LoggedUser.boards.splice(i, 1);
                console.log("Board removed");
                // Save the updated user document
                await LoggedUser.save();
            }
        }

        // Delete the file from the file system
        // atleast this part works now i need to remove it from the database 
        fs.unlink(`uploads/${imageId}`, (err) => {
            if (err) {
                console.error('Error removing image:', err);
                res.redirect('/home')
                
            }
        });
        res.redirect("/home")
    } catch (err) {
        console.error('Error removing image:', err);
        res.redirect("/home")
    }
});

router.post('/delete/uploads/:img_id', isLoggedIn, async function(req, res, next) {
    const imageId = req.params.img_id; // The ID of the image to be removed
    const userId = req.user; // User ID of the current user
    console.log(userId)
    try {
        const LoggedUser = await userModel.findOne({_id : userId})
        // Find the user and update their boards array by pulling the board object with the specified imagePath
        // console.log(LoggedUser , "details of logged one ")
        const length2 = LoggedUser.boards.length
        var shit = `uploads\\\\${imageId}`
        let updatedStr = shit.replace("\\", "");
        for(var i = 0 ; i < length2 ; i++ ) {
            if (LoggedUser.boards[i].imagePath == updatedStr || LoggedUser.boards[i].imagePath == shit) {
                // console.log("match hogaya bc")
                // console.log(shit , "true shit ")
                // console.log(updatedStr , "updated shit ")
                // console.log("true the part is same " , i )
                // console.log(LoggedUser.boards[i] , "rechecking life descition lols ")
                LoggedUser.boards.splice(i, 1);
                console.log("Board removed");
                // Save the updated user document
                await LoggedUser.save();
            }
        }

        // Delete the file from the file system
        // atleast this part works now i need to remove it from the database 
        fs.unlink(`uploads/${imageId}`, (err) => {
            if (err) {
                console.error('Error removing image:', err);
                res.redirect('/home')
                
            }
        });
        res.redirect("/home")
    } catch (err) {
        console.error('Error removing image:', err);
        res.redirect("/home")
    }
});


module.exports = router;
