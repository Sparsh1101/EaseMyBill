const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ProductSchema = new Schema({
    title: String,
    price: Number,
    description: String,
    company: String,
    stock: Number,
    tax: Number,
});

module.exports = mongoose.model('Product', ProductSchema);