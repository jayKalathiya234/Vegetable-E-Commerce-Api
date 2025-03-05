const mongoose = require('mongoose')

const paymentSchema = mongoose.Schema({
    orderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'orders',
        required: true
    },
    paymentMethod: {
        type: String,
        enum: ['Cod', 'Card', 'Upi', 'Net Banking'],
        required: true
    },
    paymentStatus: {
        type: String,
        enum: ['Success', 'Failed'],
        default: 'Success',
        required: true
    }
}, {
    timestamps: true,
    versionKey: false
});

module.exports = mongoose.model('payment', paymentSchema)