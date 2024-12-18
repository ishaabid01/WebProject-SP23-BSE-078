const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema({
    orderID: { type: String, required: true, unique: true },
    customerInfo: {
        name: String,
        street: String,
        city: String,
        postalCode: String
    },
    items: [
        {
            name: String,
            price: Number,
            quantity: Number
        }
    ],
    totalAmount: Number,
    orderDate: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Order', OrderSchema);
