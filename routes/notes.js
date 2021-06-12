const express = require('express');
const router = express.Router()

const { ensureAuthenticated, forwardAuthenticated } = require('../config/auth');


//Note model
const Note = require('../models/Note');

router.get('/new', ensureAuthenticated, (req, res) => res.render('new'))

//router.get('/add', ensureAuthenticated, (req,res) => res.render('new'));

router.post('/new', ensureAuthenticated, (req,res)=>{
    const {title, description} = req.body
    let errors = []
    if(!title){
        errors.push({ msg: 'Please insert Title.' });
    }

    if (!description) {
        errors.push({ msg: 'Please insert a description' });
    }

    if(errors.length > 0){
        res.render('new', {
            errors, 
            title, 
            description 
        })
    } else {
        const newNote = new Note({title, description})
        newNote.user = req.user.login
        newNote.save()
        req.flash('success_msg', 'Note added successfully');
        res.redirect('/dashboard');
    }
})

// All notes
router.get('/all', ensureAuthenticated, (req, res) => {
   // const notes = Note.find({user: req.user.login}).fetch();
   Note.find({}, function(err,data) { 
    if(err){
        console.log(err);
        res.send(500).status;
    }
    else {
        res.render('all.ejs', {
        Note: data});
        }            
  });
  //res.render('all.ejs', { link: "edit" });
  /*   console.log(notes.title)
    const notes1 ={_id:1,
    title:'a', description:'a',date:'1988-03-21',user:'a'}
    if(notes) {
        res.render('all', { 'data':note})
    } else {
        res.render('no_notes')
    } */
})
router.post('/all', ensureAuthenticated, (req, res) =>{
    const notes = Note.find({user: req.user.login}).sort({date: 'desc'})
    if(notes) {
        res.render('all', { notes })
    } else {
        res.render('no_notes')
    }
})

router.get('/edit', ensureAuthenticated, (req, res)=>{
  
    const note = Note.findById(req.params.id)
    res.render('/notes/edit', {note})
})

router.put('/edit/:id', ensureAuthenticated, (req,res) => {
    const {title, description} = req.body
    Note.findByIdAndUpdate(req.params.id, {title, description})
    req.flash('success_msg', 'Note Updated Successfully')
    res.redirect('/notes')
})

router.delete('/delete/:id', ensureAuthenticated, (req,res)=>{
    Note.findByIdAndDelete(req.params.id)
    req.flash('success_msg', 'Note Deleted Successfully')
    res.redirect('/notes')
})

module.exports = router