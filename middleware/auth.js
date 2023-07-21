const jwt = require('jsonwebtoken')
//const config = require('config')

/*let verificarToken2 = (req, res, next) => {

	let token = req.headers['authorization']
	jwt.verify(token, 'AgropecuariaAldana', (error, decoded) => {
		if (error) {
			return res.status(401).json({
				error
			})
		}
		req.usuario = decoded.usuario
		next()
	})
}*/

const verificarToken = (roles) => {
	return (req, res, next) => {
		let token = req.headers['authorization']
		jwt.verify(token, 'AgropecuariaAldana', (error, decoded) => {
			if (error) {
				return res.status(401).json({
					error
				})
			}
			if (!roles.includes(decoded.tipo)) {
				return res.status(401).json({
					message: 'No se cuenta con los permisos necesarios para realizar la accion'
				})
			}
			req.usuario = decoded.usuario
			next()
		})
	}
}

module.exports = verificarToken