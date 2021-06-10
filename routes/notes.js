const express = require('express');
const router = express.Router()

const isAuthenticated = require('../config/auth');

//Note model
const Note = require('../models/Note');

router.get('/add', isAuthenticated, (req, res) => res.render('new'))

//router.get('/add', isAuthenticated, (req,res) => res.render('new'));

router.post('/new', isAuthenticated, (req,res)=>{
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
        res.redirect('/notes');
    }
})

// All notes
router.get('/', isAuthenticated, (req, res) =>{
    const notes = Note.find({user: req.user.login}).sort({date: 'desc'})
    res.render('all', { notes })
})

router.get('/edit/:id', isAuthenticated, (req, res)=>{
    const note = Note.findById(req.params.id)
    res.render('/notes/edit', {note})
})

router.put('/edit/:id', isAuthenticated, (req,res) => {
    const {title, description} = req.body
    Note.findByIdAndUpdate(req.params.id, {title, description})
    req.flash('success_msg', 'Note Updated Successfully')
    res.redirect('/notes')
})

router.delete('/delete/:id', isAuthenticated, (req,res)=>{
    Note.findByIdAndDelete(req.params.id)
    req.flash('success_msg', 'Note Deleted Successfully')
    res.redirect('/notes')
})

module.exports = router