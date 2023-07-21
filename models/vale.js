const mongoose = require('mongoose')
const detalleVenta = require('./detalleCompraVenta')
const SchemaVale = mongoose.Schema

const pagoSchema = new mongoose.Schema({
	fecha: {
		type: Date,
		required: true
	},
	cantidad: {
		type: Number,
		required: true
	},
})

const Schema = new mongoose.Schema({
	estado: {
		type: Number,
		default: 0
	},
	fecha: {
		type: Date,
		required: true
	},
	total: {
		type: Number,
		required: true
	},
	deuda: {
		type: Number,
		required: true
	},
	descripcion: {
		type: String,
		required: false
	},
	cliente: {
		type: SchemaVale.Types.ObjectId, ref: 'Cliente',
		require: true
	},
	pagos: [pagoSchema],
	productos: [detalleVenta]
})


const Vale = mongoose.model('Vale', Schema)
module.exports = () => Vale