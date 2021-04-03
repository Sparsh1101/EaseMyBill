const express = require('express');
const router = express.Router();
const catchAsync = require('../utils/catchAsync');
const { productSchema } = require('../schemas.js');
const { isLoggedIn } = require('../middleware');

const multer = require('multer');
const { storage } = require('../cloudinary');
const upload = multer({ storage });

const ExpressError = require('../utils/ExpressError');
const Product = require('../models/product');

const validateProduct = (req, res, next) => {
    const { error } = productSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(',')
        throw new ExpressError(msg, 400)
    } else {
        next();
    }
}

router.get('/', catchAsync(async (req, res) => {
    const products = await Product.find({});
    res.render('products/index', { products })
}));

router.get('/new', isLoggedIn, (req, res) => {
    res.render('products/new');
})


router.post('/', isLoggedIn, upload.array('image'), validateProduct, catchAsync(async (req, res, next) => {
    var { title, image, price, description, company, stock, tax } = req.body.product;
    title = title.toLowerCase();
    const product = new Product({ title, price, description, company, stock, tax });
    product.image = {url: req.files[0].path, filename: req.files[0].filename};
    await product.save();
    req.flash('success', 'Successfully made a new product!');
    res.redirect(`/products/${product._id}`)
}))

router.get('/:id', catchAsync(async (req, res,) => {
    const product = await Product.findById(req.params.id);
    if (!product) {
        req.flash('error', 'Cannot find that product!');
        return res.redirect('/products');
    }
    res.render('products/show', { product });
}));

router.get('/:id/edit', isLoggedIn, catchAsync(async (req, res) => {
    const product = await Product.findById(req.params.id)
    if (!product) {
        req.flash('error', 'Cannot find that product!');
        return res.redirect('/products');
    }
    res.render('products/edit', { product });
}))

router.put('/:id', isLoggedIn, upload.array('image'), validateProduct, catchAsync(async (req, res) => {
    const { id } = req.params;
    const product = await Product.findByIdAndUpdate(id, { ...req.body.product });
    console.log(req.files)
    if (req.files.length > 0) {
        product.image = {url: req.files[0].path, filename: req.files[0].filename};
        await product.save();
    }
    req.flash('success', 'Successfully updated product!');
    res.redirect(`/products/${product._id}`)
}));

router.delete('/:id', isLoggedIn, catchAsync(async (req, res) => {
    const { id } = req.params;
    await Product.findByIdAndDelete(id);
    req.flash('success', 'Successfully deleted product')
    res.redirect('/products');
}));

module.exports = router;