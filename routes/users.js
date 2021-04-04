const express = require('express');
const router = express.Router();
const passport = require('passport');
const catchAsync = require('../utils/catchAsync');
const { isLoggedIn } = require('../middleware');
const users = require('../controllers/users.js')

router.route('/register')
    .get(users.renderRegisterForm)
    .post(catchAsync(users.registerUser));

router.route('/login')
    .get(users.renderLoginForm)
    .post(passport.authenticate('local', { failureFlash: true, failureRedirect: '/login' }), users.loginUser);

router.get('/logout', users.logoutUser);

router.route('/profile')
    .get(isLoggedIn, users.showProfile)
    .put(isLoggedIn, catchAsync(users.editProfile));

router.get('/profile/edit', isLoggedIn, users.renderEditProfileForm);

module.exports = router;