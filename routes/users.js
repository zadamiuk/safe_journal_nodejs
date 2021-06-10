const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');

// User model
const User = require('../models/User')

//Login Page
router.get('/login', (req,res) => res.render('login'));

// Register Page
router.get('/register', (req,res) => res.render('register'));


// Register Handle
router.post('/register',(req,res)=>{
    const{login, password, password2}=req.body;
    //trzeba hashowanie tutaj dać
    let errors =[];
    //Check required fields
    if(!login || !password || !password2){
    errors.push({msg: "Please fill in all fields"});
    }

    //Check passwords match
    if(password!==password2){
        errors.push({msg: "Passwords do not match"}); 
    }
    //Check password length
    if(password.length<10){
        errors.push({msg: "Password should be at least 10 characters"}); 
    }

    if(errors.length>0){
    res.render('register',{
        errors,
        login,
        password,
        password2
        
    });
    } else {
       //Validation passed

    //    Creating Models for mongoose
    User.findOne({login: login})
    .then(user=> {
        if(user) {
//User exists
errors.push({msg: 'Login is already registered. Please log in or change the login'});
res.render('register', {
    errors,
    login,
    password,
    password2
});

        } else {
const newUser = new User ({
    login: login,
    password: password
});
        console.log(newUser)
        res.send('hello new user');
}


    });


    }


});


module.exports=router;