const { date } = require('joi');
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Bill = require('./bill');

const CustomerSchema = new Schema({
    custName: String,
    custPhone: Number,
    custMail: { type: String, default: '' },
    numOfOrders: Number,
    orders: [{ type: Schema.Types.ObjectId, ref: 'Bill' }]
});

module.exports = mongoose.model('Customer', CustomerSchema);