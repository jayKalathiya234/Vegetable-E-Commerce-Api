const Payment = require('../models/paymentmodels')
const Order = require('../models/orderModels')

const getDateRange = (timeframe, year, month) => {
    const currentDate = new Date();
    let startDate, endDate;

    if (!timeframe) {
        const currentYear = year || currentDate.getFullYear();
        const currentMonth = month || (currentDate.getMonth() + 1);
        startDate = new Date(currentYear, currentMonth - 1, 1);
        endDate = new Date(currentYear, currentMonth, 0);
        return { startDate, endDate };
    }

    switch (timeframe) {
        case 'week':
            startDate = new Date(currentDate);
            startDate.setDate(currentDate.getDate() - 7);
            endDate = new Date(currentDate);
            break;
        case 'month':
            if (year && month) {
                startDate = new Date(year, month - 1, 1);
                endDate = new Date(year, month, 0);
            } else {
                startDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
                endDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
            }
            break;
        case 'year':
            const selectedYear = year || currentDate.getFullYear();
            startDate = new Date(selectedYear, 0, 1);
            endDate = new Date(selectedYear, 11, 31, 23, 59, 59);
            break;
        default:
            startDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
            endDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
    }
    return { startDate, endDate };
};


const fillMissingDates = (revenueData, startDate, endDate, timeframe) => {
    const filledData = [];
    const dateMap = {};

    revenueData.forEach(item => {
        dateMap[item.date] = item;
    });

    let currentDate = new Date(startDate);

    while (currentDate <= endDate) {
        let dateKey;

        if (timeframe === 'year') {
            const year = currentDate.getFullYear();
            const month = String(currentDate.getMonth() + 1).padStart(2, '0');
            dateKey = `${year}-${month}`;

            currentDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1);
        } else {
            const year = currentDate.getFullYear();
            const month = String(currentDate.getMonth() + 1).padStart(2, '0');
            const day = String(currentDate.getDate()).padStart(2, '0');
            dateKey = `${year}-${month}-${day}`;

            currentDate = new Date(currentDate);
            currentDate.setDate(currentDate.getDate() + 1);
        }

        if (dateMap[dateKey]) {
            filledData.push(dateMap[dateKey]);
        } else {
            filledData.push({
                date: dateKey,
                revenue: 0,
                count: 0
            });
        }
    }

    return filledData;
};

exports.GetPaymentSummary = async (req, res) => {
    try {
        const totalPayments = await Payment.aggregate([
            { $match: { paymentStatus: 'Success' } },
            {
                $lookup: {
                    from: 'orders',
                    localField: 'orderId',
                    foreignField: '_id',
                    as: 'order'
                }
            },
            { $unwind: '$order' },
            {
                $group: {
                    _id: null,
                    totalAmount: { $sum: '$order.totalAmount' },
                    count: { $sum: 1 }
                }
            }
        ]);

        const onlinePayments = await Payment.aggregate([
            {
                $match: {
                    paymentStatus: 'Success',
                    paymentMethod: { $in: ['Card', 'Upi', 'Net Banking'] }
                }
            },
            {
                $lookup: {
                    from: 'orders',
                    localField: 'orderId',
                    foreignField: '_id',
                    as: 'order'
                }
            },
            { $unwind: '$order' },
            {
                $group: {
                    _id: null,
                    totalAmount: { $sum: '$order.totalAmount' },
                    count: { $sum: 1 }
                }
            }
        ]);

        const codPayments = await Payment.aggregate([
            {
                $match: {
                    paymentStatus: 'Success',
                    paymentMethod: 'Cod'
                }
            },
            {
                $lookup: {
                    from: 'orders',
                    localField: 'orderId',
                    foreignField: '_id',
                    as: 'order'
                }
            },
            { $unwind: '$order' },
            {
                $group: {
                    _id: null,
                    totalAmount: { $sum: '$order.totalAmount' },
                    count: { $sum: 1 }
                }
            }
        ]);

        const pendingPayments = await Order.aggregate([
            {
                $match: {
                    orderStatus: { $in: ['Pending', 'Processing'] }
                }
            },
            {
                $group: {
                    _id: null,
                    totalAmount: { $sum: '$totalAmount' },
                    count: { $sum: 1 }
                }
            }
        ]);

        return res.json({
            status: 200,
            totalEarnings: {
                amount: totalPayments[0]?.totalAmount || 0,
            },
            onlinePayment: {
                amount: onlinePayments[0]?.totalAmount || 0,
            },
            codPayment: {
                amount: codPayments[0]?.totalAmount || 0,
            },
            pendingPayments: {
                amount: pendingPayments[0]?.totalAmount || 0,
            }
        });

    } catch (error) {
        console.log(error)
        return res.status(500).json({ status: 500, message: error.message })
    }
}

exports.GetPaymentDistribution = async (req, res) => {
    try {
        const distribution = await Payment.aggregate([
            { $match: { paymentStatus: 'Success' } },
            {
                $lookup: {
                    from: 'orders',
                    localField: 'orderId',
                    foreignField: '_id',
                    as: 'order'
                }
            },
            { $unwind: '$order' },
            {
                $group: {
                    _id: '$paymentMethod',
                    totalAmount: { $sum: '$order.totalAmount' },
                    count: { $sum: 1 }
                }
            },
            {
                $project: {
                    method: '$_id',
                    amount: '$totalAmount',
                    count: 1,
                    _id: 0
                }
            }
        ]);

        const total = distribution.reduce((acc, curr) => acc + curr.amount, 0);

        const formattedDistribution = distribution.map(item => ({
            method: item.method,
            amount: item.amount
        }));

        return res.json({ status: 200, distribution: formattedDistribution, total });

    } catch (error) {
        console.log(error)
        return res.status(500).json({ status: 500, message: error.message })
    }
}

exports.getPaymentComparison = async (req, res) => {
    try {
        const { timeframe, year, month } = req.query;

        const { startDate, endDate } = getDateRange(timeframe, year, month);

        const receivedPayments = await Payment.aggregate([
            {
                $match: {
                    paymentStatus: 'Success',
                    createdAt: {
                        $gte: startDate,
                        $lte: endDate
                    }
                }
            },
            {
                $lookup: {
                    from: 'orders',
                    localField: 'orderId',
                    foreignField: '_id',
                    as: 'order'
                }
            },
            { $unwind: '$order' },
            {
                $group: {
                    _id: { $month: '$createdAt' },
                    amount: { $sum: '$order.totalAmount' }
                }
            },
            {
                $project: {
                    month: '$_id',
                    amount: 1,
                    _id: 0
                }
            },
            { $sort: { month: 1 } }
        ]);

        const pendingPayments = await Order.aggregate([
            {
                $match: {
                    orderStatus: { $in: ['Pending', 'Processing'] },
                    createdAt: {
                        $gte: startDate,
                        $lte: endDate
                    }
                }
            },
            {
                $group: {
                    _id: { $month: '$createdAt' },
                    amount: { $sum: '$totalAmount' }
                }
            },
            {
                $project: {
                    month: '$_id',
                    amount: 1,
                    _id: 0
                }
            },
            { $sort: { month: 1 } }
        ]);

        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

        const formattedData = months.map((month, index) => {
            const monthNumber = index + 1;
            const received = receivedPayments.find(p => p.month === monthNumber)?.amount || 0;
            const pending = pendingPayments.find(p => p.month === monthNumber)?.amount || 0;

            return {
                month,
                received,
                pending
            };
        });

        return res.status(200).json({ status: 200, data: formattedData });

    } catch (error) {
        console.log(error);
        return res.status(500).json({ status: 500, message: error.message });
    }
}

exports.getRecentOrders = async (req, res) => {
    try {
        const recentOrders = await Order.aggregate([
            { $sort: { createdAt: -1 } },

            { $limit: 10 },

            {
                $lookup: {
                    from: 'users',
                    localField: 'userId',
                    foreignField: '_id',
                    as: 'user'
                }
            },
            { $unwind: { path: '$user', preserveNullAndEmptyArrays: true } },

            {
                $lookup: {
                    from: 'payments',
                    localField: '_id',
                    foreignField: 'orderId',
                    as: 'payment'
                }
            },
            { $unwind: { path: '$payment', preserveNullAndEmptyArrays: true } },

            {
                $project: {
                    customerName: {
                        $concat: [
                            { $ifNull: ['$user.firstName', ''] },
                            ' ',
                            { $ifNull: ['$user.lastName', ''] }
                        ]
                    },
                    payment: {
                        $cond: [
                            { $eq: ['$payment.paymentMethod', 'Cod'] },
                            'COD',
                            {
                                $cond: [
                                    { $eq: ['$payment.paymentMethod', 'Card'] },
                                    {
                                        $cond: [
                                            { $eq: ['$paymentStatus', 'Received'] },
                                            'Credit Card',
                                            'Debit Card'
                                        ]
                                    },
                                    {
                                        $cond: [
                                            {
                                                $and: [
                                                    { $ne: ['$payment', null] },
                                                    { $eq: ['$payment.paymentStatus', 'Success'] }
                                                ]
                                            },
                                            'Paid',
                                            'Unknown'
                                        ]
                                    }
                                ]
                            }
                        ]
                    },
                    amount: { $toString: "$totalAmount" },
                    orderStatus: '$orderStatus'
                }
            }
        ]);

        const formattedOrders = recentOrders.map(order => ({
            ...order,
            amount: order.amount
        }));

        return res.status(200).json({ status: 200, data: formattedOrders });

    } catch (error) {
        console.log(error);
        return res.status(500).json({ status: 500, message: error.messageF });
    }
};

exports.getTransactionDetails = async (req, res) => {
    try {
        const recentOrders = await Order.aggregate([
            { $sort: { createdAt: -1 } },

            { $limit: 10 },

            {
                $lookup: {
                    from: 'users',
                    localField: 'userId',
                    foreignField: '_id',
                    as: 'user'
                }
            },
            { $unwind: { path: '$user', preserveNullAndEmptyArrays: true } },

            {
                $lookup: {
                    from: 'payments',
                    localField: '_id',
                    foreignField: 'orderId',
                    as: 'payment'
                }
            },
            { $unwind: { path: '$payment', preserveNullAndEmptyArrays: true } },

            {
                $project: {
                    customerName: {
                        $concat: [
                            { $ifNull: ['$user.firstName', ''] },
                            ' ',
                            { $ifNull: ['$user.lastName', ''] }
                        ]
                    },
                    payment: {
                        $cond: [
                            { $eq: ['$payment.paymentMethod', 'Cod'] },
                            'COD',
                            {
                                $cond: [
                                    { $eq: ['$payment.paymentMethod', 'Card'] },
                                    {
                                        $cond: [
                                            { $eq: ['$paymentStatus', 'Received'] },
                                            'Credit Card',
                                            'Debit Card'
                                        ]
                                    },
                                    {
                                        $cond: [
                                            {
                                                $and: [
                                                    { $ne: ['$payment', null] },
                                                    { $eq: ['$payment.paymentStatus', 'Success'] }
                                                ]
                                            },
                                            'Paid',
                                            'Unknown'
                                        ]
                                    }
                                ]
                            }
                        ]
                    },
                    amount: { $toString: "$totalAmount" },
                    orderStatus: '$orderStatus',
                    createdAt: 1,
                    updatedAt: 1
                }
            }
        ]);

        const formattedOrders = recentOrders.map(order => ({
            ...order,
            amount: order.amount
        }));

        return res.status(200).json({ status: 200, data: formattedOrders });

    } catch (error) {
        console.log(error);
        return res.status(500).json({ status: 500, message: error.messageF });
    }
};