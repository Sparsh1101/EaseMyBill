const User = require('../models/user');

module.exports.renderRegisterForm = (req, res) => {
    res.render('users/register');
};

module.exports.registerUser = async (req, res, next) => {
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
};

module.exports.renderLoginForm = (req, res) => {
    res.render('users/login');
};

module.exports.loginUser = (req, res) => {
    req.flash('success', 'welcome back!');
    const redirectUrl = req.session.returnTo || '/products';
    delete req.session.returnTo;
    res.redirect(redirectUrl);
};

module.exports.logoutUser = (req, res) => {
    req.logout();
    req.flash('success', "Goodbye!");
    res.redirect('/products');
};

module.exports.showProfile = (req,res) =>{
    res.render('users/profile');
};

module.exports.renderEditProfileForm = (req,res) =>{
    res.render('users/editProfile');
};

module.exports.editProfile = async(req,res) =>{
    const {companyname,panNo,gstNo,address} = req.body;
    await User.findByIdAndUpdate(req.user._id,{companyname,panNo,gstNo,address});
    req.flash('success', 'Successfully updated your profile!');
    res.redirect('/profile');
};