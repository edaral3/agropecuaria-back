const express = require('express')
const router = express.Router()
const producto = require('../controller/producto')
const validator = require('../middleware/ValidatorConstructor')('producto')
const autentication = require('../middleware/auth')

router.post('/', autentication(['administrador']), validator, producto.create)

router.get('/all', autentication(['administrador', 'vendedor']), producto.getAll)

router.get('/barCode/:code', autentication(['administrador', 'vendedor']), producto.getOneBarCode)

router.get('/:id', autentication(['administrador', 'vendedor']), producto.getOne)

router.delete('/:id', autentication(['administrador']), producto.delete)

router.put('/:id', autentication(['administrador']), validator, producto.update)

module.exports = router
