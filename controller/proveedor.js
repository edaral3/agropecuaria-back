const db = require('../models')
const Proveedor = db.proveedor

exports.create = async (req, res) => {
	try {
		const proveedor = new Proveedor(req.body)
		const data = await proveedor.save(proveedor)
		return res.send(data)
	} catch (error) {
		res.status(500).json({ message: "Error creando el proveedor" });
	}
}

const getAllFind = async (find, page) => {
	return await Proveedor.find(find)
		.skip(parseInt(page.skip, 10))
		.limit(parseInt(page.limit, 10))
}

exports.getAll = async (req, res) => {
	const skip = req.query.skip
	const limit = req.query.limit
	const name = req.query.name
	const regex = /^[0-9]*$/

	if (!regex.test(skip) || !regex.test(limit)) {
		//global.log.error('Para paginar proveedores se deben de enviar numeros', 400, { skip: skip, limit: limit })
	}
	try {
		let data
		if (!name)
			data = await getAllFind({}, { skip: skip, limit: limit }, res)
		else
			data = await getAllFind({
				$or: [{ nombre: { $regex: name, $options: 'i' } },
					{ descripcion: { $regex: name, $options: 'i' } }]
			}, { skip: skip, limit: limit }, res)
		return res.send(data)
	} catch (error) {
		return res.status(500).json({ message: "Error buscando a los proveedores" });
	}
}

exports.getOne = async (req, res) => {
	try {
		const data = await Proveedor.findById(req.params.id)
		return res.send(data)
	} catch (error) {
		return res.status(500).json({ message: "Error buscando al proveedor" });
	}
}

exports.delete = async (req, res) => {
	try {
		const data = await Proveedor.findByIdAndDelete(req.params.id)
		return res.send(data)
	} catch (error) {
		return res.status(500).json({ message: "Error eliminando al proveedor" });
	}
}

exports.update = async (req, res) => {
	try {
		const data = await Proveedor.findByIdAndUpdate(req.params.id, { $set: req.body })
		return res.send(data)
	} catch (error) {
		return res.status(500).json({ message: "Error actualizando al proveedor" });
	}
}