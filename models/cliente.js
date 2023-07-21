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
	}
})

const Cliente = mongoose.model('Cliente', Schema)
module.exports = () => Cliente