const stock = require('../models/stockModels')

exports.createStock = async (req, res) => {
    try {
        let { categoryId, productId, quantity, lowStockLimit } = req.body

        let checkStockProductIsExist = await stock.findOne({ categoryId, productId })

        if (checkStockProductIsExist) {
            return res.status(409).json({ status: 409, success: false, message: "Stock Product Already Exist" })
        }

        checkStockProductIsExist = await stock.create({
            categoryId,
            productId,
            quantity,
            lowStockLimit
        });

        return res.status(200).json({ status: 200, success: true, message: "Stock Product Created Successfully", data: checkStockProductIsExist })

    } catch (error) {
        console.log(error)
        return res.status(500).json({ status: 500, success: false, message: error.message })
    }
}

exports.getAllStocks = async (req, res) => {
    try {
        let page = parseInt(req.query.page)
        let pageSize = parseInt(req.query.pageSize)

        if (page < 1 || pageSize < 1) {
            return res.status(401).json({ status: 401, success: false, message: "Page And PageSize Cann't Be Less Than 1" })
        }

        let paginatedStocks;

        paginatedStocks = await stock.find()

        let count = paginatedStocks.length

        if (count === 0) {
            return res.status(404).json({ status: 404, success: false, message: "Stock Not Found" })
        }

        if (page && pageSize) {
            let startIndex = (page - 1) * pageSize
            let lastIndex = (startIndex + pageSize)
            paginatedStocks = await paginatedStocks.slice(startIndex, lastIndex)
        }

        return res.status(200).json({ status: 200, success: true, totalStocks: count, message: "All Stocks Found SuccessFully...", data: paginatedStocks })

    } catch (error) {
        console.log(error)
        return res.status(500).json({ status: 500, success: false, message: error.message })
    }
}

exports.getStockById = async (req, res) => {
    try {
        let id = req.params.id

        let getStockId = await stock.findById(id)

        if (!getStockId) {
            return res.status(404).json({ status: 404, success: false, message: "Stock Not Found" })
        }

        return res.status(200).json({ status: 200, success: true, message: "Stock Found SuccessFully...", data: getStockId })

    } catch (error) {
        console.log(error)
        return res.status(500).json({ status: 500, success: false, message: error.message })
    }
}

exports.updateStockById = async (req, res) => {
    try {
        let id = req.params.id

        let updateStockId = await stock.findById(id)

        if (!updateStockId) {
            return res.status(404).json({ status: 404, success: false, message: "Stock Not Found" })
        }

        updateStockId = await stock.findByIdAndUpdate(id, { ...req.body }, { new: true })

        return res.status(200).json({ status: 200, success: true, message: "Stock Updated SuccessFully...", data: updateStockId })

    } catch (error) {
        console.log(error)
        return res.status(500).json({ status: 500, success: false, message: error.message })
    }
}

exports.deleteStockById = async (req, res) => {
    try {
        let id = req.params.id

        let deleteStockId = await stock.findById(id)

        if (!deleteStockId) {
            return res.status(404).json({ status: 404, success: false, message: "Stock Not Found" })
        }

        await stock.findByIdAndDelete(id)

        return res.status(200).json({ status: 200, success: true, message: "Stock Deleted SuccessFully..." })

    } catch (error) {
        console.log(error)
        return res.status(500).json({ status: 500, success: false, message: error.message })
    }
}
