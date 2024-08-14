const mongoose = require("mongoose")
const plm = require("passport-local-mongoose")
mongoose.connect("mongodb://localhost:27017/pin")

const userSchema = mongoose.Schema({
    username : String, 
    name : String,
    email : String,
    password : String,
    profileImage : String ,
    boards : {
        type : Array,
        default : []
    },
    savedPins : {
        type : Array,
        default  : []
    }


})

userSchema.plugin(plm)

module.exports = mongoose.model("user",userSchema)