const express = require('express');
const router = express.Router();
const catchAsync = require('../utils/catchAsync');
const { productSchema } = require('../schemas.js');
const { isLoggedIn } = require('../middleware');

const multer = require('multer');
const { storage } = require('../cloudinary');
const upload = multer({ storage });

const ExpressError = require('../utils/ExpressError');
const products = require('../controllers/products');

const validateProduct = (req, res, next) => {
    const { error } = productSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(',')
        throw new ExpressError(msg, 400)
    } else {
        next();
    }
}

router.route('/')
    .get(catchAsync(products.allProducts))
    .post(isLoggedIn, upload.array('image'), validateProduct, catchAsync(products.createNewProduct));

router.get('/new', isLoggedIn, products.renderNewProductsForm);

router.get('/autocomplete', products.autocompleteProduct);

router.get('/search', catchAsync(products.searchProduct));

router.route('/:id')
    .get(catchAsync(products.showProduct))
    .put(isLoggedIn, upload.array('image'), validateProduct, catchAsync(products.updateProduct))
    .delete(isLoggedIn, catchAsync(products.deleteProduct));

router.get('/:id/edit', isLoggedIn, catchAsync(products.renderEditProductsForm));

module.exports = router;