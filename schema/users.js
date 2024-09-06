const mongoose = require("mongoose")
mongoose.connect("mongodb://localhost:27017/pin")

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
        type : mongoose.Schema.Types.ObjectId , 
        ref : "content"
    }


})


module.exports = mongoose.model("user",userSchema)