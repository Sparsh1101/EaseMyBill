const Customer = require('../models/customer');
const Bill = require('../models/bill');
const Product = require('../models/product');

module.exports.allCustomers = async (req, res) => {
    const customers = await Customer.find({});
    const searchCustName = '';
    res.render('customers/index', { searchCustName, customers });
};

module.exports.createNewCustomer = async (req, res) => {
    const { custName, custPhone, custMail } = req.body.customer;
    const foundCustomer = await Customer.findOne({ custPhone: custPhone });
    if (!foundCustomer) {
        const customer = new Customer({ custName, custPhone, custMail });
        customer.numOfOrders = 0;
        await customer.save();
        req.flash('success', 'Successfully made a new Customer!');
        res.redirect(`/customers/${customer._id}`);
    } else {
        req.flash('error', 'Customer already exists!');
        res.redirect(`/customers/${foundCustomer._id}`);
    }
};

module.exports.renderNewCustomersForm = (req, res) => {
    res.render('customers/new');
};

module.exports.renderAddCustomerForBillForm = (req, res) => {
    res.render('customers/addCustomer');
}

module.exports.createNewCustomerForBill = async (req, res) => {    
    const { custName, custPhone, custMail } = req.body.customer;
    const foundCustomer = await Customer.findOne({ custPhone: custPhone });
    if (!foundCustomer) {
        const customer = new Customer({ custName, custPhone, custMail });
        customer.numOfOrders = 0;
        await customer.save();
        req.flash('success', 'Successfully made a new Customer!');
        res.redirect(`/customers/bill/${customer._id}/newBill`);
    } else {
        req.flash('error', 'Customer already exists!');
        res.redirect(`/customers/bill/${foundCustomer._id}/newBill`);
    }
};

module.exports.createBill = async (req, res) => {
    const customer = await Customer.findById(req.params.custid).populate('orders');
    var { productName, qty } = req.body.product;
    productName = productName.toLowerCase();
    const foundProduct = await Product.findOne({ title: productName })
    if (!foundProduct){
        req.flash('error', 'Product not found!');
        return res.redirect(`/customers/bill/${customer._id}/addItem`);
    }
    const { title, price,stock,tax } = foundProduct;
    if (qty <= stock){
        foundProduct.stock -= qty;
        await foundProduct.save();
        if (customer.numOfOrders == customer.orders.length) {
            const bill = new Bill();
            bill.billProducts.push({
                productName: title,
                productPrice: price,
                quantity: qty,
                totalProductPrice: price*qty,
                tax:tax,
            });
            bill.billPrice = ((price*qty*tax)/100 + price*qty).toFixed(2);
            customer.orders.push(bill);
            bill.customerId = customer;
            bill.customer.custName = customer.custName;
            bill.customer.custPhone = customer.custPhone;
            bill.customer.custMail = customer.custMail;
            await customer.save();
            await bill.save();
        } else {
            const bill = customer.orders[customer.orders.length - 1]
            bill.billProducts.push({
                productName: title,
                productPrice: price,
                quantity: qty,
                totalProductPrice: price*qty,
                tax:tax,
            });
            bill.billPrice = (bill.billPrice + (price*qty*tax)/100 + price*qty).toFixed(2) ;
            await bill.save();
        }
        res.redirect(`/customers/bill/${customer._id}/createBill`);
    }
    else{
        req.flash('error', 'Product quantity exceeds stock!');
        res.redirect(`/customers/bill/${customer._id}/addItem`);
    }
};

module.exports.renderCreateBillForm = async (req, res) => {
    const customer = await Customer.findById(req.params.custid);
    res.render('customers/newBill', { customer });
};

module.exports.renderUpdatedCreateBillForm = async (req, res) => {
    const customer = await Customer.findById(req.params.custid).populate('orders');
    res.render('customers/createBill', { customer });
};

module.exports.renderAddItemForm = (req, res) => {
    const { custid } = req.params;
    res.render('customers/addItem', { custid });
};

module.exports.showCustomer = async (req, res) => {
    const customer = await Customer.findById(req.params.id).populate('orders');
    res.render('customers/show', { customer });
};

module.exports.renderEditCustomersForm = async (req, res) => {
    const customer = await Customer.findById(req.params.id);
    res.render('customers/edit', { customer });
};

module.exports.updateCustomer = async (req, res) => {
    const { id } = req.params;
    const customer = await Customer.findByIdAndUpdate(id, { ...req.body.customer });
    await customer.save();
    const bills = await Bill.find({ customerId: { _id: id } }).populate('customerId');
    for (let bill of bills) {
        bill.customer.custName = req.body.customer.custName;
        bill.customer.custPhone = req.body.customer.custPhone;
        bill.customer.custMail = req.body.customer.custMail;
        await bill.save();
    }
    req.flash('success', 'Successfully updated Customer!');
    res.redirect(`/customers/${customer._id}`)
};

module.exports.deleteCustomer = async (req, res) => {
    const { id } = req.params;
    await Customer.findByIdAndDelete(id);
    req.flash('success', 'Successfully deleted Customer')
    res.redirect('/customers');
};

module.exports.autocompleteCustomer = (req, res) => {
    var regex = new RegExp(req.query["term"], 'i');
    var customerFilter = Customer.find({custName: regex}, {'custName': 1}).sort({"updated_at": -1}).sort({"created_at": -1}).limit(10);
    customerFilter.exec(function(err, data) {
        var result = [];
        if(!err) {
            if(data && data.length && data.length > 0) {
                data.forEach(customer => {
                    let obj = {
                        id:  customer._id,
                        label: customer.custName
                    };
                    result.push(obj);
                });
            }
            res.jsonp(result);
        }
    })
};

module.exports.searchCustomer = async (req, res) => {
    var searchCustName = req.query.search;
    searchCustName = searchCustName.toLowerCase();
    const customers = await Customer.find({ 'custName' : { '$regex' : searchCustName, '$options' : 'i' } });
    res.render('customers/index', { searchCustName, customers });
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