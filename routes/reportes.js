const express = require('express')
const router = express.Router()
const reportes = require('../controller/reportes')
//const autentication = require('../middleware/auth')

router.get('/ReportedDiarios', reportes.getDayReports)

router.get('/SalesByMonth', reportes.getSalesByMont)

router.get('/SalesByYear', reportes.getSalesByYear)

router.get('/SalesByRange', reportes.getSalesBySalesByRange)

router.get('/top10', reportes.getTop10)

router.get('/GenerarReporte', reportes.getReportePDF)

router.get('/top10ABC', reportes.getTop10ABC)

router.get('/inventoryExcel', reportes.inventoryExcel)

module.exports = router
