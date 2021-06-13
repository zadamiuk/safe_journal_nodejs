const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const passport = require('passport');

// User model
const User = require('../models/User')

//Login Page
router.get('/login', (req,res) => res.render('login'));

// Register Page
router.get('/register', (req,res) => res.render('register'));


// Register Handle
router.post('/register',(req,res)=>{
    const{login, password, password2}=req.body;
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
        errors.push({msg: "Password should be at least 10 characters long"}); 
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
     // Hash Password
     // genSalt - here we generate the salt for hashing
     bcrypt.genSalt(10,(err, salt) => 
     bcrypt.hash(newUser.password, salt, (error,hash) => {
    if(err) throw err;
    //set password to hashed 
    newUser.password=hash;
    // save user
    newUser.save()
        .then(user=> {
            req.flash('success_msg', 'You are registered. Please log in');
            res.redirect('/users/login');
        })
        .catch(err=>console.log(err))

     })
     )
}


    });


    }


});

// Login Handle
router.post('/login', (req,res,next)=>{
passport.authenticate('local',{
    successRedirect: '/dashboard',
    //po sukcesie lecimy do dashboard
    failureRedirect: '/users/login',
    failureFlash: true

})(req,res,next);

});

// Logout Handle
router.get('/logout',(req,res)=>
{
req.logout();
req.flash('success_msg', 'You are logged out');
res.redirect('/users/login');

});

module.exports=router;