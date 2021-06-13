const LocalStrategy = require('passport-local').Strategy;
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs'); // for comparing the passwords

// Load User model
const User = require('../models/User');

module.exports = function(passport) {
    //passport will be passed in from server.js file
  passport.use(
    new LocalStrategy({ usernameField: 'login' }, (login, password, done) => {
      // Match user
      User.findOne({ //using mongoose to find user
        login: login
      }).then(user => {
        if (!user) {
          return done(null, false, { message: 'Please try again' });
     //Message without any details to ensure safety
        }

        // Match password
        //user is coming from database
        bcrypt.compare(password, user.password, (err, isMatch) => {
          if (err) throw err;
       
          if (isMatch) {
            return done(null, user);
          } else {
            return done(null, false, { message: 'Please try again' });
            //Message without any details to ensure safety
        
          }
        });
      })
      .catch(err=> console.log(err));
    })
  );

  passport.serializeUser(function(user, done) {
    done(null, user.id);
  });
  

  passport.deserializeUser(function(id, done) {
    User.findById(id, function(err, user) {
      done(err, user);
    });
  });
};