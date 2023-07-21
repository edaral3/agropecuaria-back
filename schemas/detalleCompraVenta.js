
const Joi = require('joi')
const messages = require('./errorMessages')

const validationSchema = Joi.object({
	nombre: Joi.string().max(50).min(1).trim().required().messages(messages.validation_string_messages),
	id: Joi.string().max(50).trim().required().messages(messages.validation_string_messages),
	cantidad: Joi.number().positive().integer().required().messages(messages.validation_string_messages),
	precioCosto: Joi.number().allow(0).min(0).required().messages(messages.validation_string_messages),
	precioVenta: Joi.number().allow(0).min(0).positive().required().messages(messages.validation_string_messages),
	total: Joi.number().allow(0).min(0).positive().required().messages(messages.validation_string_messages),
	fechaVencimiento: Joi.allow(null),
})
module.exports = validationSchema