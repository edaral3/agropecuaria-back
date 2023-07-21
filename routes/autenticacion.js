const express = require('express')
const router = express.Router()
const autenticacion = require('../controller/autenticacion')

router.post('/', autenticacion.login)

router.get('/:jwt', autenticacion.validate)

module.exports = router

