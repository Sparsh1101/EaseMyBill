const express = require('express');
const router = express.Router();
const passport = require('passport');
const catchAsync = require('../utils/catchAsync');
const User = require('../models/user');
const { isLoggedIn } = require('../middleware');

router.get('/register', (req, res) => {
    res.render('users/register');
});

router.post('/register', catchAsync(async (req, res, next) => {
    try {
        const { email, username, password } = req.body;
        const user = new User({ email, username });
        user.invoiceCount = 0;
        const registeredUser = await User.register(user, password);
        req.login(registeredUser, err => {
            if (err) return next(err);
            req.flash('success', 'Welcome to Ease My Bill!');
            res.redirect('/products');
        })
    } catch (e) {
        req.flash('error', e.message);
        res.redirect('register');
    }
}));

router.get('/login', (req, res) => {
    res.render('users/login');
})

router.post('/login', passport.authenticate('local', { failureFlash: true, failureRedirect: '/login' }), (req, res) => {
    req.flash('success', 'welcome back!');
    const redirectUrl = req.session.returnTo || '/products';
    delete req.session.returnTo;
    res.redirect(redirectUrl);
})

router.get('/logout', (req, res) => {
    req.logout();
    req.flash('success', "Goodbye!");
    res.redirect('/products');
})

router.get('/profile', isLoggedIn, (req,res) =>{
    res.render('users/profile');
});

router.get('/profile/edit', isLoggedIn, (req,res) =>{
    res.render('users/editProfile');
});

router.put('/profile', isLoggedIn, catchAsync(async(req,res) =>{
    const {companyname,panNo,gstNo,address} = req.body;
    await User.findByIdAndUpdate(req.user._id,{companyname,panNo,gstNo,address});
    req.flash('success', 'Successfully updated your profile!');
    res.redirect('/profile');
}));
module.exports = router;