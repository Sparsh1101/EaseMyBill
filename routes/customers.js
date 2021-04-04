const express = require('express');
const router = express.Router();
const catchAsync = require('../utils/catchAsync');
const { customerSchema } = require('../schemas.js');
const { isLoggedIn } = require('../middleware');
const ExpressError = require('../utils/ExpressError');
const customers = require('../controllers/customers.js')

const validateCustomer = (req, res, next) => {
    const { error } = customerSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(',')
        throw new ExpressError(msg, 400)
    } else {
        next();
    }
}

router.route('/')
    .get(isLoggedIn, catchAsync(customers.allCustomers))
    .post(isLoggedIn, validateCustomer, catchAsync(customers.createNewCustomer));

router.get('/new', isLoggedIn, customers.renderNewCustomersForm);

router.get('/autocomplete', isLoggedIn, customers.autocompleteCustomer);

router.get('/search', isLoggedIn, catchAsync(customers.searchCustomer));

router.get('/bill/:custid/customers/autocompleteProduct', isLoggedIn, customers.autocompleteProduct);

router.get('/bill/addCustomer', isLoggedIn, customers.renderAddCustomerForBillForm);

router.post('/bill', isLoggedIn, validateCustomer, catchAsync(customers.createNewCustomerForBill));

router.route('/bill/:custid/createBill')
    .get(isLoggedIn, catchAsync(customers.renderUpdatedCreateBillForm))
    .post(isLoggedIn, catchAsync(customers.createBill));

router.get('/bill/:custid/newBill', isLoggedIn, catchAsync(customers.renderCreateBillForm));

router.get('/bill/:custid/addItem', isLoggedIn, customers.renderAddItemForm);

router.route('/:id')
    .get(isLoggedIn, catchAsync(customers.showCustomer))
    .put(isLoggedIn, validateCustomer, catchAsync(customers.updateCustomer))
    .delete(isLoggedIn, catchAsync(customers.deleteCustomer));

router.get('/:id/edit', isLoggedIn, catchAsync(customers.renderEditCustomersForm));

module.exports = router;