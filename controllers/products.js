const Product = require('../models/product');

module.exports.allProducts = async (req, res) => {
    const products = await Product.find({});
    const searchTitle = '';
    res.render('products/index', { searchTitle, products })
};

module.exports.renderNewProductsForm = (req, res) => {
    res.render('products/new');
};

module.exports.createNewProduct = async (req, res, next) => {
    var { title, image, price, description, company, stock, tax } = req.body.product;
    title = title.toLowerCase();
    const product = new Product({ title, price, description, company, stock, tax });
    product.image = {url: req.files[0].path, filename: req.files[0].filename};
    await product.save();
    req.flash('success', 'Successfully made a new product!');
    res.redirect(`/products/${product._id}`)
};

module.exports.showProduct = async (req, res,) => {
    const product = await Product.findById(req.params.id);
    if (!product) {
        req.flash('error', 'Cannot find that product!');
        return res.redirect('/products');
    }
    res.render('products/show', { product });
};

module.exports.renderEditProductsForm = async (req, res) => {
    const product = await Product.findById(req.params.id)
    if (!product) {
        req.flash('error', 'Cannot find that product!');
        return res.redirect('/products');
    }
    res.render('products/edit', { product });
};

module.exports.updateProduct = async (req, res) => {
    const { id } = req.params;
    const product = await Product.findByIdAndUpdate(id, { ...req.body.product });
    if (req.files.length > 0) {
        product.image = {url: req.files[0].path, filename: req.files[0].filename};
        await product.save();
    }
    req.flash('success', 'Successfully updated product!');
    res.redirect(`/products/${product._id}`)
};

module.exports.deleteProduct = async (req, res) => {
    const { id } = req.params;
    await Product.findByIdAndDelete(id);
    req.flash('success', 'Successfully deleted product')
    res.redirect('/products');
};

module.exports.autocompleteProduct = (req, res) => {
    var regex = new RegExp(req.query["term"], 'i');
    var productFilter = Product.find({title: regex}, {'title': 1}).sort({"updated_at": -1}).sort({"created_at": -1}).limit(10);
    productFilter.exec(function(err, data) {
        var result = [];
        if(!err) {
            if(data && data.length && data.length > 0) {
                data.forEach(product => {
                    let obj = {
                        id:  product._id,
                        label: product.title
                    };
                    result.push(obj);
                });
            }
            res.jsonp(result);
        }
    })
};

module.exports.searchProduct = async (req, res) => {
    var searchTitle = req.query.search;
    searchTitle = searchTitle.toLowerCase();
    const products = await Product.find({ 'title' : { '$regex' : searchTitle, '$options' : 'i' } });
    res.render('products/index', { searchTitle, products });
};