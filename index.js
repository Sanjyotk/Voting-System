const express = require('express');
const app = express();

require('dotenv').config();

const { jwtAuthMiddleware } = require('./jwt');

const bodyParser = require('body-parser');
app.use(bodyParser.json());

function logRequest(req,res,next){
    console.log(`[${new Date().toLocaleString()}] Request made to : ${req.originalUrl}`);
    next(); //to go to server page
}

app.use(logRequest);

const db = require('./db_connect');

const userRoutes = require('./routes/userRoutes');
app.use('/user',userRoutes);

const candidateRoutes = require('./routes/candidateRoutes');
app.use('/candidate',jwtAuthMiddleware,candidateRoutes);

const PORT = process.env.PORT || 3000;

app.listen(PORT,(error) => {
    if(error){console.log(error);}
    console.log('listening on port 3000');
});