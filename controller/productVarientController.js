const productVarient = require('../models/productVarientModels')

exports.createProductVarient = async (req, res) => {
    try {
        let { productId, size, price, discountPrice, stockStatus } = req.body

        let productVarientCreate = await productVarient.create({
            productId,
            size,
            price,
            discountPrice,
            stockStatus
        });

        return res.status(201).json({ status: 201, success: true, message: "Product Varient Create SuccessFully...", data: productVarientCreate })

    } catch (error) {
        console.log(error)
        return res.status(500).json({ status: 500, success: false, message: error.message })
    }
}

exports.getAllProductVarient = async (req, res) => {
    try {
        let page = parseInt(req.query.page)
        let pageSize = parseInt(req.query.pageSize)

        if (page < 1 || pageSize < 1) {
            return res.status(401).json({ status: 401, success: false, message: "Page And PageSize Cann't Be Less Than 1" })
        }

        let paginatedProductVarient;

        paginatedProductVarient = await productVarient.find()

        let count = productVarient.length

        if (count === 0) {
            return res.status(404).json({ status: 404, success: false, message: "Product Varient Not Found" })
        }

        if (page && pageSize) {
            let startIndex = (page - 1) * pageSize
            let lastIndex = (startIndex + pageSize)
            paginatedProductVarient = await paginatedProductVarient.slice(startIndex, lastIndex)
        }

        return res.status(200).json({ status: 200, success: true, totalProductVarient: count, message: "All Product Varient Foudn SuccessFully...", data: paginatedProductVarient })

    } catch (error) {
        console.log(error)
        return res.status(500).json({ status: 500, success: false, message: error.message })
    }
}

exports.getProductVarientById = async (req, res) => {
    try {
        let id = req.params.id

        let getProductVarientId = await productVarient.findById(id)

        if (!getProductVarientId) {
            return res.status(404).json({ status: 404, success: false, message: "Product Varient Not Found" })
        }

        return res.status(200).json({ status: 200, success: true, message: "Product Varient Found SuccessFully...", data: getProductVarientId })

    } catch (error) {
        console.log(error)
        return res.status(500).json({ status: 500, success: false, message: error.message })
    }
}

exports.updateProductVarientById = async (req, res) => {
    try {
        let id = req.params.id

        let updateProductVarientId = await productVarient.findById(id)

        if (!updateProductVarientId) {
            return res.status(404).json({ status: 404, success: false, message: "Product Varient Not Found" })
        }

        updateProductVarientId = await productVarient.findByIdAndUpdate(id, { ...req.body }, { new: true })

        return res.status(200).json({ status: 200, success: false, message: 'Product Varient Update SuccessFully...', data: updateProductVarientId })

    } catch (error) {
        console.log(error)
        return res.status(500).json({ status: 500, success: false, message: error.message })
    }
}

exports.deleteProductVarientById = async (req, res) => {
    try {
        let id = req.params.id

        let deleteProductVarientId = await productVarient.findById(id)

        if (!deleteProductVarientId) {
            return res.status(404).json({ status: 404, success: false, message: "Product Varient Not Found" })
        }

        await productVarient.findByIdAndDelete(id)

        return res.status(200).json({ status: 200, success: true, message: "Product Varient Delete SuccessFully..." })

    } catch (error) {
        console.log(error)
        return res.status(500).json({ status: 500, success: false, message: error.message })
    }
}