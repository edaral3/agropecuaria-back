const express = require('express')
const router = express.Router()
const vale = require('../controller/vale')
const validator = require('../middleware/ValidatorConstructor')('vale')
const pago = require('../middleware/ValidatorConstructor')('pago')
const autentication = require('../middleware/auth')

router.post('/', autentication(['administrador', 'vendedor']), vale.create)

router.post('/pago/:id', autentication(['administrador', 'vendedor']), pago, vale.pago)

router.post('/estado', autentication(['administrador', 'vendedor']), vale.estado)

router.get('/all', autentication(['administrador', 'vendedor']), vale.getAll)

router.get('/:id', autentication(['administrador', 'vendedor']), vale.getOne)

router.delete('/:id', autentication(['administrador']), vale.delete)

router.put('/:id', autentication(['administrador', 'vendedor']), validator, vale.update)

module.exports = router
