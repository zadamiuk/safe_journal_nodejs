const express = require('express');
const router = express.Router();
const { ensureAuthenticated, forwardAuthenticated } = require('../config/auth');

// Welcome Page
// router.get('/', forwardAuthenticated, (req, res) => res.render('welcome'));
//linijka powyzej - nie wiem, czy potrzebna
router.get('/',(req,res)=> res.render('welcome'));

// Dashboard
router.get('/dashboard', ensureAuthenticated, (req, res) =>
    res.render('dashboard', {
        user: req.user
        //name, login -> przez user do tego wchodzimy
    })
);

module.exports = router;