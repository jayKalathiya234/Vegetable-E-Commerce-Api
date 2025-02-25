const category = require('../models/categoryModels')

exports.createCategory = async (req, res) => {
    try {
        let { categoryName, categoryImage } = req.body

        let checkCategoryNameIsExist = await category.findOne({ categoryName })

        if (checkCategoryNameIsExist) {
            return res.status(409).json({ status: 409, message: "Category Name is already exist" })
        }

        checkCategoryNameIsExist = await category.create({
            categoryName,
            categoryImage: req.file ? req.file.path : undefined
        });

        return res.status(200).json({ status: 200, message: "Category Create SuccessFully...", category: checkCategoryNameIsExist })

    } catch (error) {
        console.log(error)
        return res.status(500).json({ status: 500, message: error.message })
    }
}

exports.getAllCategory = async (req, res) => {
    try {
        let page = parseInt(req.query.page)
        let pageSize = parseInt(req.query.pageSize)

        if (page < 1 || pageSize) {
            return res.status(401).json({ status: 401, message: "Page And PageSize Cann't Be Less Than 1" })
        }

        let paginatedAddress;

        paginatedAddress = await category.find()

        let count = paginatedAddress.length

        if (count === 0) {
            return res.status(404).json({ status: 404, message: "Address Not Found" })
        }

        if (page && pageSize) {
            let startIndex = (page - 1) * pageSize
            let lastIndex = (startIndex + pageSize)
            paginatedAddress = await paginatedAddress.slice(startIndex, lastIndex)
        }

        return res.status(200).json({ status: 200, totalCategory: count, message: "All Category Found SuccessFully...", category: paginatedAddress })

    } catch (error) {
        console.log(error)
        return res.status(500).json({ status: 500, message: error.message })
    }
}

exports.getCategoryById = async (req, res) => {
    try {
        let id = req.params.id

        let getCategoryId = await category.findById(id)

        if (!getCategoryId) {
            return res.status(404).json({ status: 404, message: "Category Not Found" })
        }

        return res.status(200).json({ status: 200, message: "Category Found SuccessFully...", category: getCategoryId })

    } catch (error) {
        console.log(error)
        return res.status(500).json({ status: 500, message: error.message })
    }
}

exports.updateCategoryById = async (req, res) => {
    try {
        let id = req.params.id

        let updateCategoryId = await category.findById(id)

        if (!updateCategoryId) {
            return res.status(404).json({ status: 404, message: "Category Not Found" })
        }

        if (req.file) {
            req.body.categoryImage = req.file.path
        }

        updateCategoryId = await category.findByIdAndUpdate(id, { ...req.body }, { new: true })

        return res.status(200).json({ status: 200, message: "Category Updated SuccessFully...", category: updateCategoryId })

    } catch (error) {
        console.log(error);
        return res.status(500).json({ status: 500, message: error.message });
    }
}

exports.deleteCategoryById = async (req, res) => {
    try {
        let id = req.params.id

        let deleteCategoryId = await category.findById(id)

        if (!deleteCategoryId) {
            return res.status(404).json({ status: 404, message: "Category Not Found" })
        }

        await category.findByIdAndDelete(id)

        return res.status(200).json({ status: 200, message: "Category Delete SuccessFully..." })

    } catch (error) {
        console.log(error)
        return res.status(500).json({ status: 500, message: error.message })
    }
}