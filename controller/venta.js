const { updateProduct } = require('../utilities/utils')
const { updateProductLess } = require('../utilities/utils.js')
const errorLogs = require('./errorLogs')
const db = require('../models')
const Venta = db.venta
const { crearFactra } = require('../certificador')

exports.create = async (req, res) => {
	const session = await db.mongoose.startSession()
	session.startTransaction()
	try {
		const productos = req.body.productos.map(item => {
			item.total = item.cantidad * item.precioVenta
			return item
		})
		await updateProduct(productos, session)
		const uuid = await crearFactra(req.body)
		if (!uuid) {
			throw { message: 'Error generando la factura' }
		}
		const nuevaVenta = req.body
		nuevaVenta.uuid = uuid.uuid
		nuevaVenta.uuidEmision = uuid.uuidEmision
		req.body.fecha =  req.body.fecha.split('.')[0]+'.000+00:00'
		const venta = new Venta(nuevaVenta)
		const data = await venta.save({ session })

		await session.commitTransaction()
		res.send({ data, uuid: uuid.uuid })
	} catch (error) {
		errorLogs.create({error, body:req.body})
		await session.abortTransaction()
		global.log.error(error, 500, req.body)
		res.status(500).json(error)
	}
	session.endSession()
}

exports.createFactura = async (req, res) => {
	try {
		const uuid = await crearFactra(req.body)
		if (!uuid) {
			throw { message: 'Error generando la factura' }
		}
		res.send({ message: 'Factura generada', uuid: uuid.uuid })
	} catch (error) {
		errorLogs.create({error, body:req.body})
		global.log.error(error, 500, req.body)
		res.status(500).json(error)
	}
}

exports.createSinFactura = async (req, res) => {
	const session = await db.mongoose.startSession()
	session.startTransaction()
	try {
		req.body.fecha =  req.body.fecha.split('.')[0]+'.000+00:00'
		const venta = new Venta(req.body)
		await updateProduct(req.body.productos, session)
		const data = await venta.save({ session })
		await session.commitTransaction()
		res.send({data})
	} catch (error) {
		await session.abortTransaction()
		global.log.error(error, 500, req.body)
		res.status(500).json(error)
	}
	session.endSession()
}

exports.getOne = async (req, res) => {
	try {
		const data = await Venta.findById(req.params.id)
		res.send(data)
	} catch (error) {
		global.log.error(error, 400,
			`Error buscando la venta ${req.params.id}`)
		return res.status(400).json(error)
	}
}

exports.delete = async (req, res) => {
	try {
		const data = await Venta.findByIdAndDelete(req.params.id)
		res.send(data)
	} catch (error) {
		global.log.error(error, 400,
			`Error eliminando la venta ${req.params.id}`)
		return res.status(400).json(error)
	}
}

exports.update = async (req, res) => {
	try {
		const data = await Venta.findByIdAndUpdate(req.params.id, { $set: req.body })
		return res.send(data)
	} catch (error) {
		global.log.error(error, 400,
			`Error actualizando la venta ${req.params.id}`)
		return res.status(400).json(error)
	}
}

const getAllFind = async (find, page) => {
	return await Venta.find(find)
		.sort({ fecha: -1 })
		.skip(parseInt(page.skip, 10))
		.limit(parseInt(page.limit, 10))
}

exports.getAll = async (req, res) => {
	const skip = req.query.skip
	const limit = req.query.limit
	const filter = req.query.date
	const regex = /^[0-9]*$/

	if (!regex.test(skip) || !regex.test(limit)) {
		global.log.error('Para paginar ventas se deben de enviar numeros', 400, { skip: skip, limit: limit })
	}
	try {
		let data
		if (!filter) {
			data = await getAllFind({}, { skip: skip, limit: limit }, res)
		}
		else {
			data = await getAllFind({
				$or: [{ nit: { $regex: filter, $options: 'i' } },
					{ nombre: { $regex: filter, $options: 'i' } },
					{ $expr: { $eq: [filter, { $dateToString: { date: '$fecha', format: '%d/%m/%Y' } }] } }]
			}, {},
			res)
		}
		return res.send(data)
	} catch (error) {
		global.log.error(error, 400, 'Error buscando la venta')
		return res.status(400).json(error)
	}
}

exports.anularVenta = async (req, res) => {
	const session = await db.mongoose.startSession()
	session.startTransaction()
	try {
		const { id, productos } = req.body
		await updateProductLess(productos, session)
		await Venta.findByIdAndUpdate(id, {
			$set: {
				anulado: true,
			}
		}, { session })
		await session.commitTransaction()
		res.send({ messase: 'Venta anulada' })
	} catch (error) {
		errorLogs.create({error, body:req.body})
		await session.abortTransaction()
		global.log.error(error, 400, req.body)
		return res.status(400).json(error)
	}
	session.endSession()
}