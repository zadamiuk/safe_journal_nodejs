const express = require('express');
const router = express.Router()
const crypto = require('crypto');


// const algorithm = 'aes-256-cbc'; // version 1
const algorithm = 'aes-256-ctr'; //version 2
const key = 'vOVH6sdmpNWjRRIqCc7rdxs01lwHzfr3'; //version 2
// const key = crypto.randomBytes(32); //chyba jeden klucz dla wszystkich, czy to bezpieczne? //version 1
const iv = crypto.randomBytes(16); //version 1 and 2


const { ensureAuthenticated, forwardAuthenticated } = require('../config/auth');

//encryption function

function encrypt(text,key1,iv1) {
    //anything here

    // version 1
    // let cipher = crypto.createCipheriv('aes-256-cbc',Buffer.from(key1), iv1);
    // let encrypted = cipher.update(text);
    // encrypted = Buffer.concat([encrypted, cipher.final()]);
    // return { iv: iv.toString('hex'), encryptedData: encrypted.toString('hex') };


    // version 2
    const cipher = crypto.createCipheriv(algorithm, key1, iv1);

    const encrypted = Buffer.concat([cipher.update(text), cipher.final()]);

    return {
        iv: iv1.toString('hex'),
        content: encrypted.toString('hex')
    };

}

function decrypt(text, key1,iv1) {
     //anything here

    // version 1
    // let iv = Buffer.from(text.iv, 'hex');
    // let encryptedText = Buffer.from(text.encryptedData, 'hex');
    // let decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(key1), iv);
    // let decrypted = decipher.update(encryptedText);
    // decypted = Buffer.concat([decrypted, decipher.final()]);
    // return decrypted.toString();

    // version 2
    const decipher = crypto.createDecipheriv(algorithm, key1, Buffer.from(text.iv, 'hex'));

    const decrpyted = Buffer.concat([decipher.update(Buffer.from(text.content, 'hex')), decipher.final()]);

    return decrpyted.toString();

}
// const key = require('../config/keys').key; //szyfrowanie od Kingi

//Note model
const Note = require('../models/Note');

router.get('/new', ensureAuthenticated, (req, res) => res.render('new'))


// New Note
router.post('/new', ensureAuthenticated, (req,res)=>{
    const {title, description} = req.body
    let errors = [];
    if(!title){
        errors.push({ msg: 'Please insert a title.' });
    }

    if (!description) {
        errors.push({ msg: 'Please insert a description' }); 
    }

    if(errors.length > 0){
        res.render('new', {
            errors, 
            title, 
            description 
        });
    } else {
    // encryption
        const encrypteddDescription=encrypt(description,key,iv);
        console.log(encrypteddDescription);

        // decryption for testing
        var note1=decrypt(encrypteddDescription,key,iv);
        console.log("Odszyfrowane:" + note1);

        // adding to database
        // const newNote = new Note({title, description: encrypteddDescription.encryptData}) //version 1
        const newNote = new Note({title, description: encrypteddDescription.content}) //version 2
        newNote.user = req.user.login
        newNote.save()
        req.flash('success_msg', 'Note added successfully'); // to z jakiegos powodu nie dziala
        res.redirect('/notes/all');
    }
})

// All notes
router.get('/all', ensureAuthenticated, (req, res) => {
    // const notes = Note.find({user: req.user.login}).fetch();
    Note.find({user: req.user.login}, function(err,data) { 
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
          //to raczej nie działa/nie jest uruchamiane(?)
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
router.get('/delete/:id', ensureAuthenticated, function(req, res) {
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