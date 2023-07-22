const db = require('../models')
const Producto = db.producto

exports.create = async (req, res) => {
	try {
		const producto = new Producto(req.body)
		const data = await producto.save(producto)
		return res.send(data)
	} catch (error) {
		return res.status(500).json({ message: "Error creando el producto" });
	}
}

exports.getOne = async (req, res) => {
	try {
		const data = await Producto.findById(req.params.id).populate('proveedor')
		return res.send(data)
	} catch (error) {
		return res.status(500).json({ message: "Error obteniendo el producto" });
	}
}

exports.getOneBarCode = async (req, res) => {
	try {
		const data = await Producto.findOne({ codigoBarras: req.params.code }).populate('proveedor')
		return res.send(data)
	} catch (error) {
		return res.status(500).json({ message: "Error buscando el codigo de barras ${req.params.code}" });
	}
}

exports.delete = async (req, res) => {
	try {
		const data = await Producto.findByIdAndDelete(req.params.id)
		return res.send(data)
	} catch (error) {
		return res.status(500).json({ message: "Error eliminando el producto" });
	}
}

exports.update = async (req, res) => {
	try {
		await Producto.findByIdAndUpdate(req.params.id, { $unset: { codigoBarras: '' } })
		const data = await Producto.findByIdAndUpdate(req.params.id, { $set: req.body })
		return res.send(data)
	} catch (error) {
		return res.status(500).json({ message: "Error actualizando el producto" });
	}
}

const getAllFind = async (find, page) => {
	return await Producto.find(find)
		.skip(parseInt(page.skip, 10))
		.limit(parseInt(page.limit, 10))
		.populate('proveedor')
}

exports.getAll = async (req, res) => {
	const skip = req.query.skip
	const limit = req.query.limit
	const name = req.query.name
	const regex = /^[0-9]*$/

	if (!regex.test(skip) || !regex.test(limit)) {
		//global.log.error('Para paginar productos se deben de enviar numeros', 400, { skip: skip, limit: limit })
	}

	try {
		let data
		if (!name)
			data = await getAllFind({}, { skip: skip, limit: limit }, res)
		else
			data = await getAllFind({
				$or: [{ nombre: { $regex: name, $options: 'i' } },
				{ descripcion: { $regex: name, $options: 'i' } },
				{ codigoBarras: { $regex: name, $options: 'i' } }]
			}, { skip: skip, limit: limit },
				res)
		return res.send(data.reverse())
	} catch (error) {
		return res.status(500).json({ message: "Error buscando los productos" });
	}
}