const address = require('../models/addresModels')

exports.createAddress = async (req, res) => {
    try {
        let { firstName, lastName, phone, email, address1, address2, postalCode, city, state, country, saveAddressAs } = req.body

        let newAddressCreate = await address.create({
            firstName,
            lastName,
            phone,
            email,
            address1,
            address2,
            postalCode,
            city,
            state,
            country,
            saveAddressAs,
            userId: req.user._id
        });

        return res.status(201).json({ status: 201, message: "Address Create SuccessFully...", address: newAddressCreate })

    } catch (error) {
        console.log(error)
        return res.status(500).json({ status: 500, message: error.message })
    }
}

exports.getAllAddress = async (req, res) => {
    try {
        let page = parseInt(req.query.page)
        let pageSize = parseInt(req.query.pageSize)

        if (page < 1 || pageSize < 1) {
            return res.status(401).json({ status: 401, message: "Page And PageSize Cann't Be Less Than 1" })
        }

        let paginatedAddress;

        paginatedAddress = await address.find()

        let count = paginatedAddress.length

        if (count === 0) {
            return res.status(404).json({ status: 404, message: "No Address Found..." })
        }

        if (page && pageSize) {
            let startIndex = (page - 1) * pageSize
            let lastIndex = (startIndex + pageSize)
            paginatedAddress = await paginatedAddress.slice(startIndex, lastIndex)
        }

        return res.status(200).json({ status: 200, totalAddress: count, message: "All Address Found SuccessFully...", address: paginatedAddress })

    } catch (error) {
        console.log(error)
        return res.status(500).json({ status: 500, message: error.message })
    }
}