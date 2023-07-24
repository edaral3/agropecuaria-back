//const config = require('config')
const mongoose = require('mongoose')
mongoose.Promise = global.Promise

const username = encodeURIComponent(process.env.BDUSER)
const password = encodeURIComponent(process.env.BDPWD)

const db = {}
db.mongoose = mongoose
db.url = `mongodb+srv://${username}:${password}${process.env.BDURL}`

db.proveedor = require('./proveedor')(mongoose)
db.producto = require('./producto')(mongoose)
db.cliente = require('./cliente')(mongoose)
db.compra = require('./compra')(mongoose)
db.venta = require('./venta')(mongoose)
db.vale = require('./vale')(mongoose)
db.usuario = require('./usuario')(mongoose)
db.errorLogs = require('./errorLogs')(mongoose)

module.exports = db