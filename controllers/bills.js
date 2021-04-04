const templateToPdf = require('html-template-pdf');
const nodemailer = require('nodemailer');

const Customer = require('../models/customer');
const User = require('../models/user');
const Bill = require('../models/bill');

module.exports.allBills = async (req, res) => {
    const bills = await Bill.find({});
    res.render('bills/index', { bills });
};

module.exports.finishBill = async (req, res) => {
    const bill = await Bill.findById(req.params.id);
    const customer = await Customer.findById(bill.customerId._id);
    customer.numOfOrders += 1;
    const today = new Date();
    const date = today.getDate()+'/'+(today.getMonth()+1)+'/'+today.getFullYear();
    const time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
    const dateTime = date+' '+time;
    bill.orderDate = dateTime;
    await bill.save();
    await customer.save();
    res.redirect(`/bills/${bill._id}`);
};

module.exports.showBill = async (req, res) => {
    const id = req.params.id;
    const bill = await Bill.findById(id);
    res.render('bills/show', { bill });
};

module.exports.createPDF = async(req,res) => {
    const { id } = req.params;
    const user = await User.findById(req.user._id);
    user.invoiceCount += 1;
    await user.save();
    const bill = await Bill.findById(id).populate('customer');
    const options = {
        templateOptions: {
            template: 
            `
            <link rel="preconnect" href="https://fonts.gstatic.com">
            <link href="https://fonts.googleapis.com/css2?family=Lobster&family=Merienda:wght@400;700&display=swap"
            rel="stylesheet">
            <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.0.0-beta2/dist/css/bootstrap.min.css" rel="stylesheet"
            integrity="sha384-BmbxuPwQa2lc/FVzBcNJ7UAyJxM6wuqIj61tLrc4wSX0szH/Ev+nYRRuWlolflfl" crossorigin="anonymous">
            <link rel="stylesheet" type="text/css"
            href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.14.0/css/all.min.css">
            <div style="background-color: white; padding: 40px; margin-bottom: 20px; font-family: 'Merienda', cursive;">
                <div>
                    <p style="font-family: 'Lobster', cursive; font-size: 30px;"><span style="color: rgb(255, 104, 49);">Ease</span>MyBill</p>
                    <div style="position: absolute; top: 40px; right: 40px;">
                        <p style="margin-bottom: 0;"><b>Tax Invoice/Bill of Supply/Cash Memo</b></p>
                        <p>(Original for Recipient)</p>
                    </div>
                </div>
                <div class="d-flex" style="justify-content: space-between; margin-top: 30px;">
                    <div style="width: 450px;">
                        <% if (currentUser.companyname) { %>
                            <p style="margin-bottom: 5px; text-transform: uppercase;"><b>Sold By: </b><%= currentUser.companyname %></p>
                        <% } %>
                        <% if (currentUser.address) { %>
                            <p style="margin-bottom: 30px; text-transform: uppercase; width: 280px;"><%= currentUser.address %></p>
                        <% } %> 
                        <% if (currentUser.panNo) { %>
                            <p style="margin-bottom: 0;"><b>PAN NO: </b><%= currentUser.panNo %></p>
                        <% } %> 
                        <% if (currentUser.gstNo) { %>
                            <p style="margin-bottom: 30px;"><b>GST REGISTRATION NO: </b><%= currentUser.gstNo %></p>
                        <% } %> 
                        <p style="margin-bottom: 0;"><b>Order Number: </b><%= bill._id%></p>
                        <p style="margin-bottom: 30px;"><b>Order Date: </b><%= bill.orderDate %></p>
                    </div>
                    <div style="position: absolute; top: 120px; right: 40px;">
                        <p style="margin-bottom:5px; text-transform: capitalize;"><b>Customer Name: </b><%= bill.customer.custName%></p>
                        <p style="margin-bottom: 5px;"><b>Phone Number: </b><%= bill.customer.custPhone%></p>
                        <% if (bill.customer.custMail != '') { %>
                            <p style="margin-bottom: 5px;"><b>Email Id: </b><%= bill.customer.custMail %></p>
                        <% } %>
                    </div>
                </div>
                <table class="table table-striped mt-5" style="border:solid 1px black; width:100%;">
                    <tr style="background-color: rgb(75, 78, 83);">
                        <th style="border:1px solid black; text-align: center;color: white;">Product Name</th>
                        <th style="border:1px solid black; text-align: center;color: white;">Product Price</th>
                        <th style="border:1px solid black; text-align: center;color: white;">Quantity</th>
                        <th style="border:1px solid black; text-align: center;color: white;">Net Amount</th>
                        <th style="border:1px solid black; text-align: center;color: white;">Tax Rate</th>
                        <th style="border:1px solid black; text-align: center;color: white;">Tax Amount</th>
                        <th style="border:1px solid black; text-align: center;color: white;">Total Amount</th>
                    </tr> 
                    <% for(let i of bill.billProducts ) { %>
                        <tr>
                            <td style="border:1px solid black; text-align: center; text-transform: capitalize;"><%= i.productName %></td>
                            <td style="border:1px solid black; text-align: center;">₹ <%= i.productPrice %></td>
                            <td style="border:1px solid black; text-align: center;"><%= i.quantity %></td>
                            <td style="border:1px solid black; text-align: center;">₹ <%= i.totalProductPrice %></td>
                            <td style="border:1px solid black; text-align: center;"><%= i.tax %>%</td>
                            <td style="border:1px solid black; text-align: center;">₹ <%= (i.totalProductPrice*i.tax)/100 %></td>
                            <td style="border:1px solid black; text-align: center;">₹ <%= i.totalProductPrice+((i.totalProductPrice*i.tax)/100) %></td>
                        </tr>
                    <% } %>
                    <tr style="background-color: rgb(75, 78, 83);">
                        <td colspan="7" style="text-align: right; color: white;"><b>Grand Total: ₹ <%= bill.billPrice %></b></td>
                    </tr> 
                </table>
            </div>
            `,
            templateData: { currentUser: req.user, bill }, 
            templateType: 'ejs',
        },
        fileName: 'invoice.pdf', 
        filePath: './Invoice/' + req.user.username + '(' + req.user.invoiceCount + ')/',
      }
       
    templateToPdf(options)
        .then(function(resp){
          console.log(resp);
        })
        .catch(function(err){
          console.log(err);
        });

    req.flash('success', 'Successfully downloaded Invoice PDF');
    res.redirect(`/bills/${id}`);
};

module.exports.sendMail = async(req,res) => {

    const { id } = req.params;
    const bill = await Bill.findById(id).populate('customer');

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'codefellas1234@gmail.com',
        pass: 'codefellas@123'
      }
    });
    
    const mailOptions = {
      from: 'codefellas1234@gmail.com',
      to: bill.customer.custMail,
      subject: `Order Number: ${bill._id}`,
      text: `Here is your invoice dated: ${bill.orderDate}`,
      attachments: [
          { filename: 'invoice.pdf', path: `./Invoice/${req.user.username}(${req.user.invoiceCount-1})/invoice.pdf` }
      ]
    };
    
    transporter.sendMail(mailOptions, function(error, info){
      if (error) {
        console.log(error);
      } else {
        console.log('Email sent: ' + info.response);
      }
    });

    req.flash('success', 'Successfully sent Mail');
    res.redirect(`/bills/${id}`);
};

module.exports.deleteBill = async (req, res) => {
    const { custid, billid } = req.params;
    await Customer.findByIdAndUpdate(custid, { $pull: { orders: billid } });
    await Bill.findByIdAndDelete(billid);
    const customer = await Customer.findById(custid);
    customer.numOfOrders -= 1;
    await customer.save();
    req.flash('success', 'Successfully deleted Order!')
    res.redirect('/bills');
}