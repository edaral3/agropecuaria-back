
const Joi = require('joi')
const messages = require('./errorMessages')

const validationSchema = Joi.object({
	total: Joi.number().allow(0).min(0).required().messages(messages.validation_string_messages),
	descripcion: Joi.string().max(500).trim().allow('').messages(messages.validation_string_messages),
	fecha: Joi.string().required().messages(messages.validation_date_messages),
	proveedor: Joi.string().allow().messages(messages.validation_string_messages),
	productos: Joi.allow(),
})
module.exports = validationSchema