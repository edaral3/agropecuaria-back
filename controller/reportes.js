const db = require('../models')
const Venta = db.venta
const Producto = db.producto

const { jsPDF } = require('jspdf')
const { autoTable } = require('jspdf-autotable')


const getSalesPerDay = async (date) => {
	const data = await Venta.aggregate([
		{
			$match: {
				$and: [
					{ anulado: { $ne: true } },
					{ $expr: { $eq: [date, { $dateToString: { date: '$fecha', format: '%d/%m/%Y' } }] } }
				]
			}
		},
		{ $group: { _id: null, total: { $sum: '$total' } } }
	])

	if (data.length === 0) {
		return 0
	}

	return data[0].total

}

const getAmountSales = async (date) => {
	const data = await Venta.aggregate([
		{
			$match: {
				$and: [
					{ anulado: { $ne: true } },
					{ $expr: { $eq: [date, { $dateToString: { date: '$fecha', format: '%d/%m/%Y' } }] } }
				]
			}
		},
		{ $group: { _id: null, total: { $sum: 1 } } }
	])

	if (data.length === 0) {
		return 0
	}
	return data[0].total
}

const getAmountSalesEfectivo = async (date) => {
	const data = await Venta.aggregate([
		{
			$match: {
				$and: [
					{ anulado: { $ne: true } },
					{ $expr: { $eq: [date, { $dateToString: { date: '$fecha', format: '%d/%m/%Y' } }] } },
					{ tipoVenta: 'efectivo' }
				]
			}
		},
		{ $group: { _id: null, total: { $sum: 1 } } }
	])

	if (data.length === 0) {
		return 0
	}
	return data[0].total
}

const getUtilitys = (data) => {
	let total = 0
	for (let i = 0; i < data.cantidad.length; i++) {
		let cantidad = data.cantidad[i]
		let precioCosto = data.precioCosto[i]
		let precioVenta = data.precioVenta[i]
		for (let j = 0; j < cantidad.length; j++) {
			total += (precioVenta[j] - precioCosto[j]) * cantidad[j]
		}
	}
	return Math.round(total * 100) / 100
}

const getUtilityPerDay = async (date) => {
	const data = await Venta.aggregate([
		{
			$match: {
				$and: [
					{ anulado: { $ne: true } },
					{ $expr: { $eq: [date, { $dateToString: { date: '$fecha', format: '%d/%m/%Y' } }] } }
				]
			}
		},
		{
			$group: {
				_id: null, precioCosto: { $push: '$productos.precioCosto' },
				precioVenta: { $push: '$productos.precioVenta' },
				cantidad: { $push: '$productos.cantidad' }
			}
		}
	])
	if (data.length === 0) {
		return 0
	}
	return getUtilitys(data[0])

}

const getBillAmount = async (date) => {
	const data = await Venta.aggregate([
		{
			$match: {
				$and: [
					{ anulado: { $ne: true } },
					{ $expr: { $eq: [date, { $dateToString: { date: '$fecha', format: '%d/%m/%Y' } }] } },
					{ nit: { $ne: 'NF' } }
				]
			}
		},
		{ $group: { _id: null, total: { $sum: '$total' } } }
	])

	if (data.length === 0) {
		return 0
	}
	return data[0].total
}

const getEfectivo = async (date) => {
	const data = await Venta.aggregate([
		{
			$match: {
				$and: [
					{ anulado: { $ne: true } },
					{ $expr: { $eq: [date, { $dateToString: { date: '$fecha', format: '%d/%m/%Y' } }] } },
					{ tipoVenta: 'efectivo' }
				]
			}
		},
		{ $group: { _id: null, total: { $sum: '$total' } } }
	])

	if (data.length === 0) {
		return 0
	}
	return data[0].total
}

exports.getSalesByMont = async (req, res) => {
	const date = req.query.date
	try {
		let sort = { $sort: { _id: -1 } }
		let find = { $match: { $expr: { $eq: [date, { $dateToString: { date: '$fecha', format: '%m/%Y' } }] } } }
		let sales
		let utility
		sales = await Venta.aggregate([
			find,
			{ $group: { _id: { $dateToString: { date: '$fecha', format: '%d' } }, total: { $sum: '$total' } } },
			sort,
		])
		utility = await Venta.aggregate([
			find,
			{
				$group: {
					_id: { $dateToString: { date: '$fecha', format: '%d' } },
					precioCosto: { $push: '$productos.precioCosto' },
					precioVenta: { $push: '$productos.precioVenta' },
					cantidad: { $push: '$productos.cantidad' }
				}
			},
			sort
		])

		const data = getDataSales(sales, utility)

		return res.send(data)
	} catch (error) {
		global.log.error(error, 400, 'Error creando el reporte')
		return res.status(400).json(error)
	}
}

exports.getSalesByYear = async (req, res) => {
	const date = req.query.date
	try {
		let sort = { $sort: { _id: -1 } }
		let find = { $match: { $expr: { $eq: [date, { $dateToString: { date: '$fecha', format: '%Y' } }] } } }
		let sales
		let utility
		sales = await Venta.aggregate([
			find,
			{ $group: { _id: { $dateToString: { date: '$fecha', format: '%m' } }, total: { $sum: '$total' } } },
			sort,
		])
		utility = await Venta.aggregate([
			find,
			{
				$group: {
					_id: { $dateToString: { date: '$fecha', format: '%m' } },
					precioCosto: { $push: '$productos.precioCosto' },
					precioVenta: { $push: '$productos.precioVenta' },
					cantidad: { $push: '$productos.cantidad' }
				}
			},
			sort
		])

		const data = getDataSales(sales, utility)

		return res.send(data)
	} catch (error) {
		global.log.error(error, 400, 'Error creando el reporte')
		return res.status(400).json(error)
	}
}

exports.getSalesBySalesByRange = async (req, res) => {
	const date1 = req.query.date1
	const date2 = req.query.date2

	try {
		let find = { $match: { fecha: { $gte: new Date(date1), $lte: new Date(date2) } } }
		let _id = {
			year: { $dateToString: { date: '$fecha', format: '%Y' } },
			month: { $dateToString: { date: '$fecha', format: '%m' } },
			day: { $dateToString: { date: '$fecha', format: '%d' } }
		}
		let sales
		let utility
		sales = await Venta.aggregate([
			find,
			{
				$group: {
					_id, total: { $sum: '$total' }
				}
			},
		]).sort({ '_id.year': 1, '_id.month': 1, '_id.day': 1 })
		utility = await Venta.aggregate([
			find,
			{
				$group: {
					_id,
					precioCosto: { $push: '$productos.precioCosto' },
					precioVenta: { $push: '$productos.precioVenta' },
					cantidad: { $push: '$productos.cantidad' }
				}
			},
		]).sort({ '_id.year': 1, '_id.month': 1, '_id.day': 1 })

		const data = getDataSales(sales, utility)

		return res.send(data)
	} catch (error) {
		global.log.error(error, 400, 'Error creando el reporte')
		return res.status(400).json(error)
	}
}

exports.getTop10 = async (req, res) => {
	const date = req.query.date

	try {
		let find = { $match: { $expr: { $eq: [date, { $dateToString: { date: '$fecha', format: '%m/%Y' } }] } } }
		let data
		data = await Venta.aggregate([
			find,
			{
				$project: {
					productos: '$productos',
				}
			},
		])
		const list = []
		let list2 = []
		data.forEach(item => {
			list.push(...item.productos)
		})

		list.forEach(item => {
			if (list2.find(item2 => item.nombre === item2.nombre)) {
				list2 = list2.map(item2 => {
					if (item.nombre === item2.nombre) {
						item2.cantidad += item.cantidad
						return item2
					}
					return item2
				})
			}
			else {
				list2.push({ nombre: item.nombre, cantidad: item.cantidad })
			}
		})

		list2 = list2.sort((a, b) => {
			return b.cantidad - a.cantidad
		})

		list2 = list2.slice(0, 9)

		const labels = list2.map(item => item.nombre)
		const listSeries = list2.map(item => item.cantidad)

		return res.send({ labels, series: [listSeries] })
	} catch (error) {
		global.log.error(error, 400, 'Error creando el reporte')
		return res.status(400).json(error)
	}
}

const getDataSales = (sales, utility) => {
	let list1 = sales.map(item => {
		return item.total
	}).reverse()

	let list2 = utility.map(item => {
		return getUtilitys(item)
	}).reverse()

	let labels = utility.map(item => {
		if (item._id.year) {
			return `${item._id.day}/${item._id.month}/${item._id.year}`
		}
		return item._id
	}).reverse()

	return { labels, series: [[...list1], [...list2]] }
}

exports.getDayReports = async (req, res) => {
	const date = req.query.date
	try {
		const data = {
			ventasDiarias: await getSalesPerDay(date),
			cantidadVentas: await getAmountSales(date),
			cantidadVentasEfectivo: await getAmountSalesEfectivo(date),
			utilidadPorDia: await getUtilityPerDay(date),
			facturadoDiario: await getBillAmount(date),
			efectivoDiario: await getEfectivo(date),
		}
		return res.send(data)
	} catch (error) {
		global.log.error(error, 400, 'Error creando el reporte')
		return res.status(400).json(error)
	}
}

const getPDFHeader = (tipo) => {
	let name = ''
	switch (tipo) {
	case 1:
		name = 'Ventas por dia'
		break
	case 2:
		name = 'Ventas por mes'
		break
	case 3:
		name = 'Ventas por año'
		break
	case 4:
		name = 'Ventas por rango de tiempo'
		break
	case 5:
		name = 'Productos agotados/por agotar'
		break
	case 6:
		name = 'Productos vencidos/por vencer'
		break
	case 7:
		name = 'Listado de productos'
		break
	}
	return {
		body: [
			[
				{
					content: 'Agropecuaria Aldana',
					styles: {
						halign: 'left',
						fontSize: 20,
						textColor: '#ffffff'
					}
				},
				{
					content: name,
					styles: {
						halign: 'right',
						fontSize: 20,
						textColor: '#ffffff'
					}
				}
			],
		],
		theme: 'plain',
		styles: {
			fillColor: '#3366ff'
		}
	}
}

const getPDFDate = (tipo, date1, date2) => {
	let textDate = ''
	switch (tipo) {
	case 1:
		textDate = 'Fecha: ' + date1
		break
	case 2:
		textDate = 'Mes: ' + date1
		break
	case 3:
		textDate = 'Año: ' + date1
		break
	case 4:
		textDate = 'Fecha inicio: ' + date1
				+ '\nFecha Fin: ' + date2
		break
	}

	return {
		body: [
			[
				{
					content: textDate,
					styles: {
						halign: 'right'
					}
				}
			],
		],
		theme: 'plain'
	}
}

const getFormatDate = (date, tipo) => {
	const splitDate = date.split('/')
	let hour = ''
	if (tipo === 1) {
		hour = '00:00:00'
	} else {
		hour = '23:00:00'
	}
	const newDate = new Date(`${splitDate[2]}-${splitDate[1]}-${splitDate[0]}T${hour}.0Z`)
	return newDate
}

const getListSale = async (format, date) => {
	const data = await Venta.aggregate([
		{
			$match: {
				$expr: { $eq: [date, { $dateToString: { date: '$fecha', format: format } }] }
			}
		},
	])
	return data
}

const getListSaleRange = async (date1, date2) => {
	const isoFormatDate1 = getFormatDate(date1, 1)
	const isoFormatDate2 = getFormatDate(date2, 2)
	const data = await Venta.aggregate([
		{
			$match: {
				fecha: { $gte: isoFormatDate1, $lt: isoFormatDate2 }
			}
		},
	])

	return data
}

const getAllFind = async () => {
	return await Producto.find()
		.sort({ fecha: -1 })
}

const tableTemplateHead = [
	'Producto',
	'Cantidad',
	'Precio',
	'Impuesto',
	'Utilidades',
	'Total'
]

const getColorTble = (type) => {
	let color = '#7DCEA0'
	switch (type) {
	case 'NF':
		color = '#F4D03F'
		break
	case 'CF':
		color = '#85C1E9'
		break
	}

	return {
		theme: 'striped',
		headStyles: {
			fillColor: color
		}
	}
}

const getTaxes = (amount) => {
	return Math.round((amount - amount / 1.12) * 100) / 100
}

const getPDFSales = async (doc, format, date1, date2) => {
	const data = await getListSale(format, date1, date2)

	let total = 0
	let totalImpesto = 0
	let totalUtilidades = 0
	data.forEach(sale => {
		if (sale.anulado === undefined || sale.anulado) {
			return
		}
		const body = []
		let utilLocal = 0
		sale.productos.forEach(item => {
			let util = (item.precioVenta - item.precioCosto) * item.cantidad
			totalUtilidades += Math.round(util * 100) / 100
			utilLocal += Math.round(util * 100) / 100
			body.push([
				item.nombre, item.cantidad,
				`Q${item.precioVenta}`,
				`Q${getTaxes(item.total)}`,
				`Q${Math.round(util * 100) / 100}`,
				`Q${item.total}`
			])
		})
		if (sale.nit !== 'NF') {
			totalImpesto += getTaxes(sale.total)
		}
		body.push(['', '', 'Total', `Q${getTaxes(sale.total)}`, `Q${utilLocal}`, `Q${sale.total}`])
		total += sale.total
		doc.autoTable({
			body,
			head: [[sale.nombre, sale.nit, '', '', '', ''], tableTemplateHead],
			...getColorTble(sale.nit)
		})
	})

	return { total, totalImpesto, totalUtilidades }
}

const getPDFSaleResumen = async (doc, format, date1, date2) => {
	const data = await getListSale(format, date1, date2)

	let total = 0
	let totalImpesto = 0
	let totalUtilidades = 0
	let productos = []
	data.forEach(sale => {
		if (sale.anulado === undefined || sale.anulado) {
			return
		}
		sale.productos.forEach(item => {
			let util = (item.precioVenta - item.precioCosto) * item.cantidad
			totalUtilidades += Math.round(util * 100) / 100
			const index = productos.findIndex(producto => producto.nombre === item.nombre)
			if (index !== -1) {
				productos[index].cantidad += item.cantidad
				productos[index].impuesto += getTaxes(item.total)
				productos[index].total += item.total
				productos[index].utilidad += util
				productos[index].precioVenta.add(item.precioVenta)
			} else {
				const preciosVenta = new Set()
				preciosVenta.add(item.precioVenta)
				productos.push({
					nombre: item.nombre,
					cantidad: item.cantidad,
					utilidad: util,
					precioVenta: preciosVenta,
					impuesto: getTaxes(item.total),
					total: item.total
				})
			}
		})
		if (sale.nit !== 'NF') {
			totalImpesto += getTaxes(sale.total)
		}
		total += sale.total
	})

	const body = []
	productos.forEach(item => {
		let preciosVenta = ''
		item.precioVenta.forEach(precio => {
			preciosVenta += precio + ' '
		})
		body.push([
			item.nombre, item.cantidad,
			`Q[ ${preciosVenta}]`,
			`Q${Math.round(item.impuesto * 100) / 100}`,
			`Q${Math.round(item.utilidad * 100) / 100}`,
			`Q${Math.round(item.total * 100) / 100}`
		])
	})
	doc.autoTable({
		body,
		head: [tableTemplateHead],
		...getColorTble('CF')
	})
	return { total, totalImpesto, totalUtilidades }
}

const getPDFSaleResumenRango = async (doc, date1, date2) => {
	const data = await getListSaleRange(date1, date2)

	let total = 0
	let totalImpesto = 0
	let totalUtilidades = 0
	let productos = []
	data.forEach(sale => {
		if (sale.anulado === undefined || sale.anulado) {
			return
		}
		sale.productos.forEach(item => {
			let util = (item.precioVenta - item.precioCosto) * item.cantidad
			totalUtilidades += Math.round(util * 100) / 100
			const index = productos.findIndex(producto => producto.nombre === item.nombre)
			if (index !== -1) {
				productos[index].cantidad += item.cantidad
				productos[index].impuesto += getTaxes(item.total)
				productos[index].total += item.total
				productos[index].utilidades += util
				productos[index].precioVenta.add(item.precioVenta)
			} else {
				const preciosVenta = new Set()
				preciosVenta.add(item.precioVenta)
				productos.push({
					nombre: item.nombre,
					cantidad: item.cantidad,
					utilidades: util,
					precioVenta: preciosVenta,
					impuesto: getTaxes(item.total),
					total: item.total
				})
			}
		})
		if (sale.nit !== 'NF') {
			totalImpesto += getTaxes(sale.total)
		}
		total += sale.total
	})
	const body = []
	productos.forEach(item => {
		let preciosVenta = ''
		item.precioVenta.forEach(precio => {
			preciosVenta += precio + ' '
		})
		body.push([
			item.nombre, item.cantidad,
			`Q[ ${preciosVenta}]`,
			`Q${Math.round(item.impuesto * 100) / 100}`,
			`Q${Math.round(item.utilidades * 100) / 100}`,
			`Q${Math.round(item.total * 100) / 100}`
		])
	})
	doc.autoTable({
		body,
		head: [tableTemplateHead],
		...getColorTble('CF')
	})
	return { total, totalImpesto, totalUtilidades }
}

const getPDFSaleAll = async (doc) => {
	const data = await getAllFind()
	const body = []
	let total = 0
	data.forEach((item, index) => {
		body.push([
			index + 1,
			item.nombre,
			item.existencia,
			`Q${item.precioCosto}`,
		])
		total += item.precioCosto * item.existencia
	})
	doc.autoTable({
		body,
		head: [['#', 'Nombre', 'Cantidad', 'Precio costo']],
		...getColorTble('CF')
	})
	return total
}

const getPDFProductosPorAgotar = async (doc) => {
	const data = await getAllFind()
	const body = []
	data.forEach((item, index) => {
		if (item.existencia - item.existenciaMinima <= 0) {
			body.push([
				index + 1,
				item.nombre,
				item.existencia,
				item.existenciaMinima,
				`Q${item.precioVenta}`,
			])
		}
	})
	doc.autoTable({
		body,
		head: [['#', 'Nombre', 'Cantidad', 'Cantidad minima', 'Precio costo']],
		...getColorTble('CF')
	})
}

const getPDFProductosPorVencer = async (doc) => {
	const data = await getAllFind()
	const body = []
	data.forEach((item, index) => {
		if (item.fechaVencimiento) {
			const difference = Math.abs(item.fechaVencimiento - new Date())
			const days = difference / (1000 * 3600 * 24)
			if (days < 60) {
				body.push([
					index + 1,
					item.nombre,
					item.existencia,
					item.fechaVencimiento,
					`Q${item.precioVenta}`,
				])
			}
		}
	})
	doc.autoTable({
		body,
		head: [['#', 'Nombre', 'Cantidad', 'Fecha vencimiento', 'Precio costo']],
		...getColorTble('CF')
	})
}

const getMoneyFormat = (number) => {
	return number.toLocaleString(undefined, {
		minimumFractionDigits: 2, maximumFractionDigits: 2
	})
}

const getTotales = (totales) => {
	return {
		body: [
			[
				{
					content: 'Subtotal:',
					styles: {
						halign: 'right'
					}
				},
				{
					content: `Q${getMoneyFormat(Math.round((totales.total - totales.totalImpesto) * 100) / 100)}`,
					styles: {
						halign: 'right'
					}
				},
			],
			[
				{
					content: 'Total impuesto:',
					styles: {
						halign: 'right'
					}
				},
				{
					content: `Q${getMoneyFormat(Math.round((totales.totalImpesto) * 100) / 100)}`,
					styles: {
						halign: 'right'
					}
				},
			],
			[
				{
					content: 'Total:',
					styles: {
						halign: 'right'
					}
				},
				{
					content: `Q${getMoneyFormat(Math.round((totales.total) * 100) / 100)}`,
					styles: {
						halign: 'right'
					}
				},
			],
			[
				{
					content: 'Total Utilidades:',
					styles: {
						halign: 'right'
					}
				},
				{
					content: `Q${getMoneyFormat(Math.round((totales.totalUtilidades) * 100) / 100)}`,
					styles: {
						halign: 'right'
					}
				},
			],
		],
		theme: 'plain'
	}
}

const getTotales2 = (total) => {
	return {
		body: [
			[
				{
					content: 'Total:',
					styles: {
						halign: 'right'
					}
				},
				{
					content: `Q${getMoneyFormat(total)}`,
					styles: {
						halign: 'right'
					}
				},
			],
		],
		theme: 'plain'
	}
}

const crearReporte = async (formato, tipo, date1, date2) => {
	const doc = new jsPDF()
	doc.autoTable(getPDFHeader(tipo))
	doc.autoTable(getPDFDate(tipo, date1, date2))

	let totales
	if (tipo === 1) {
		totales = await getPDFSales(doc, formato, date1)
	}
	else if (tipo === 7) {
		const total = await getPDFSaleAll(doc)
		doc.autoTable(getTotales2(total))
	}
	else if (tipo === 5) {
		await getPDFProductosPorAgotar(doc)
	}
	else if (tipo === 4) {
		totales = await getPDFSaleResumenRango(doc, date1, date2)
	}
	else if (tipo === 6) {
		await getPDFProductosPorVencer(doc)
	}
	else {
		totales = await getPDFSaleResumen(doc, formato, date1)
	}

	if (tipo !== 7 && tipo !== 5 && tipo !== 6) {
		doc.autoTable(getTotales(totales))
	}
	return doc.output('datauristring')
}

const crearReporteDiario = async (date1, date2) => {
	return await crearReporte('%d/%m/%Y', 1, date1, date2)
}

const crearReporteMensual = async (date1) => {
	let month = date1.split('/')
	return await crearReporte('%m/%Y', 2, `${month[1]}/${month[2]}`)

}

const crearReporteAnual = async (date1) => {
	let year = date1.split('/')
	return await crearReporte('%Y', 3, year[2])
}

const crearReportePeriodo = async (date1, date2) => {
	return await crearReporte('%d/%m/%Y', 4, date1, date2)
}

const crearReporteAgotados = async () => {
	return await crearReporte('', 5)
}

const crearReportePorVencer = async () => {
	return await crearReporte('', 6)
}

const crearReporteAll = async () => {
	return await crearReporte('', 7)
}

exports.getReportePDF = async (req, res) => {
	const { tipo, date1, date2 } = req.query
	try {
		let pdf64 = ''
		switch (tipo) {
		case '1':
			pdf64 = await crearReporteDiario(date1)
			break
		case '2':
			pdf64 = await crearReporteMensual(date1)
			break
		case '3':
			pdf64 = await crearReporteAnual(date1)
			break
		case '4':
			pdf64 = await crearReportePeriodo(date1, date2)
			break
		case '5':
			pdf64 = await crearReporteAgotados()
			break
		case '6':
			pdf64 = await crearReportePorVencer()
			break
		case '7':
			pdf64 = await crearReporteAll()
			break
		}
		return res.send({ pdf: pdf64 })
	} catch (error) {
		global.log.error(error, 400, 'Error creando el reporte')
		return res.status(400).json(error)
	}
}
