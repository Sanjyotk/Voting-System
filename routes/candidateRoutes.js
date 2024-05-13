const express = require('express');
const router = express.Router();

const Candidate = require('./../models/candidateModel');
const User = require('./../models/userModel');

const bcrypt = require('bcrypt');
const { jwtAuthMiddleware } = require('../jwt');

const checkRole = async function(id){
    try{
        const user = await User.findById(id);
        if(user.role == 'admin')    return true;
        return false;
    }
    catch(err){
        console.log(err + "\n ERROR");
        res.status(500).json({error:"error"});
    }
}

router.post('/', jwtAuthMiddleware, async (req, res) => {
    try {
        if (!await checkRole(req.user.id)) {
            return res.status(405).json({ msg: "not an admin" });
        }
        const data = req.body;
        const newCandidate = new Candidate(data);
        const response = await newCandidate.save();

        res.status(200).json({ response: response });
    } catch (err) {
        console.log(err + "\n ERROR");
        res.status(500).json({ error: "error" });
    }
});

router.put('/:candidateId', jwtAuthMiddleware,async (req,res) => {
    try{
        if(!await checkRole(req.user.id)){
            return res.status(405).json({msg:"not a admin"});
        }
        const candidateId = req.params.candidateId;
        const data = req.body;
        const response = await Candidate.findByIdAndUpdate(candidateId,data,{
            new: true,
            runValidators:true
        });

        if(!response){
            return res.status(404).json({error:"not found"});
        }
        
        res.status(200).json({response:response});
    }
    catch(err){
        console.log(err + "\n ERROR");
        res.status(500).json({error:"error"});
    }
});

router.delete('/:candidateId', jwtAuthMiddleware,async (req,res) => {
    try{
        if(!await checkRole(req.user.id)){
            return res.status(405).json({msg:"not a admin"});
        }
    const candidateId = req.params.candidateId;
    const response = await Candidate.findByIdAndDelete(candidateId);

    if(!response){
        return res.status(404).json({error:"not found"});
    }

    console.log("found and deleted");
    res.status(200).json({response:response});
    }
    catch(err){
        console.log(err + "\n ERROR");
        res.status(500).json({error:"error"});
    }
});

router.post('/vote/:candidateid', async (req,res) => {
    const candidateid = req.params.candidateid;
    const userId = req.user.id;

    try {
        const candidate = await Candidate.findById(candidateid);
        if(!candidate){
            res.status(404).json({error:"candidate id not found"});
        }

        const user = await User.findById(userId);
        if(!user){
            res.status(404).json({error:"user id not found"});
        }
        
        if(user.isVoted == true){
            res.status(400).json({error:"user has already voted once"});
        }

        if(user.role == 'admin'){
            res.status(403).json({error:"admin cannot vote"});
        }

        //after all the checks user can vote
        //updating candidate document
        candidate.votes.push({user:userId});
        candidate.voteCount++;
        await candidate.save();
        
        //updating user document
        user.isVoted = true;
        await user.save();

        console.log("vote casted");
    }
    catch(err){
        console.log(err + "\n ERROR");
        res.status(500).json({error:"error"});
    }
});

router.get('/vote/count',async (req,res)=>{
    try {
        const allCandidates = await Candidate.find().sort({voteCount:'desc'});

        //mapping only party
        const record = allCandidates.map((data)=>{
            return{
                party: data.party,
                voteCount: data.voteCount
            }
        });
        console.log("votes displayed");
        res.status(200).json(record);
    }
    catch(err){
        console.log(err + "\n ERROR");
        res.status(500).json({error:"error"});
    }
});

router.get('/allCandidates', async (req,res) =>{
    try {
        const allCandidates = await Candidate.find();
        const display = allCandidates.map((data)=>{
            return{
                name: data.name,
                party: data.party,
                age: data.age
            }
        });
        console.log("candidates displayed");
        res.status(200).json(display);
    }
    catch(err){
        console.log(err + "\n ERROR");
        res.status(500).json({error:"error"});
    }
});

module.exports = router;