const express = require('express');
const jwt = require('jsonwebtoken');
const { HTTP_UNAUTHORIZED } = require('./constants.js');
const { SECRET_KEY } = require('./secret.js');
const { User } = require('./database/models');

const printTime = function(req, res, next){
    console.log(`Request ${req.method} received for ${req.url} at ${(new Date()).toLocaleTimeString()}`);
    next();
};

const bodyParser = express.json();

const authenticate = function(req, res, next){
    const token = req.headers['x-access-token']; //Username encoded in token
    if(!token){
        return res.status(HTTP_UNAUTHORIZED).send('Please sign in');
    }
    jwt.verify(token, SECRET_KEY, function(err, decodedToken){
        //If err, token invalid
        if(err){
            return res.status(HTTP_UNAUTHORIZED).send('Please sign in');
        }
        //Check if user exists in the database
        const user = decodedToken.user;
        User.findOne({username: user}).exec(function(err, result){
            if(result){
                req.body.user_id = result._id;
                return next();
            }
            return res.status(HTTP_UNAUTHORIZED).send('Please sign in');
        });
    });
};

exports.printTime = printTime;
exports.bodyParser = bodyParser;
exports.authenticate = authenticate;

