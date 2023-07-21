const express = require('express')
const router = express.Router()
const certificador = require('../controller/certificador')
const autentication = require('../middleware/auth')

router.post('/solicitarToken', autentication(['administrador', 'vendedor']), certificador.solicitarToken)

router.post('/retornarXML', autentication(['administrador', 'vendedor']), certificador.retornarXML)

router.post('/retornarPDF/:uuid', autentication(['administrador', 'vendedor']), certificador.retornarPDF)

router.post('/anularDocumentoXML', autentication(['administrador', 'vendedor']), certificador.anularDocumentoXML)

router.get('/retornarDatosCliente/:nit', autentication(['administrador', 'vendedor']), certificador.retornarDatosCliente)

router.post('/verificarDocumento', autentication(['administrador', 'vendedor']), certificador.verificarDocumento)

module.exports = router
