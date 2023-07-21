const mongoose = require('mongoose')

const Schema = new mongoose.Schema({
	usuario: {
		type: String,
		required: true
	},
	nombre: {
		type: String,
		required: true
	},
	pwd: {
		type: String,
		required: false
	},
	tipo: {
		type: String,
		required: true
	}
})
Schema.index({ usuario: 1 }, { unique: true })

const Usuario = mongoose.model('Usuario', Schema)
module.exports = () => Usuario