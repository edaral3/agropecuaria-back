const express = require('express')
const router = express.Router()
const proveedor = require('../controller/proveedor')
const validator = require('../middleware/ValidatorConstructor')('proveedor')
const autentication = require('../middleware/auth')

router.post('/', autentication(['administrador', 'vendedor']), validator, proveedor.create)

router.get('/all', autentication(['administrador', 'vendedor']), proveedor.getAll)

router.get('/:id', autentication(['administrador', 'vendedor']), proveedor.getOne)

router.delete('/:id', autentication(['administrador']), proveedor.delete)

router.put('/:id', autentication(['administrador']), validator, proveedor.update)

module.exports = router
