const Joi = require('joi')
const messages = require('./errorMessages')

const validationSchema = Joi.object({
	total: Joi.number().allow(0).min(0).required().messages(messages.validation_string_messages),
	descripcion: Joi.string().max(500).trim().allow('').messages(messages.validation_string_messages),
	nombre: Joi.string().max(500).trim().allow('').messages(messages.validation_string_messages),
	nit: Joi.string().max(500).trim().allow('').messages(messages.validation_string_messages),
	fecha: Joi.allow(),
	productos: Joi.allow(),
	tipoVenta: Joi.allow(),
	uuid: Joi.allow(),
	direccion: Joi.allow(),
	fechaAnulacion: Joi.allow(),
})
module.exports = validationSchema