const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Bluebird = require("bluebird");
const mongoose = require('mongoose');
const { printTime, bodyParser, authenticate } = require('./middleware.js');
const { SECRET_KEY } = require('./secret.js');
const { HTTP_CREATED, HTTP_UNAUTHORIZED } = require('./constants.js');
const { User, Place } = require('./database/models');
const { getPlaces, postPlace } = require('./database/controller');

const databaseUrl = process.env.DATABASE_URL || 'mongodb+srv://pavelp:randompass@cluster0-z6tj0.mongodb.net/test?retryWrites=true';
mongoose.connect(databaseUrl, { useNewUrlParser: true });

const app = express();
const port = process.env.PORT || 3000;

//Middleware
app.use(printTime);
app.use(bodyParser);

app.get('/', function(req, res) {
    res.send('Hello World!');
});

//Returns all places from the database
app.get('/places', authenticate, getPlaces);

//Add new place to the database
app.post('/places', authenticate, postPlace);

//Create new user in the database
app.post('/signup', function(req, res) {
    const username = req.body.username;
    const password = req.body.password;
    User.findOne({username}).exec((err, result) => {
        if(err){
            return res.status(500).send(err);
        }
        if(result){
            return res.send('This username already exists');
        }
        const hashedPassword = bcrypt.hashSync(password, 10);
        let newUser = new User({username: username, password: hashedPassword});
        newUser.save();
        return res.status(HTTP_CREATED).send('Sign up successful');
    });
});

//Sign in user
app.post('/signin', function(req, res) {
    const username = req.body.username;
    const password = req.body.password;
    //Check if user exists in the database
    User.findOne({username: username}).exec((err, result) => {
        if(!result){
            return res.status(HTTP_UNAUTHORIZED).send('Please sign up');
        } else {
            //Compare with stored password
            const existingPassword = result.password;
            bcrypt.compare(password, existingPassword, function(err, isMatching){
                if(isMatching){
                    //Create a token and send to client
                    const token = jwt.sign({user: username}, SECRET_KEY);
                    return res.send({token: token});
                } else {
                    return res.status(HTTP_UNAUTHORIZED).send('Wrong password');
                }
            });
        }
    })
});

function completedWork(value){
    console.log(`I am done! I worked really hard for ${value} seconds`);
};

function doSomething(type, seconds){
    return new Bluebird(function(resolve, reject) {
        let count = 0;
        console.log(`I am ${type} hard`);
        setTimeout(function(){
            count += seconds;
            resolve(count);
        }, 1000 * seconds);
    });
};

app.get('/random', function(req, res){
    doSomething('coding', 5).then(count => {
        completedWork(count);
        res.send('Done')
    })
});

app.listen(port, function() {
    console.log(`Example app listening on port ${port}!`)
});