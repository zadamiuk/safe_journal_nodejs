const express = require('express');
const router = express.Router();

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
        
    });
    } else {
        res.send('pass');
    }


});


module.exports=router;