const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ProductSchema = new Schema({
    title: String,
    image: {
        url: String,
        filename: String
    },
    price: Number,
    description: String,
    company: String,
    stock: Number,
    tax: Number,
});

module.exports = mongoose.model('Product', ProductSchema);