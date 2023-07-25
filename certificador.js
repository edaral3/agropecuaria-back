const axios = require('axios')
const fs = require('fs')
const decode = require('unescape')
const { v4: uuidv4 } = require('uuid')
require('dotenv').config();

const crearListaProductos = (list) => {
	const templateItem = fs.readFileSync('utilities/templateItem.xml', 'utf-8')
	let items = ''
	let sumaImpuesto = 0
	list.forEach((item, index) => {
		const totalSinImpuesto = Math.round((parseFloat(item.total) / 1.12) * 100) / 100
		const impuesto = Math.round((item.total - totalSinImpuesto) * 100) / 100
		sumaImpuesto += impuesto
		items += templateItem
			.replace('$INDEX', index + 1)
			.replace('$CANTIDAD', item.cantidad)
			.replace('$DESCRIPCION', item.nombre)
			.replace('$PUNIT', item.precioVenta)
			.replaceAll('$PTOTAL', Math.round(item.total * 100) / 100)
			.replace('$MONTOSINIMPUESTO', totalSinImpuesto)
			.replace('%IMPUESTO', impuesto)
	})

	return { items, sumaImpuesto }
}

const construirFactura = (factura) => {
	const data = crearListaProductos(factura.productos)
	let template = fs.readFileSync('utilities/templateFirmaFactura.xml', 'utf-8')
	template = template
		.replace('$UUID', uuidv4().toUpperCase())
		.replace('$FECHA', factura.fecha)
		.replace('$NIT', factura.nit)
		.replace('$NOMBRE', factura.nombre)
		.replace('$CORREO', '')
		.replace('$DIRECCIONR', factura.direccion)
		.replace('$CODIGOPOSTALR', '0')
		.replace('$ITEMS', data.items)
		.replace('$TOTALI', Math.round((data.sumaImpuesto) * 100) / 100)
		.replace('$TOTALV', Math.round((factura.total) * 100) / 100)
	return template
}

const validarRespuestas = (data) => {
	const tipoRespuesta = data.match(/<tipo_respuesta>([^<]*)<\/tipo_respuesta>/)[1]
	if (tipoRespuesta !== '0') {
		throw { message: 'Error firmando el documento' }
	}
}

const firmar = async (data) => {
	let res = await axios.post('https://api.soluciones-mega.com/api/solicitaFirma', data, {
		headers: {
			'Content-Type': 'application/xml',
			'Authorization': process.env.TOKENFEL,
		}
	})
	const documentoFirmado = res.data.match(/<xml_dte>([^<]*)<\/xml_dte>/)[1]
	//const uuid = res.data.match(/<uuid>([^<]*)<\/uuid>/)[1]
	validarRespuestas(res.data)
	return decode(documentoFirmado)
}

const solicitarFirma = async (data) => {
	data.direccion = data.direccion === "" ? "ciudad" : data.direccion;
	const factura = construirFactura(data)
	return await firmar(factura)
}

const registrarDocumentoXML = async (documentoFirmado) => {
	let templateRegistro = fs.readFileSync('utilities/templateRegistrarFactur.xml', 'utf-8')
	const uuid = uuidv4().toUpperCase()
	templateRegistro = templateRegistro.replace('&FACTURA', documentoFirmado).replace('$UUID', uuid)
	let res = await axios.post('https://apiv2.ifacere-fel.com/api/registrarDocumentoXML', templateRegistro, {
		headers: {
			'Content-Type': 'application/xml',
			'Authorization': process.env.TOKENFEL,
		}
	})
	validarRespuestas(res.data)
	return { uuid: res.data.match(/<uuid>([^<]*)<\/uuid>/)[1], uuidEmision: uuid }
}

const construirAnulacion = (data) => {
	let template = fs.readFileSync('utilities/templateFirmaAnulacion.xml', 'utf-8')
	const dateSplit = data.fechaEmicion.split('.')
	const newDate = dateSplit[0] + '.000-06:00'
	template = template
		.replace('$UUIDFA', uuidv4().toUpperCase())
		.replace('$UUIDDOCUMENTO', data.uuid)
		.replace('$NITRECEPTOR', data.nit)
		.replace('$FECHADOCUMENTO', newDate)
		.replace('$FECHAANULACION', data.fechaAnulacion)
		.replace('$MOTIVO', data.motivo)
	return template
}

const registrarAnulacion = async (documentoFirmado) => {
	let template = fs.readFileSync('utilities/templateAnulacion.xml', 'utf-8')
	const uuid = uuidv4().toUpperCase()
	template = template
		.replace('$UUID', uuidv4().toUpperCase())
		.replace('$DATA', documentoFirmado)

	let res = await axios.post('https://apiv2.ifacere-fel.com/api/anularDocumentoXML', template, {
		headers: {
			'Content-Type': 'application/xml',
			'Authorization': process.env.TOKENFEL,
		}
	})

	validarRespuestas(res.data)
	return { uuid: res.data.match(/<uuid>([^<]*)<\/uuid>/)[1], uuidEmision: uuid }
}

exports.anularFactura = async (data) => {
	try {
		const anulaicondata = construirAnulacion(data)
		const anulaiconFirmada = await firmar(anulaicondata)
		return await registrarAnulacion(anulaiconFirmada)
	} catch (error) {
		return error
	}
}

exports.leerTemplate = () => {
	return fs.readFileSync('utilities/tempateDatosCliente.xml', 'utf-8')
}

exports.crearFactra = async (data) => {
	try {
		const facturaFirmada = await solicitarFirma(data)
		return await registrarDocumentoXML(facturaFirmada)
	} catch (error) {
		return error
	}
}

exports.getTokenFel = async () => {
	try {
		const body = process.env.USERINFO;
		const newToken = await axios.post('https://apiv2.ifacere-fel.com/api/solicitarToken', body, {
			headers: {
				'Content-Type': 'application/xml',
			}
		})
		process.env.TOKENFEL = `Bearer ${newToken.data.match(/<token>([^<]*)<\/token>/)[1]}`

	} catch (error) {
		console.log("Error obteniendo el token")
	}
}