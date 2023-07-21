const db = require('../models')
const Error = db.errorLogs

exports.create = async (dataError) => {
	try {
		const error = new Error({data: dataError})
		await error.save(error)
	} catch (error) {
		console.log(error)
	}
}