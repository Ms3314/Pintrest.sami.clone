const express = require('express');
const app = express();
require('dotenv').config();
const cookieParser = require('cookie-parser')
const path = require('path')
const logger = require("morgan")
const expressSession = require("express-session")
const allRoutes = require("./routes/allBasicRoutes")

// the imports for the multer thingy 
// Require the router');
// const usersRouter = require("./routes/users")

// Set the view engine to EJS

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname , 'views'));
app.use(cookieParser());
app.use(express.json())
app.use(logger('dev'))
app.use(express.urlencoded({extended : false }))

// iitializing the passport and all stufffs 




// Use the router
app.use('/', allRoutes);

// Error handler middleware
app.use((err, req , res, next) => {
    console.error(err.stack);
    res.status(500).send('Something went wrong!');
});


app.listen(3000 , () => {
    console.log("port is running on 3000")
})

// the main multer code 


