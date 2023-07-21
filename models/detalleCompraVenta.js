const mongoose = require('mongoose')

const productoSchema = new mongoose.Schema({
	nombre: {
		type: String,
		required: true
	},
	id: {
		type: String,
		required: true
	},
	cantidad: {
		type: Number,
		required: true
	},
	precioCosto: {
		type: Number,
		required: true
	},
	precioVenta: {
		type: Number,
		required: true
	},
	total: {
		type: Number,
		required: true
	}
})

//const DetalleProducto = mongoose.model('DetalleCompra', productoSchema)
module.exports = productoSchema