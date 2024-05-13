const express = require('express');
const router = express.Router();    

const bcrypt = require('bcrypt');

const User = require('./../models/userModel');
const { generateToken } = require('../jwt');

router.post('/signup',async (req,res) => {
    try {
        const data = req.body;
        const response = await new User(data).save();

        const payload = {
            id: response.id,
            aadharCardNumber: response.aadharCardNumber
        }
        const token = generateToken(payload);

        console.log("Person data entered");
        res.status(200).json({response:response,token:token});
    } 
    catch(err){
        console.log(err + "\n ERROR:User data not entered");
        res.status(500).json({error:"error"});
    }
});

router.post('/login',async (req,res)=>{
    const {username,password} = req.body;
    const user = await User.findOne({aadharCardNumber:username});

    const isMatch = await bcrypt.compare(password,user.password);
    if(!user || !isMatch){
        return res.status(401).json({error:"Username or Password is not matching"});
    }

    const payload = {
        id: user.id,
        aadharCardNumber: user.aadharCardNumber
    }
    const token = generateToken(payload);
    
    console.log("Person logged in");
    res.status(200).json({response:user,token:token});
});



module.exports = router;