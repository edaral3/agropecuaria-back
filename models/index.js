//const config = require('config')
const mongoose = require('mongoose')
mongoose.Promise = global.Promise

const username = encodeURIComponent('agro')
const password = encodeURIComponent('dKsxdcXq5NeVdDNv')

const db = {}
db.mongoose = mongoose
db.url = `mongodb+srv://${username}:${password}@agropecuariaaldana.ihlmx.mongodb.net/Agropecuaria`
//db.url = `mongodb+srv://edgar:z7wB7legzrwYFjgD@agropecuariaaldana.ihlmx.mongodb.net/?retryWrites=true&w=majority`

db.proveedor = require('./proveedor')(mongoose)
db.producto = require('./producto')(mongoose)
db.cliente = require('./cliente')(mongoose)
db.compra = require('./compra')(mongoose)
db.venta = require('./venta')(mongoose)
db.vale = require('./vale')(mongoose)
db.usuario = require('./usuario')(mongoose)
db.errorLogs = require('./errorLogs')(mongoose)

module.exports = db