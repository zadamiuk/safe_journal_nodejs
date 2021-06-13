const express = require('express');
const router = express.Router()
const crypto = require('crypto');



const algorithm = 'aes-256-ctr'; //selecting the algorithm 
// const key = 'vOVH6sdmpNWjRRIqCc7rdxs01lwHzfr3'; // a code for a simple version for testing
// const iv = 'ff91247ddf948fbda6dc9ae732e295f3';  // a code for a simple version for testing
const key = crypto.randomBytes(32); // key generated randomly
const iv = crypto.randomBytes(16); // iv generated randomly



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
    //key1 - key - encryption scheme
    //iv1 - initalization vector



    const decipher = crypto.createDecipheriv(algorithm, key1, Buffer.from(iv1, 'hex'));

    const decrpyted = Buffer.concat([decipher.update(Buffer.from(text, 'hex')), decipher.final()]);

    return decrpyted.toString();

}

//Note model
const Note = require('../models/Note');

//Key model
const Key = require('../models/Key');
const { send } = require('process');

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
        var note1=decrypt(encrypteddDescription.content,key,encrypteddDescription.iv);
        console.log("Odszyfrowane:" + note1);

        // adding to database

        const newNote = new Note({title, description: encrypteddDescription.content}) 
        newNote.user = req.user.login
        newNote.save()

        //creating a key and adding to database - NOT EVERYTHING CORRECT - iv and key 
        const newKey = new Key({value: key, iv: iv, _id_note: newNote._id});
        newKey.user = req.user.login
        newKey.save()
        res.redirect('/notes/all');
    }
})

// All notes
router.get('/all', ensureAuthenticated,  (req, res) => {



// CODE BELOW: NOT EVERYTHING CORRECT
//  - A PART OF CODE TO COMMUNICATE WITH DATABASE TO STORE KEYS SAFELY

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
   



// commented code - not everything is correct 
 Note.find({user: req.user.login}, function(err,data) { 
    
     if(err){
         console.log(err);
         res.send(500).status;
     }
     else {
        // data.forEach( function( data1){
        //     // Key.find({user: req.user.login, title:data.title}, function(err,data2) {
        //     //     if(err){
        //     //         console.log(err);
        //     //         res.send(500).status;
        //     //     }else{
        //     //         console.log(data2.key, data2.iv);
                
        //     //         //data1.description=decrypt(data1.description, data2.key, data2.iv)
        //     //     }
        //     //  })})
        res.render('all.ejs', {
        Note: data});
        }            
   });
 })

 
// // UNUSED PART BEL0W:
//  router.post('/all', ensureAuthenticated, (req, res) =>{
//      var notes = Note.find({user: req.user.login}).sort({date: 'desc'})
//      if(notes) {

        
//          res.render('all', { notes })
//      } else {
//           //to raczej nie działa/nie jest uruchamiane(?)
//          res.render('no_notes')
//      }
//  })
 
// UNUSED PART BELOW:
router.get('/edit/:id', ensureAuthenticated, (req, res)=>{
    const note = Note.findById(req.params.id)
    res.render('/notes/edit', {note})
})

// UNUSED PART BELOW:
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

    // find and update
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
  
  router.get('/note/:id', ensureAuthenticated, function(req, res) {
    Key.findOne({_id_note: req.params.id},function (err, key) {
    
        if(err){
            console.log(err);
            res.send(500).status;
        }
        else{
            Note.findById(req.params.id, function (err, data) {
    
                if(err){
                    console.log(err);
                    res.send(500).status;
                }
                else {
                    console.log(data.description);
                    console.log("key:  ", key.value);
                    console.log("iv:  ", key.iv);
                   const text = decrypt(data.description, key.value, key.iv) 
                   console.log(1);
                   console.log(text);
                   res.send(text)
                   //res.render('note.ejs', {
                   //Note: data});
                   }            
              });
           
        }
    })
    //res.send(req.params.id)
    
        })
       ;
  

module.exports = router;