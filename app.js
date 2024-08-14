const express = require('express');
const app = express();
const port = 3000;
const cookieParser = require('cookie-parser')
const path = require('path')
const logger = require("morgan")
const expressSession = require("express-session")


// the imports for the multer thingy 



// Require the router
const indexRouter = require('./routes/index');
const usersRouter = require("./routes/users")

// Set the view engine to EJS
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname , 'views'));
app.use(cookieParser());
app.use(express.json())
app.use(logger('dev'))
app.use(express.urlencoded({extended : false }))
app.use('/uploads', express.static('uploads'));

// iitializing the passport and all stufffs 

app.use(expressSession({
    resave :false ,
    saveUninitialized : false,
    secret : "motorola"
}))


// Use the router
app.use('/', indexRouter);

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});

// the main multer code 


