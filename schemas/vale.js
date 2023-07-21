const Joi = require('joi')
const messages = require('./errorMessages')

const validationSchema = Joi.object({
	total: Joi.number().positive().required().messages(messages.validation_string_messages),
	deuda: Joi.number().positive().required().messages(messages.validation_string_messages),
	descripcion: Joi.string().max(500).trim().allow('').messages(messages.validation_string_messages),
	cliente: Joi.string().messages(messages.validation_string_messages),
	fecha: Joi.allow(),
	productos: Joi.allow(),
	pagos: Joi.allow()
})
module.exports = validationSchema