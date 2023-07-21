const Joi = require('joi')
const messages = require('./errorMessages')

const validationSchema = Joi.object({
	cantidad: Joi.number().positive().required().messages(messages.validation_string_messages),
	fecha: Joi.date().required().preferences({ dateFormat: 'date' }).messages(messages.validation_date_messages),
})
module.exports = validationSchema