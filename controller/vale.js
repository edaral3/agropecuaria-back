const { updateProduct } = require('../utilities/utils')
const db = require('../models')
const Vale = db.vale

exports.create = async (req, res) => {
	const session = await db.mongoose.startSession()
	session.startTransaction()
	try {
		const vale = new Vale(req.body)
		await updateProduct(req.body.productos, session)
		const data = await vale.save({ session })
		await session.commitTransaction()
		res.send(data)
	} catch (error) {
		await session.abortTransaction()
		return res.status(500).json({ message: "Error creando el vale" });
	}
	session.endSession()
}

exports.pago = async (req, res) => {
	try {
		const data = await Vale.findByIdAndUpdate(req.params.id, { $push: { pagos: req.body } })
		return res.send(data)
	} catch (error) {
		return res.status(500).json({ message: "Error realizando el pago" });
	}
}

exports.getOne = async (req, res) => {
	try {
		const data = await Vale.findById(req.params.id)
			.populate('cliente')
		res.send(data)
	} catch (error) {
		return res.status(500).json({ message: "Error buscando el vale" });
	}
}

exports.delete = async (req, res) => {
	try {
		const data = await Vale.findByIdAndDelete(req.params.id)
		res.send(data)
	} catch (error) {
		return res.status(500).json({ message: "Error eliminando el vale" });
	}
}

exports.update = async (req, res) => {
	try {
		const data = Vale.findByIdAndUpdate(req.params.id, { $set: req.body })
		return res.send(data)
	} catch (error) {
		return res.status(500).json({ message: "Error actualizando el vale" });
	}
}

exports.estado = async (req, res) => {
	if (!req.query.estado || req.query.id) {
		return res.status(400).json({ message: 'No se enviaron los parametros en para cambair el estado' })
	}
	try {
		const data = await Vale.findByIdAndUpdate(req.query.id, { $set: req.query.estado })
		return res.send(data)
	} catch (error) {
		return res.status(500).json({ message: "Error actualizando el vale" });
	}
}

const getAllFind = async (find, page) => {
	return await Vale.find(find)
		.populate('cliente')
		.skip(parseInt(page.skip, 10))
		.limit(parseInt(page.limit, 10))
}

exports.getAll = async (req, res) => {
	const skip = req.query.skip
	const limit = req.query.limit
	const date = req.query.date
	const id = req.query.id
	const regex = /^[0-9]*$/

	if (!regex.test(skip) || !regex.test(limit)) {
		//global.log.error('Para paginar vales se deben de enviar numeros', 400, { skip: skip, limit: limit })
	}
	try {
		let data
		if (!date && !id)
			data = await getAllFind({}, { skip: skip, limit: limit }, res)
		else if (id)
			data = await getAllFind({
				cliente: id
			}, { skip: skip, limit: limit },
				res)
		else
			data = await getAllFind({
				fecha: new Date(date)
			}, { skip: skip, limit: limit },
				res)
		return res.send(data)
	} catch (error) {
		return res.status(400).json({ message: 'Error buscando el vale' })
	}
}