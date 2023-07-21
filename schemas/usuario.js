const Joi = require('joi')
const messages = require('./errorMessages')

const validationSchema = Joi.object({

	usuario: Joi.string().max(50).min(1).trim().required().messages(messages.validation_string_messages),
	nombre: Joi.string().max(50).min(1).trim().required().messages(messages.validation_string_messages),
	pwd: Joi.string().required().messages(messages.validation_string_messages),
	tipo: Joi.string().messages(messages.validation_string_messages),
})
module.exports = validationSchema