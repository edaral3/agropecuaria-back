const db = require('../models')
const Cliente = db.cliente

exports.create = async (req, res) => {
	try {
		const cliente = new Cliente(req.body)
		const data = await cliente.save(cliente)
		return res.send(data)
	} catch (error) {
		global.log.error(error, 400, req.body)
		return res.status(400).json(error)
	}
}

const getAllFind = async (find, page) => {
	return Cliente.find(find)
		.skip(parseInt(page.skip, 10))
		.limit(parseInt(page.limit, 10))
}

exports.getAll = async (req, res) => {
	const skip = req.query.skip
	const limit = req.query.limit
	const name = req.query.name
	const regex = /^[0-9]*$/

	if (!regex.test(skip) || !regex.test(limit)) {
		global.log.error('Para paginar clientes se deben de enviar numeros', 400, { skip: skip, limit: limit })
	}
	try {
		let data
		if (!name)
			data = await getAllFind({}, { skip: skip, limit: limit }, res)
		else
			data = await getAllFind({ nombre: { $regex: name, $options: 'i' } },
				{ skip: skip, limit: limit }, res)
		return res.send(data)
	} catch (error) {
		global.log.error(error, 400, 'Error buscando cliente')
		return res.status(400).json(error)
	}
}

exports.getOne = async (req, res) => {
	try {
		const data = await Cliente.findById(req.params.id)
		return res.send(data)
	} catch (error) {
		global.log.error(error, 400,
			`Error buscando el cliente ${req.params.id}`)
		return res.status(400).json(error)
	}
}

exports.delete = async (req, res) => {
	try {
		const data = await Cliente.findByIdAndDelete(req.params.id)
		return res.send(data)
	} catch (error) {
		global.log.error(error, 400,
			`Error eliminando el cliente ${req.params.id}`)
		return res.status(400).json(error)
	}
}

exports.update = async (req, res) => {
	try {
		const data = await Cliente.findByIdAndUpdate(req.params.id, { $set: req.body })
		return res.send(data)
	} catch (error) {
		global.log.error(error, 400,
			`Error actualizando el cliente ${req.params.id}`)
		return res.status(400).json(error)	
	}
}