const db = require('../models')
const Producto = db.producto

exports.updateProduct = async (productos, session) => {
	for (const producto of productos) {
		const { id, cantidad } = producto
		const config = { $inc: { existencia: -cantidad } }
		const data = await Producto.findByIdAndUpdate(id, config, { session })
		if (!data || (data.existencia - cantidad) < 0) {
			throw { type: 400, message: `No se cuenta con la cantidad suficiente del producto "${producto.nombre}" para realizar el vale` }
		}
	}
}
exports.updateProductLess = async (productos, session) => {
	for (const producto of productos) {
		const { id, cantidad } = producto
		const config = { $inc: { existencia: cantidad } }
		await Producto.findByIdAndUpdate(id, config, { session })
	}
}
