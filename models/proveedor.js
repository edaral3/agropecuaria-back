const mongoose = require('mongoose')

const Schema = new mongoose.Schema({
	nombre: {
		type: String,
		required: true
	},
	correo: {
		type: String,
		required: false
	},
	celular: {
		type: String,
		required: true
	},
	empresa: {
		type: String,
		required: false
	},
	descripcion: {
		type: String,
		required: false
	}
})
Schema.index({ nombre: 1 }, { unique: true })

const Proveedor = mongoose.model('Proveedor', Schema)
module.exports = () => Proveedor