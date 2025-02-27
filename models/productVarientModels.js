const mongoose = require('mongoose')

const productVarientSchema = mongoose.Schema({
    productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        require: true
    },
    size: {
        type: String,
        require: true
    },
    price: {
        type: Number,
        require: true
    },
    discountPrice: {
        type: Number,
        require: true
    },
    stockStatus: {
        type: Boolean,
        require: true
    }
}, {
    timestamps: true,
    versionKey: false
});

module.exports = mongoose.model('productVarient', productVarientSchema)