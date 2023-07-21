const Joi = require('joi')
const messages = require('./errorMessages')

const validationSchema = Joi.object({

	nombre: Joi.string().max(50).min(1).trim().required().messages(messages.validation_string_messages),
	celular: Joi.string().max(50).trim().required().messages(messages.validation_string_messages),
	correo: Joi.string().max(50).trim().allow('').messages(messages.validation_string_messages),
	empresa: Joi.string().max(50).trim().allow('').messages(messages.validation_string_messages),
	descripcion: Joi.string().max(500).trim().allow('').messages(messages.validation_string_messages)
})

module.exports = validationSchema