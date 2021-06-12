const express = require('express');
const router = express.Router()

const { ensureAuthenticated, forwardAuthenticated } = require('../config/auth');


//Note model
const Note = require('../models/Note');

router.get('/new', ensureAuthenticated, (req, res) => res.render('new'))

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
        res.redirect('/notes/all');
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
 })

 router.post('/all', ensureAuthenticated, (req, res) =>{
     const notes = Note.find({user: req.user.login}).sort({date: 'desc'})
     if(notes) {
         res.render('all', { notes })
     } else {
         res.render('no_notes')
     }
 })
 
router.get('/edit/:id', ensureAuthenticated, (req, res)=>{
    const note = Note.findById(req.params.id)
    res.render('/notes/edit', {note})
})

router.put('/edit/:id', ensureAuthenticated, (req,res) => {
    // const {title, description} = req.body
    // Note.findByIdAndUpdate(req.params.id, {title, description})
    // req.flash('success_msg', 'Note Updated Successfully')
    // res.redirect('/notes')

    // if(!req.body.name || !req.body.price) {
    //     return res.status(400).send({
    //         success: false,
    //         message: "Please enter product name and price"
    //     });
    // }

    // find product and update
    Note.findByIdAndUpdate(req.params.id, {
        $set: req.body
    }, {new: true})
        .then(data => {
            if(!data) {
                return res.status(404).send({
                    success: false,
                    message: "Note not found with id " + req.params.id
                });
            }
            res.send({
                success: true,
                data: data
            });
        }).catch(err => {
        if(err.kind === 'ObjectId') {
            return res.status(404).send({
                success: false,
                message: "Note not found with id " + req.params.id
            });
        }
        return res.status(500).send({
            success: false,
            message: "Error updating note with id " + req.params.id
        });
    })
})

// Delete
router.get('/delete/:id', function(req, res) {
    Note.findByIdAndRemove(req.params.id, function (err, project) {
      if (err) {
        req.flash('errorMsg', 'User not deleted successfully.');
        res.redirect('/notes/all');
      } else {
        req.flash('successMsg', 'User deleted successfully.');
        res.redirect('/notes/all');
      }
    });
  });
  

// router.get('/delete/:id', ensureAuthenticated, (req, res)=>{
//     const note = Note.findById(req.params.id)
//     res.render('/notes/delete', {note})
// })


// router.delete('/delete/:id', ensureAuthenticated, (req,res)=>{
//     // Note.findByIdAndDelete(req.params.id)
//     // req.flash('success_msg', 'Note Deleted Successfully')
//     // res.redirect('/notes')
//     Note.findByIdAndRemove(req.params.id)
//     .then(data => {
//         if (!data) {
//             return res.status(404).send({
//                 success: false,
//                 message: "Note not found with id " + req.params.id
//             });
//         }
//         res.send({
//             success: true,
//             message: "Note successfully deleted!"
//         });
//     }).catch(err => {
//     if (err.kind === 'ObjectId' || err.name === 'NotFound') {
//         return res.status(404).send({
//             success: false,
//             message: "Note not found with id " + req.params.id
//         });
//     }
//     return res.status(500).send({
//         success: false,
//         message: "Could not delete Note with id " + req.params.id
//     });
// });
// })

module.exports = router