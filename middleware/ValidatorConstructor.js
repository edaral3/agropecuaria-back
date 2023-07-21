const schemas = require('../schemas/index')

const validateList = (list, schemaRef) => {
	const schema = schemas[schemaRef]
	let error
	list.forEach(item => {
		error = error || schema.validate(item)?.error
		if (error) {
			return error
		}
	})
	return error
}

const getValidator = (schemaRef) => {
	const schema = schemas[schemaRef]
	return (req, res, next) => {
		let error
		try {
			switch (schemaRef) {
			case 'vale':
				error = error || validateList(req.body.pagos, 'pago')
				break
			case 'compra':
			case 'venta':
				error = error || validateList(req.body.productos, 'detalleCompraVenta')
				break
			default:
				error = error || schema.validate(req.body)?.error
			}
			if (!error) {
				return next()
			}
		}
		catch (catchError) {
			error = catchError
		}
		global.log.error(error, 400, req.body)
		return res.status(400).json(error)
	}
}

module.exports = getValidator