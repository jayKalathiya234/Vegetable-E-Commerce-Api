const reason = require('../models/reasonforCancellationModels')

exports.createReason = async (req, res) => {
    try {
        let { reasonName } = req.body

        let existReasonName = await reason.findOne({ reasonName })

        if (existReasonName) {
            return res.status(409).json({ status: 409, message: "Reason Name already exist" })
        }

        existReasonName = await reason.create({
            reasonName
        });

        return res.status(201).json({ status: 201, message: "Reason Create SuccessFully...", reason: existReasonName })

    } catch (error) {
        console.log(error)
        return res.status(500).json({ status: 500, message: error.message })
    }
}