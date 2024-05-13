const mongoose = require("mongoose");

const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
    name :{
        type: String,
        required: true
    },
    age: {
        type:Number,
        required:true
    },
    mobile:{
        type:String,
        required:true,
        unique:true
    },
    email:{
        type:String,
        required:true,
        unique:true
    },
    address:{
        type:String,
    },
    aadharCardNumber: {
        type:Number,
        required:true,
        unique:true
    },
    password: {
        type:String,
        required:true,
    },
    role: {
        type: String,
        enum:['voter','admin'],
        default:'voter'
    },
    isVoted: {
        type : Boolean,
        default: false
    }
});

userSchema.pre('save', async function(next){

    if(!this.isModified('password'))    return next();

    try {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(this.password,salt); 
        this.password = hashedPassword;
        next();
        
    } catch (error) {
        return next(error);
    }
})

const User = mongoose.model('User',userSchema);

module.exports = User;