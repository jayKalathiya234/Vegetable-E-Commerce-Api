const order = require('../models/orderModels')
const cart = require('../models/cartModels')
const Coupon = require('../models/coupenModels')
const ProductVariant = require('../models/productVarientModels')

exports.createOrder = async (req, res) => {
    try {
        let { items, addressId, coupenId, platFormFee = 10 } = req.body

        items = await cart.find({ userId: req.user._id })

        if (!items) {
            return res.status(404).json({ status: 404, message: "Cart Item Not Found" })
        }

        let coupon;
        if (coupenId) {
            coupon = await Coupon.findById(coupenId);
            if (!coupon) {
                return res.status(404).json({ message: 'Coupon Not Found' });
            }
        }

        let totalAmount = 0;
        for (const item of items) {
            const product = await ProductVariant.findById(item.productVarientId);
            totalAmount += product.price * item.quantity
        }

        if (coupon) {
            if (coupon.coupenType === 'Fixed') {
                totalAmount -= coupon.coupenDiscount;

            } else if (coupon.coupenType === 'Percentage') {
                totalAmount -= (totalAmount * parseFloat(coupon.coupenDiscount) / 100);
            }
        }

        totalAmount += platFormFee

        const orderCreate = await order.create({
            userId: req.user._id,
            addressId,
            items,
            platFormFee,
            coupenId,
            totalAmount
        });

        return res.status(201).json({ status: 201, message: "Order Create SuccessFully....", order: orderCreate })

    } catch (error) {
        console.log(error)
        return res.status(500).json({ status: 500, message: error.message })
    }
}

exports.getAllOrders = async (req, res) => {
    try {
        let page = parseInt(req.query.page)
        let pageSize = parseInt(req.query.pageSize)

        if (page < 1 || pageSize < 1) {
            return res.status(401).json({ status: 401, message: "Page And PageSize Cann't Be Less Than 1" })
        }

        let paginatedOrders;

        paginatedOrders = await order.aggregate([
            {
                $lookup: {
                    from: "users",
                    localField: "userId",
                    foreignField: "_id",
                    as: "userData"
                }
            }
        ])

        let count = paginatedOrders.length

        if (count === 0) {
            return res.status(404).json({ status: 404, message: "Order Not Found" })
        }

        if (page && pageSize) {
            let startIndex = (page - 1) * pageSize
            let lastIndex = (startIndex + pageSize)
            paginatedOrders = await paginatedOrders.slice(startIndex, lastIndex)
        }

        return res.status(200).json({ status: 200, totalOrders: count, message: "All Orders Found SuccessFully...", orders: paginatedOrders })

    } catch (error) {
        console.log(error)
        return res.status(500).json({ status: 500, message: error.message })
    }
}

exports.getOrderById = async (req, res) => {
    try {

    } catch (error) {
        console.log(error)
        return res.status(500).json({ status: 500, message: error.message })
    }
}