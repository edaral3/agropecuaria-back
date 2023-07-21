const db = require('../models')
const Usuario = db.usuario
const bcrypt = require('bcrypt')

exports.create = async (req, res) => {
	try {
		req.body.pwd = bcrypt.hashSync(req.body.pwd, 10)
		const usuario = new Usuario(req.body)
		await usuario.save(usuario)
		return res.send('Usuario creado')
	} catch (error) {
		global.log.error(error, 500, req.body)
		if (error.code == 11000) {
			return res.status(500).json({
				message: `El usuario ${req.body.usuario} ya existe`
			})
		}
		return res.status(500).json(error)
	}
}

const getAllFind = async (find, select, page) => {
	return Usuario.find(find, select)
		.skip(parseInt(page.skip, 10))
		.limit(parseInt(page.limit, 10))
}

exports.getAll = async (req, res) => {
	const skip = req.query.skip
	const limit = req.query.limit
	const name = req.query.name
	const regex = /^[0-9]*$/

	if (!regex.test(skip) || !regex.test(limit)) {
		global.log.error('Para paginar usuarios se deben de enviar numeros', 400, { skip: skip, limit: limit })
	}
	try {
		let data
		if (!name)
			data = await getAllFind({}, { pwd: 0 }, { skip: skip, limit: limit }, res)
		else
			data = await getAllFind({ nombre: { $regex: name, $options: 'i' } },
				{ pwd: 0 }, { skip: skip, limit: limit }, res)
		return res.send(data)
	} catch (error) {
		global.log.error(error, 400, 'Error buscando usuario')
		return res.status(400).json(error)
	}
}

exports.getOne = async (req, res) => {
	try {
		const data = await Usuario.findById(req.params.id, { pwd: 0 })
		return res.send(data)
	} catch (error) {
		global.log.error(error, 400,
			`Error buscando el usuario ${req.params.id}`)
		return res.status(400).json(error)
	}
}

exports.delete = async (req, res) => {
	try {
		const data = await Usuario.findByIdAndDelete(req.params.id)
		delete data.pwd
		return res.send(data)
	} catch (error) {
		global.log.error(error, 500,
			`Error eliminando el usuario ${req.params.id}`)
		return res.status(500).json(error)
	}
}

exports.update = async (req, res) => {
	try {
		req.body.pwd = bcrypt.hashSync(req.body.pwd, 10)
		const data = await Usuario.findByIdAndUpdate(req.params.id, { $set: req.body })
		delete data.pwd
		return res.send(data)
	} catch (error) {
		global.log.error(error, 500,
			`Error actualizando el usuario ${req.params.id}`)
		if (error.code == 11000) {
			return res.status(500).json({
				message: `El usuario ${req.body.usuario} ya existe`
			})
		}
		return res.status(500).json(error)
	}
}