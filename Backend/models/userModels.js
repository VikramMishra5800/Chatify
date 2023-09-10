const mongoose = require("mongoose")
const bcrypt = require("bcryptjs")
const findOrCreate = require("mongoose-findorcreate");

const userModel = mongoose.Schema({
    name: {type: String,required: true},
    email: {type: String,required : true,unique: true},
    password: {type: String,required : function(){return !this.googleId;}},
    pic: {type: String,default: "https://icon-library.com/images/anonymous-avatar-icon/anonymous-avatar-icon-25.jpg"},
    googleId: {type: String}
},
    {timestamps : true}
)

userModel.methods.matchPassword = async function(enteredPassword)
{
    return await bcrypt.compare(enteredPassword,this.password)
}

userModel.pre("save",async function (next){
    if(!this.isModified || this.password == undefined)
    next();

    if(this.password != undefined){
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password,salt);
    }
})

//userModel is a userSchema
userModel.plugin(findOrCreate);

const User = mongoose.model("User",userModel);

module.exports = User;