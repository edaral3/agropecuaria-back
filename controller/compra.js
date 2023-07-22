const db = require('../models')
const Compra = db.compra
const Producto = db.producto

const updateProduct = async (productos, session) => {
	for (const producto of productos) {
		const { id, cantidad, precioCosto, precioVenta, fechaVencimiento } = producto
		const config = {
			$inc: { existencia: cantidad },
			$set: {
				precioCosto: precioCosto,
				precioVenta: precioVenta,
				fechaVencimiento: fechaVencimiento
			}
		}
		const data = await Producto.findByIdAndUpdate(id, config, { session })
		if (!data) {
			throw { msg: 'No se pudo realizar la compra', producto }
		}
	}
}

exports.create = async (req, res) => {
	const session = await db.mongoose.startSession()
	session.startTransaction()
	try {
		req.body.fecha = req.body.fecha.split('.')[0] + '.000+00:00'
		const compra = new Compra(req.body)
		await updateProduct(req.body.productos, session)
		await compra.save({ session })
		await session.commitTransaction()
		res.send('OK')
	} catch (error) {
		await session.abortTransaction()
		return res.status(500).json({ message: "Error realizando la compra" });
	}
	session.endSession()
}

exports.getOne = async (req, res) => {
	try {
		const data = await Compra.findById(req.params.id)
			.populate('proveedor')
		return res.send(data)
	} catch (error) {
		return res.status(500).json({ message: "Error obteniendo la compra" });
	}
}

exports.delete = async (req, res) => {
	try {
		const data = await Compra.findByIdAndDelete(req.params.id)
		return res.send(data)
	} catch (error) {
		return res.status(500).json({ message: "Error eliminando la compra" });
	}
}

exports.update = async (req, res) => {
	try {
		const data = Compra.findByIdAndUpdate(req.params.id, { $set: req.body })
		return res.send(data)
	}
	catch (error) {
		return res.status(500).json({ message: "Error actualizando la compra" });
	}
}

const getAllFind = async (find, page) => {
	return await Compra.find(find)
		.sort({ fecha: -1 })
		.skip(parseInt(page.skip, 10))
		.limit(parseInt(page.limit, 10))
		.populate('proveedor')
}

exports.getAll = async (req, res) => {
	const skip = req.query.skip
	const limit = req.query.limit
	const filter = req.query.date
	const regex = /^[0-9]*$/

	if (!regex.test(skip) || !regex.test(limit)) {
		//global.log.error('Para paginar compras se deben de enviar numeros', 400, { skip: skip, limit: limit })
	}
	try {
		let data
		if (!filter)
			data = await getAllFind({}, { skip: skip, limit: limit }, res)
		else
			data = await getAllFind({
				$expr: { $eq: [filter, { $dateToString: { date: '$fecha', format: '%d/%m/%Y' } }] }
			}, {},
			res)
		return res.send(data)
	} catch (error) {
		return res.status(500).json({ message: "Error buscando las compras" });
	}
}
