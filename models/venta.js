const mongoose = require('mongoose')
const detalleVenta = require('./detalleCompraVenta')

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
	nombre: {
		type: String,
		required: false
	},
	nit: {
		type: String,
		required: false
	},
	tipoVenta: {
		type: String,
		required: true
	},
	uuid: {
		type: String,
		default: ''
	},
	direccion: {
		type: String,
		default: ''
	},
	fechaAnulacion: {
		type: Date,
		required: false
	},
	anulado: {
		type: Boolean,
		default: false
	},
	uuidEmision: {
		type: String,
		default: ''
	},
	uuidAnulado: {
		type: String,
		default: ''
	},
	productos: [detalleVenta]
})

const Venta = mongoose.model('Venta', Schema)
module.exports = () => Venta