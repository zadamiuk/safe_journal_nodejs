
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

// Connect to MongoDB - laczenie z baza
mongoose
  .connect(
    db,
    { useNewUrlParser: true ,
      useUnifiedTopology: true}
  )
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.log(err));

  // EJS - zamiast HTML
app.use(expressLayouts);
app.set('view engine', 'ejs');

// Express body parser
app.use(express.urlencoded({ extended: false }));

// Express session - pod sesje
app.use(
    session({
      secret: 'secret',
      resave: true,
      saveUninitialized: true
    })
  );

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Connect flash
app.use(flash());

// Global variables - ustawienia kolorow
app.use(function(req, res, next) {
    res.locals.success_msg = req.flash('success_msg');
    res.locals.error_msg = req.flash('error_msg');
    res.locals.error = req.flash('error');
    next();
  });


// Routes
app.use('/', require('./routes/index'));
app.use('/users', require('./routes/users'));
app.use('/notes', require('./routes/notes'))

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Example app listening at `+ 
  `http://localhost:${PORT}` );
})



