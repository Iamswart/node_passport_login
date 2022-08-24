const express = require('express');
const router = express.Router();
const User = require('../models/user');
const bcrypt = require('bcryptjs');
const passport = require('passport')

//Login
router.get('/login', (req, res) => res.render('login'));

//register
router.get('/register', (req, res) => res.render('register'));

//register handle
router.post('/register', (req, res) => {
    const {name, email, password, password2} = req.body;
    let errors = [];

    //check required fields
    if (!name || !email || !password || !password2) {
        errors.push({ msg: 'Please fill in all fields'});
    }
    //check password match
    if (password !== password2) {
        errors.push({msg: 'Passwords do not match'});
    }
    //check passwords length
    if(password.length < 6){
        errors.push({ msg: 'Password should be at least 6 characters'});
    }

    if (errors.length > 0) {
        res.render('register', {
            errors,
            name,
            email,
            password,
            password2
        })
    } else{
        //validation passed
        User.findOne({ email: email})
        .then(user => {
            if(user){
                //User exist
                errors.push({ msg: 'Email is already registered'})
                res.render('register', {
                    errors,
                    name,
                    email,
                    password,
                    password2
                })
            } else{
                const newUser = new User({name, email, password});
                //Hash password
                bcrypt.genSalt(10, (err, salt)=> 
                    bcrypt.hash(newUser.password, salt, (err, hash)=> {
                    if (err) throw err;
                    newUser.password = hash;
                    newUser.save()
                        .then(user => {
                            req.flash('success_msg', 'You are now registered and can log in');
                            res.redirect('/users/login');

                        })
                        .catch(err=> console.log(err));
                }))
            }
        });

    }
})

//login handler
router.post('/login', (req, res, next) => {
    passport.authenticate('local', {
        successRedirect: '/dashboard',
        failureRedirect: '/users/login',
        failureFlash: true
    })(req, res, next);
});

// Logout
router.get('/logout', (req, res, next) => {
    req.logout(function (err) {
        if (err) {
          return next(err);
    }
    req.flash('success_msg', 'You are logged out');
    res.redirect('/users/login');
});
})

module.exports = router;