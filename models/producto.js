const mongoose = require('mongoose')
const proveedorSchema = mongoose.Schema

const Schema = new mongoose.Schema({
	nombre: {
		type: String,
		required: true
	},
	codigoBarras: {
		type: String,
		required: false
	},
	precioCosto: {
		type: Number,
		required: true
	},
	precioVenta: {
		type: Number,
		required: true
	},
	existencia: {
		type: Number,
		required: true,
		min: 0
	},
	existenciaMinima: {
		type: Number,
		default: 0,
		min: 0
	},
	fechaVencimiento: {
		type: Date,
		default: null
	},
	descripcion: {
		type: String,
		default: null
	},
	permisoMod: {
		type: Boolean,
		required: false,
		default: false
	},
	proveedor: {
		type: proveedorSchema.Types.ObjectId, ref: 'Proveedor',
		default: null
	}
})
Schema.index({ codigoBarras: 1 }, { unique: true, sparse: true })
Schema.index({ nombre: 1 }, { unique: true })

const ProductModel = mongoose.model('Producto', Schema)
module.exports = () => ProductModel