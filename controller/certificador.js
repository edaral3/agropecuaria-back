const axios = require('axios').default
const fs = require('fs')
const db = require('../models')
const { updateProductLess } = require('../utilities/utils.js')
const Venta = db.venta
const { leerTemplate, anularFactura } = require('../certificador.js')
let token = ''

const solicitarTK = async () => {
	const body = process.env.USERINFO;
	const newToken = await axios.post('https://apiv2.ifacere-fel.com/api/solicitarToken', body, {
		headers: {
			'Content-Type': 'application/xml',
		}
	})
	process.env.TOKENFEL = `Bearer ${newToken.data.match(/<token>([^<]*)<\/token>/)[1]}`
}

exports.solicitarToken = async (_req, res) => {
	try {
		await solicitarTK();
	} catch (error) {
		return res.status(400).json({ message: "Error solicitando el token a megaprint" })
	}
}

exports.retornarXML = async (_req, res) => {
	try {
		const template = `<?xml version="1.0" encoding="UTF-8"?>
        <RetornaXMLRequest>
         <uuid>$UUID</uuid> 
        </RetornaXMLRequest>
        `
		let res = await axios.post('https://apiv2.ifacere-fel.com/api/retornarXML',
			template.replace('$UUID', ''), {
			headers: {
				'Content-Type': 'application/xml',
				'Authorization': process.env.TOKENFEL,
			}
		})

		res.send({ messase: 'Factura eliminada' })
	} catch (error) {
		return res.status(500).json({ message: "Error retornando XML" })
	}
}

exports.retornarPDF = async (req, res) => {
	try {
		let uuid = req.params.uuid

		const template = `<?xml version="1.0" encoding="UTF-8"?>
            <RetornaPDFRequest>
            <uuid>$UUID</uuid> 
            </RetornaPDFRequest>`
		let data
		let allOK = true;
		try {
			data = await axios.post('https://apiv2.ifacere-fel.com/api/retornarPDF',
				template.replace('$UUID', uuid), {
				headers: {
					'Content-Type': 'application/xml',
					'Authorization': process.env.TOKENFEL,
				}
			})
			allOK = false;
		} catch (error) {
			if (error?.response?.data?.error === 'invalid_token') {
				await solicitarTK();
			}
		}
		if (allOK) {
			data = await axios.post('https://apiv2.ifacere-fel.com/api/retornarPDF',
				template.replace('$UUID', uuid), {
				headers: {
					'Content-Type': 'application/xml',
					'Authorization': process.env.TOKENFEL,
				}
			})
		}
		res.send({ pdf: data.data.match(/<pdf>([^<]*)<\/pdf>/)[1] })
	} catch (error) {
		return res.status(500).json({ message: "Error solicitando el PDF a megaprint" })
	}
}

exports.anularDocumentoXML = async (req, res) => {
	const session = await db.mongoose.startSession()
	session.startTransaction()
	try {
		const { id, productos } = req.body
		await updateProductLess(productos, session)
		let uuid = await anularFactura(req.body)
		if (!uuid.uuidEmision) {
			if (uuid?.response?.data?.error === 'invalid_token') {
				await solicitarTK();
				uuid = await anularFactura(req.body);
				if (uuid) {
					throw { message: "Error anulando la factura" }
				}
			} else {
				throw { message: "Error anulando la factura" }

			}
		}
		await Venta.findByIdAndUpdate(id, {
			$set: {
				anulado: true,
			}
		}, { session })
		await session.commitTransaction()
		res.send({ messase: 'Factura eliminada' })
	} catch (error) {
		await session.abortTransaction()
		return res.status(500).json({ message: "Error anulando la factura" })
	}
	session.endSession()
}

exports.retornarDatosCliente = async (req, res) => {
	try {
		let templateFactura = leerTemplate()
		let nit = req.params.nit
		templateFactura = templateFactura.replace('$NIT', nit)
		let data
		let allOK = true;
		try {
			data = await axios.post('https://apiv2.ifacere-fel.com/api/retornarDatosCliente', templateFactura, {
				headers: {
					'Content-Type': 'application/xml',
					'Authorization': process.env.TOKENFEL,
				}
			})
			allOK = false;
		} catch (error) {
			if (error?.response?.data?.error === 'invalid_token') {
				await solicitarTK();
			}
		}
		if (allOK) {
			data = await axios.post('https://apiv2.ifacere-fel.com/api/retornarDatosCliente', templateFactura, {
				headers: {
					'Content-Type': 'application/xml',
					'Authorization': process.env.TOKENFEL,
				}
			})
		}

		const beautifulerName = (name) => {
			if (name.includes(',')) {
				return name.replace(',', '').replace(' ', ' ')
			} else {
				const splitName = name.split('  ')
				return splitName[1] + ' ' + splitName[0]
			}
		}

		if (data.data.match(/<tipo_respuesta>([^<]*)<\/tipo_respuesta>/)[1] === '0') {
			const nombre = data.data.match(/<nombre>([^<]*)<\/nombre>/)[1]
			const direccion = data.data.match(/<direccion>([^<]*)<\/direccion>/)[1]
			res.send({ nombre: beautifulerName(nombre).replace('undefined ', ''), direccion })
		} else {
			throw { message: 'El nit no existe' }
		}
	} catch (error) {
		if (error?.response?.data?.error === 'invalid_token') {
			solicitarTK();
		}
		return res.status(500).json({ message: 'Ocurrio un error al solicitar el nit' })
	}
}

exports.verificarDocumento = async (req, res) => {
	try {
		await axios.get('https://apiv2.ifacere-fel.com/api/verificarDocumento')
	} catch (error) {
		return res.status(500).json({ message: "Error verificando documento" })
	}
}
