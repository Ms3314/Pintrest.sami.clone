const mongoose = require("mongoose")
mongoose.connect("mongodb://localhost:27017/pin")
const userSchema = require("./users")

const contentSchema = mongoose.Schema({
    // i want to add something like the pins of pintresst
    imagePath : String,
    title : String,
    description : String,
    tags : Array,
    createdAt: {
        type: Date,
        default: Date.now  // Automatically sets creation time
    },
    updatedAt: {
        type: Date,
        default: Date.now  // Automatically sets update time
    },
    user : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "user"
    }
})


module.exports = mongoose.model("content",contentSchema)