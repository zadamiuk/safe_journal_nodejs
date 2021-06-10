
const express = require('express');
const expressLayouts = require('express-ejs-layouts');
const mongoose = require('mongoose');
const passport = require('passport');
const flash = require('connect-flash');
const session = require('express-session');


const app = express()

// Passport Config
require('./config/passport')(passport);

// DB Config
const db = require('./config/keys').mongoURI;

// Connect to MongoDB
mongoose
  .connect(
    db,
    { useNewUrlParser: true ,useUnifiedTopology: true}
  )
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.log(err));

  // EJS - zamiast HTML
app.use(expressLayouts);
app.set('view engine', 'ejs');



// const express = require('express')

// const port = process.env.PORT || 3000;
// const path = require('path')
// const MongoClient = require("mongoose");

// //testowo:
// // const expressLayouts = require('express-ejs-layouts');
// // const blogKod = require('./kod/blog')
 
// // app.use('/blog',blogKod)

// // const MongoClient = require('mongodb').MongoClient;
// const uri = "mongodb+srv://jrancew:GaxKnqXJtJszHM1c@bemsi1.hquxe.mongodb.net/myFirstDatabase?retryWrites=true&w=majority";
// MongoClient.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true },(err) => {
//   const collection = client.db("notes").collection("notes");
//   const collection1 = client.db("notes").collection("users");
// // notes - nasza baza danych
// // kolekcja - users - uzytkownicy
// // kolekcja notes - notatki
// // perform actions on the collection object

//   client.close();
// });
// var ObjectID = require('mongodb').ObjectID;
// var bodyParser = require('body-parser');
// app.use(bodyParser.json()); // support json encoded bodies
// app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies


// // //testowo:
// // app.use(expressLayouts);
// // app.set('view engine','ejs');

// app.use((req, res, next) => {
//     console.log(req.url);
//     next();
// });

//  //strona startowa
// app.get("/", (req, res)=>{
//     res.sendFile(path.join(__dirname + '/widok/strona/strona.html'))
//  });

// //strona do logowania
// app.get("/logowanie", (req, res)=>{
//     res.sendFile(path.join(__dirname + '/widok/logowanie/logowanie.html'))
//  });

// //strona do rejestracji
// app.get("/rejestracja", (req, res)=>{
//     res.sendFile(path.join(__dirname + '/widok/rejestracja/rejestracja.html'))
// });

// app.post('/rejestracja', (req, res) => {
//     findLogin(req,res)
// });

// //strona z notatkami
// app.get("/moja-strona", (req, res)=>{
//     myNotes(req, res);
// })

// app.post("/moja-strona",(req, res)=>{
//     addNote(req, res);
// })

// app.listen(port, () => {
//     console.log(`Example app listening at `+ 
//     `http://localhost:${port}` );
// })

// //funkcja do wypisu wszystkich notatek
// async function myNotes(req, res){
//     const clinet = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
//     try {
//         await client.connect();
//         var note = await client.db("notes").
//                             collection("notes").
//                             find({}).toArray();
//         res.send(note);
//     }catch(err){
//         res.status(500).send("Error: "+ err)
//     }finally{
//         await client.close();
//     }
// }

// //funkcja do modyfikacji notatek
// async function upDateMyNote(req, res){
//     try{
//         const clinet = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
//         await client.connect();
//         MongoClient.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true },(err) => {
//             const collection = client.db("notes").collection("notes");
//             const collection1 = client.db("notes").collection("users");
//           // notes - nasza baza danych
//           // kolekcja - users - uzytkownicy
//           // kolekcja notes - notatki
//           // perform actions on the collection object
          
//             client.close();
//           });
//         const lista = client.db("notes");
//         lista.collection("notes").insertOne(newNote,function(err){
//             if (err) throw err;
//         });
//     }catch(err){
//         res.status(500).send("Error: "+ err)
//     }finally {
//         await client.close();
//     }

// }

// //funkcja do logowania - szukanie użytkownik
// async function findLogin(req, res){
//     try {
//         const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
//         await client.connect();
//         var menu= await client.db("notes").
//                         collection("users").
//                         find({login:req.body.login}).toArray();
//         if (menu.length===0){
//             if(req.body.password===req.body.reppassowrd){
//                 var user= {login:req.body.login,
//                 password:req.body.password};
//                 addUser(req, res, user)          
//             }else 
//             {res.send("Hasła nie są jednakowe")}
//         }else {
//             res.send("użytkownik istnieje")}
//     } catch (err) {
//         res.status(500).send("Error: "+ err)
//     } finally {
//         await client.close();
//     }
// };

// //funkcja do rejestracji - nowy uzytkownik
// async function addUser(req, res, user){
//     try {
//         const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
//         await client.connect();
//         client.db("notes").
//                 collection("users").
//                 insertOne(user, function(err, result) {                  
//                     if(err) {
//                         res.status(500).json({error: err})
//                     } else {
//                         res.send("Użytkownik został utworzony" );
                       
//                         console.log(user);
//                     }
//                 });
//     } catch (err) {
//         res.status(500).send("Error: "+ err)
//     } finally {
//         await client.close();
//     }
// };

// //na razie roboczo
// app.get("/strona", (req, res)=>{
//     res.sendFile(path.join(__dirname + '/kod/moja-strona/moja-strona.html'))
//  });
//  app.post('/strona', (req, res) => {
//     addNote(req,res)
//     });

// async function addNote(req, res){
//     try {
//         const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
//         await client.connect();
//         var note= {login:'asia1',
//             author:'asia1',
//             title:req.body.title,
//             date:req.body.date,
//         contents:req.body.content};
//         client.db("notes").
//                 collection("notes").
//                 insertOne(note, function(err, result) {                  
//                     if(err) {
//                         res.status(500).json({error: err})
//                     } else {
//                         res.send("Notatka została zapisana" );
//                         console.log(note);
//                     }
//                 });
//     } catch (err) {
//         res.status(500).send("Error: "+ err)
//     } finally {
//         await client.close();
//     }
// };

