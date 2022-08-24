const dotenv = require('dotenv');
const express = require('express');
const expressLayouts = require('express-ejs-layouts');
const mongoose = require('mongoose');
const flash = require('connect-flash');
const session = require('express-session');
const passport = require('passport');

dotenv.config({})

const app = express();
//passport config
require('./config/passport')(passport);


//connect to mongoDB
mongoose.connect(process.env.MongoURI)
    .then(()=> console.log('Connected to MongoDB'))
    .catch(err => console.log(err));

//EJS
app.use(expressLayouts);
app.set('view engine', 'ejs');

//bodyParser
app.use(express.urlencoded({ extended: false }))

//Express session
app.use(session({
    secret: 'secret',
    resave: true,
    saveUninitialized: true
}));

//passport middleware
app.use(passport.initialize());
app.use(passport.session());

//connect flash
app.use(flash());

// Global variables
app.use((req, res, next)=> {
  res.locals.success_msg = req.flash('success_msg');
  res.locals.error_msg = req.flash('error_msg');
  res.locals.error = req.flash('error');
  next();
});


//routes
app.use('/', require('./routes/index'));
app.use('/users', require('./routes/users'));
const PORT = process.env.PORT || 5000;
app.listen(PORT, console.log(`Server started on port ${PORT}`));