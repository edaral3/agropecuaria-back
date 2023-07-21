const Joi = require('joi')
const messages = require('./errorMessages')

const validationSchema = Joi.object({
    
	nombre: Joi.string().max(50).min(1).trim().required().messages(messages.validation_string_messages),
    
	codigoBarras: Joi.string().max(50).trim().allow(null).messages(messages.validation_string_messages),

	precioCosto: Joi.number().positive().required().allow(0).messages(messages.validation_string_messages),
	precioVenta: Joi.number().positive().required().allow(0).messages(messages.validation_string_messages),
    
	existencia: Joi.number().integer().positive().allow(0).required().messages(messages.validation_string_messages),
	existenciaMinima: Joi.number().integer().positive().allow(0).messages(messages.validation_string_messages),
    
	descripcion: Joi.string().max(500).trim().allow('').messages(messages.validation_string_messages),

	fechaVencimiento: Joi.date().allow(null).preferences({ dateFormat: 'date' }).messages(messages.validation_date_messages),

	proveedor: Joi.disallow(),
	permisoMod: Joi.disallow(),
})

module.exports = validationSchema