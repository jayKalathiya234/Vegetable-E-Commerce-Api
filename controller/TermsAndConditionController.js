const terms = require('../models/TermsAndConditionModel')

exports.createTerms = async (req, res) => {
    try {
        let { title, description } = req.body

        let checkTitleIsExist = await terms.findOne({ title })

        if (checkTitleIsExist) {
            return res.status(409).json({ status: 409, message: "Title Already Exist" })
        }

        checkTitleIsExist = await terms.create({
            title,
            description
        });

        return res.status(200).json({ status: 200, message: "Title Created SuccessFully...", terms: checkTitleIsExist })

    } catch (error) {
        console.log(error)
        return res.status(500).json({ status: 500, message: error.message })
    }
}

exports.getAllTerms = async (req, res) => {
    try {
        let page = parseInt(req.query.page)
        let pageSize = parseInt(req.query.pageSize)

        if (page < 1 || pageSize < 1) {
            return res.status(401).json({ status: 401, message: "Page And PageSize Cann't Be Less Than 1" })
        }

        let paginatedTerms;

        paginatedTerms = await terms.find()

        let count = paginatedTerms.length

        if (count === 0) {
            return res.status(404).json({ status: 404, message: "No Terms Found" })
        }

        if (page && pageSize) {
            let startIndex = (page - 1) * pageSize
            let lastIndex = (startIndex + pageSize)
            paginatedTerms = await paginatedTerms.slice(startIndex, lastIndex)
        }

        return res.status(200).json({ status: 200, totalTerms: count, message: "All Terms Data Found SuccessFully...", terms: paginatedTerms })

    } catch (error) {
        console.log(error)
        return res.status(500).json({ status: 500, message: error.message })
    }
}

exports.getTermsById = async (req, res) => {
    try {
        let id = req.params.id

        let getTermId = await terms.findById(id)

        if (!getTermId) {
            return res.status(404).json({ status: 404, message: "Terms Data Not Found" })
        }

        return res.status(200).json({ status: 200, message: "Term Data Found SuccessFully...", terms: getTermId })

    } catch (error) {
        console.log(error)
        return res.status(500).json({ status: 500, message: error.message })
    }
}

exports.updateTermsById = async (req, res) => {
    try {
        let id = req.params.id

        let updateTermId = await terms.findById(id)

        if (!updateTermId) {
            return res.status(404).json({ status: 404, message: "Terms Data Not Found" })
        }

        updateTermId = await terms.findByIdAndUpdate(id, { ...req.body }, { new: true })

        return res.status(200).json({ status: 200, message: "Terms Data Updated SuccessFully...", term: updateTermId })

    } catch (error) {
        console.log(error)
        return res.status(500).json({ status: 500, message: error.message })
    }
}

exports.deleteTermsAndById = async (req, res) => {
    try {
        let id = req.params.id

        let deleteTermsId = await terms.findById(id)

        if (!deleteTermsId) {
            return res.status(404).json({ status: 404, message: "Terms Data Not Found" })
        }

        await terms.findByIdAndDelete(id)

        return res.status(200).json({ status: 200, message: "Terms Data Deleted SuccessFully..." })

    } catch (error) {
        console.log(error)
        return res.status(500).json({ status: 500, message: error.message })
    }
}