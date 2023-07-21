const express = require('express')
const router = express.Router()
const usuario = require('../controller/usuario')
const validator = require('../middleware/ValidatorConstructor')('usuario')
const autentication = require('../middleware/auth')

router.post('/', autentication(['administrador']), validator, usuario.create)

router.get('/all', autentication(['administrador']), usuario.getAll)

router.get('/:id', autentication(['administrador']), usuario.getOne)

router.delete('/:id', autentication(['administrador']), usuario.delete)

router.put('/:id', autentication(['administrador']), validator, usuario.update)

module.exports = router
