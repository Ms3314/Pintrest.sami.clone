const mongoose = require("mongoose")

mongoose.connect("mongodb://localhost:27017/hello", { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Database connected successfully!'))
  .catch((err) => console.log('Database connection error:', err));


const userSchema = mongoose.Schema({
    username : String, 
    name : String,
    email : String,
    password : String,
    profileImage : String ,
    pins : {
        type : mongoose.Schema.Types.ObjectId , 
        ref : "content"
    },
    savedPins : {
        type : [] , 
        ref : "content"
    }


})


module.exports = mongoose.model("user",userSchema)