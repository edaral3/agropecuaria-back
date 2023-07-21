const mongoose = require('mongoose')
const compraSchema = mongoose.Schema
const detalleCompra = require('./detalleCompraVenta')

const Schema = new mongoose.Schema({
	fecha: {
		type: Date,
		required: true
	},
	total: {
		type: Number,
		required: true
	},
	descripcion: {
		type: String,
		required: false
	},
	proveedor: {
		type: compraSchema.Types.ObjectId, ref: 'Proveedor',
		required: false
	},
	productos: [detalleCompra]
})

const Compra = mongoose.model('Compra', Schema)
module.exports = () => Compra
