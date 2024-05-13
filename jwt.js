const jwt = require('jsonwebtoken');

const jwtAuthMiddleware = function(req,res,next) {
    const AuthrorisationPresent = req.headers.authorization;
    if(!AuthrorisationPresent)  return res.status(401).json({error:'Authrorisation not Present in headers'});

    const token = req.headers.authorization.split(' ')[1];
    if(!token)  return res.status(401).json({error:'Token not found'});

    try {
        //verify the token and extract the payload for the token
        const tokenPayload = jwt.verify(token,process.env.SECRET_KEY);
        //send the token payload with the request so if same return the next page
        req.user = tokenPayload;
        next();
    } 
    catch (error) {
        console.log(error);
        return res.status().json({error:"Invalid token"});
    }
};

const generateToken = function(payloadTobeSend){
    return jwt.sign(payloadTobeSend,process.env.SECRET_KEY);
}

module.exports = {jwtAuthMiddleware,generateToken};