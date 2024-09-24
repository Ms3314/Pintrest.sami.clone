const mongoose = require("mongoose")

mongoose.connect("mongodb+srv://sami:yGhMicwI05cUaw9i@cluster0.dfjox.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0", { useNewUrlParser: true, useUnifiedTopology: true })
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