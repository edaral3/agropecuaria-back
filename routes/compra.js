const express = require('express')
const router = express.Router()
const compra = require('../controller/compra')
const validator = require('../middleware/ValidatorConstructor')('compra')
const autentication = require('../middleware/auth')

router.post('/', autentication(['administrador']), validator, compra.create)

router.get('/all', autentication(['administrador', 'vendedor']), compra.getAll)

router.get('/:id', autentication(['administrador', 'vendedor']), compra.getOne)

router.delete('/:id', autentication(['administrador']), compra.delete)

router.put('/:id', autentication(['administrador']), validator, compra.update)

module.exports = router
