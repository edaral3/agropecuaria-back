const express = require('express')
const router = express.Router()
const cliente = require('../controller/cliente')
const validator = require('../middleware/ValidatorConstructor')('cliente')
const autentication = require('../middleware/auth')

router.post('/', autentication(['administrador', 'vendedor']), validator, cliente.create)

router.get('/all', autentication(['administrador', 'vendedor']), cliente.getAll)

router.get('/:id', autentication(['administrador', 'vendedor']), cliente.getOne)

router.delete('/:id', autentication(['administrador']), cliente.delete)

router.put('/:id', autentication(['administrador']), validator, cliente.update)

module.exports = router
