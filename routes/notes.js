const express = require('express');
const router = express.Router()
const crypto = require('crypto');

// TUTAJ sa rozne wersje, ze raz klucz sie zmienia raz nie - mozna odkomentowywac

const algorithm = 'aes-256-ctr'; //wybieramy algorytm szyfrowania
// const key = 'vOVH6sdmpNWjRRIqCc7rdxs01lwHzfr3'; //w wersji: wszyscy taki sam klucz
const key = crypto.randomBytes(32); // losowo generowany klucz
const iv = crypto.randomBytes(16); // losowo generowany iv
// const iv = 'ff91247ddf948fbda6dc9ae732e295f3'; //zawsze taki sam - opcja tylko dla testowania
//iv - wektor inicjujacy


const { ensureAuthenticated, forwardAuthenticated } = require('../config/auth');

//  Encryption function

function encrypt(text,key1,iv1) {
    
    const cipher = crypto.createCipheriv(algorithm, key1, iv1);

    const encrypted = Buffer.concat([cipher.update(text), cipher.final()]);

    return {
        iv: iv1.toString('hex'),
        content: encrypted.toString('hex')
    };

}

function decrypt(text, key1, iv1) {
    //text - plain text
    //key1 - klucz szyfrujacy dla dokladnie tej notatki
    //iv1 - wektor inicjujący dla dokladnie tej notatki



    const decipher = crypto.createDecipheriv(algorithm, key1, Buffer.from(iv1, 'hex'));

    const decrpyted = Buffer.concat([decipher.update(Buffer.from(text, 'hex')), decipher.final()]);

    return decrpyted.toString();

}
// const key = require('../config/keys').key; //szyfrowanie od Kingi

//Note model
const Note = require('../models/Note');

//Key model
const Key = require('../models/Key');

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
        const newKey = new Key({value: key, iv: iv, title});
        newKey.user = req.user.login
        newKey.save()

        console.log(encrypteddDescription);

    // decryption for testing - TRZEBA USUNĄĆ POTEM! - POTWIERDZENIE, ZE DZIALA DESZYFROWANIE DLA TYCH DANYCH
        var note1=decrypt(encrypteddDescription.content,key,encrypteddDescription.iv);
        console.log("Odszyfrowane:" + note1);

        // adding to database

        const newNote = new Note({title, description: encrypteddDescription.content}) 
        newNote.user = req.user.login
        newNote.save()
        req.flash('success_msg', 'Note added successfully'); // to z jakiegos powodu nie dziala
        res.redirect('/notes/all');
    }
})

// All notes
router.get('/all', ensureAuthenticated,  (req, res) => {

    // TUTAJ - trzeba zrobić tak, że:
    //     1 dostajemy się do notatki
    //     dostajemy się do klucza odpowiadającego tej notatce (loginem autora i tytułem)
    //     za pomoca klucza i iv odszyfrowujemy tresc 
    //     przekazujemy tresc odszyfrowana


// WIELKA IMPROWIZACJA KLUCZE
//   Note.find({user: req.user.login}, function(err,data) { 
    
//      if(err){
//          console.log(err);
//          res.send(500).status;

//      }
//      else {
//         const secret=Key.findOne({user: req.user.login, 
//             title: data.title})

//         // .catch(err => {
//         //     console.log(err);
//         //     res.send(500).status;
//         // });
     
//         secret.select('key iv');
//         secret.exec(function(err, secretSet){
//          console.log('key: %s, iv: %s',secretSet.key, secretSet.iv);
//         });

//         await Key.findOne({ user: req.user.login, 
//             title: data.title }, 'key iv').exec();

//         console.log(data);

        
//    res.render('all.ejs', {Note: data});
//      }

                    
//    })
   
// })
   



//  //wersja dzialajaca, bez odszyfrowywania:
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

 
// tego chyba nigdy nie uzywamy
 router.post('/all', ensureAuthenticated, (req, res) =>{
     var notes = Note.find({user: req.user.login}).sort({date: 'desc'})
     if(notes) {
        // console.log('test3')
        // notes.forEach(function(key,iv)  {
        //   description=decrypt(description,key,iv);
        //   console.log('test1')
        // });

        //  var note1=decrypt(encrypteddDescription,key,iv);
        //  console.log("Odszyfrowane:" + note1);

        
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

module.exports = router;