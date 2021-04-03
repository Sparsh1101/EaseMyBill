const Joi = require('joi');
const { number } = require('joi');

module.exports.productSchema = Joi.object({
    product: Joi.object({
        title: Joi.string().required(),
        price: Joi.number().required().min(0),
        company: Joi.string().required(),
        description: Joi.string().required(),
        stock: Joi.number().required().min(0),
        tax: Joi.number().required().min(0),
    }).required()
});

module.exports.customerSchema = Joi.object({
    customer: Joi.object({
        custName: Joi.string().required(),
        custMail: Joi.string(),
        custPhone: Joi.number().required().min(1000000000).max(9999999999),
        
    }).required()
});