const Order = require('../models/orderModels')
const Product = require('../models/productModels')

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

exports.getDashboardSummary = async (req, res) => {
    try {
        const totalOrders = await Order.countDocuments();
        const totalProducts = await Product.countDocuments();
        const cancelOrder = await Order.countDocuments({ orderStatus: 'Cancelled' });
        const deliveredOrders = await Order.countDocuments({ orderStatus: 'Delivered' });

        return res.status(200).json({ status: 200, success: true, data: { totalOrders, totalProducts, cancelOrder, deliveredOrders } })

    } catch (error) {
        console.log(error)
        return res.status(500).json({ status: 500, success: false, message: error.message })
    }
}

exports.getSalesByCategory = async (req, res) => {
    try {
        let getSalesData = await Order.aggregate([
            {
                $match: {
                    orderStatus: "Delivered"
                }
            },
            { $unwind: '$items' },
            {
                $lookup: {
                    from: 'products',
                    localField: "items.productId",
                    foreignField: "_id",
                    as: "productData"
                }
            },
            { $unwind: '$productData' },
            {
                $lookup: {
                    from: 'productvarients',
                    localField: "items.productVarientId",
                    foreignField: "_id",
                    as: "productVarientData"
                }
            },
            { $unwind: '$productVarientData' },
            {
                $lookup: {
                    from: 'categories',
                    localField: 'productData.categoryId',
                    foreignField: '_id',
                    as: 'categoryData'
                }
            },
            { $unwind: '$categoryData' },
            {
                $group: {
                    _id: '$categoryData._id',
                    categoryName: { $first: '$categoryData.categoryName' },
                    totalSales: { $sum: '$items.quantity' },
                    totalAmount: { $sum: { $multiply: ['$items.quantity', '$productVarientData.price'] } }
                }
            },
            {
                $project: {
                    categoryName: 1,
                    totalSales: 1,
                    totalAmount: 1
                }
            }
        ])

        const totalSales = getSalesData.reduce((sum, item) => sum + item.totalSales, 0);

        const categoriesWithPercentage = getSalesData.map(item => ({
            ...item,
            percentage: parseFloat(((item.totalSales / totalSales) * 100).toFixed(2))
        }));

        return res.status(200).json({
            status: 200,
            success: true,
            data: categoriesWithPercentage
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({ status: 500, success: false, message: error.message })
    }
}

const getDateRange = (timeframe, year, month) => {
    const now = new Date();
    let startDate, endDate;

    switch (timeframe) {
        case 'day':
            const day = parseInt(month) || now.getDate();
            startDate = new Date(year, 0, day);
            endDate = new Date(year, 0, day);
            endDate.setHours(23, 59, 59, 999);
            break;

        case 'week':
            startDate = new Date(now);
            startDate.setDate(now.getDate() - now.getDay());
            startDate.setHours(0, 0, 0, 0);

            endDate = new Date(startDate);
            endDate.setDate(startDate.getDate() + 6);
            endDate.setHours(23, 59, 59, 999);
            break;

        case 'month':
            startDate = new Date(year, month - 1, 1);

            endDate = new Date(year, month, 0);
            endDate.setHours(23, 59, 59, 999);
            break;

        case 'year':
            startDate = new Date(year, 0, 1);

            endDate = new Date(year, 11, 31);
            endDate.setHours(23, 59, 59, 999);
            break;

        default:
            startDate = new Date(now.getFullYear(), now.getMonth(), 1);
            endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
            endDate.setHours(23, 59, 59, 999);
    }

    return { startDate, endDate };
};

exports.getRevenueStatistics = async (req, res) => {
    try {
        const { timeframe = 'month', year = new Date().getFullYear(), month = new Date().getMonth() + 1 } = req.query;

        const { startDate, endDate } = getDateRange(timeframe, parseInt(year), parseInt(month));

        const revenueData = await Order.aggregate([
            {
                $match: {
                    createdAt: { $gte: startDate, $lte: endDate },
                    orderStatus: { $in: ['Delivered', 'Shipped', 'Confirmed'] }
                }
            },
            {
                $addFields: {
                    dateStr: {
                        $dateToString: {
                            format: timeframe === 'year' ? '%Y-%m' : '%Y-%m-%d',
                            date: '$createdAt'
                        }
                    }
                }
            },
            {
                $group: {
                    _id: "$dateStr",
                    revenue: { $sum: "$totalAmount" },
                    count: { $sum: 1 }
                }
            },
            { $sort: { _id: 1 } },
            {
                $project: {
                    _id: 0,
                    date: '$_id',
                    revenue: { $round: ["$revenue", 2] },
                    count: 1
                }
            }
        ]);

        if (!revenueData || revenueData.length === 0) {
            return res.status(200).json({
                status: 200,
                message: 'No revenue data found for the selected date range.',
                data: {
                    revenueData: [],
                    totalRevenue: 0,
                    orderCount: 0,
                }
            });
        }

        const filledRevenueData = fillMissingDates(revenueData, startDate, endDate, timeframe);

        const totalRevenue = filledRevenueData.reduce((sum, item) => sum + (item.revenue || 0), 0);
        const orderCount = filledRevenueData.reduce((sum, item) => sum + (item.count || 0), 0);

        return res.status(200).json({
            status: 200,
            message: "Revenue statistics retrieved successfully.",
            data: {
                revenueData: filledRevenueData,
            }
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({ status: 500, success: false, message: error.message });
    }
};

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