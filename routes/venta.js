const express = require('express')
const router = express.Router()
const venta = require('../controller/venta')
const validator = require('../middleware/ValidatorConstructor')('venta')
const autentication = require('../middleware/auth')

router.post('/conFactura', autentication(['administrador', 'vendedor']), validator, venta.create)

router.post('/sinFactura', autentication(['administrador', 'vendedor']), validator, venta.createSinFactura)

router.get('/all', autentication(['administrador', 'vendedor']), venta.getAll)

router.get('/:id', autentication(['administrador', 'vendedor']), venta.getOne)

router.delete('/:id', autentication(['administrador', 'vendedor']), venta.delete)

router.put('/:id', autentication(['administrador', 'vendedor']), validator, venta.update)

router.post('/anularVenta', autentication(['administrador', 'vendedor']), venta.anularVenta)

router.post('/createFactura', autentication(['administrador', 'vendedor']), validator, venta.createFactura)

module.exports = router
