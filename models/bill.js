const { date } = require('joi');
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Customer = require('./customer');

const BillSchema = new Schema({
    billProducts: [
        {
            productName: {
                type: String,
                required: true
            },
            productPrice: {
                type: Number,
                required: true
            },
            quantity: {
                type: Number,
                required: true,
                min: [1, 'Quantity cannot be less than 1'],
            },
            totalProductPrice: {
                type: Number,
                required: true
            },
            tax:{
                type: Number,
                required: true
            }
        }
    ],
    billPrice: {
        type: Number,
        required: true
    },
    customerId: { 
        type: Schema.Types.ObjectId, 
        ref: 'Customer'
    },
    customer: { 
        custName: {
            type: String,
            required: true
        },
        custPhone: {
            type: String,
            required: true
        },
        custMail: { 
            type: String, 
            default: '' 
        }
    },
    orderDate: {
        type: String,
    }
});

module.exports = mongoose.model('Bill', BillSchema);