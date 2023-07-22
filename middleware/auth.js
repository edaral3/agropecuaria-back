const jwt = require('jsonwebtoken')

const verificarToken = (roles) => {
	return (req, res, next) => {
		let token = req.headers['authorization']
		jwt.verify(token, process.env.SECRET, (error, decoded) => {
			if (error) {
				return res.status(400).json({
					message: 'Error decodificando el token'
				})
			}
			if (!roles.includes(decoded.tipo)) {
				return res.status(400).json({
					message: 'No se cuenta con los permisos necesarios para realizar la accion'
				})
			}
			req.usuario = decoded.usuario
			next()
		})
	}
}

module.exports = verificarToken