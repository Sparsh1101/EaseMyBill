const express = require('express');
const router = express.Router();
const catchAsync = require('../utils/catchAsync');
const { isLoggedIn } = require('../middleware');
const bills = require('../controllers/bills.js')

router.get('/', isLoggedIn, catchAsync(bills.allBills));

router.route('/:id')
    .get(isLoggedIn, catchAsync(bills.showBill))
    .post(isLoggedIn, catchAsync(bills.finishBill));

router.get('/:id/pdf', isLoggedIn, catchAsync(bills.createPDF));

router.get('/:id/mail', isLoggedIn, catchAsync(bills.sendMail));

router.delete('/:custid/:billid', isLoggedIn, catchAsync(bills.deleteBill));

module.exports = router;