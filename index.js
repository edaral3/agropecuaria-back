var http = require('http');
const fs = require("fs");
const https = require('https')

const express = require('express')
const path = require('path')
const cookieParser = require('cookie-parser')
require('dotenv').config();

var cors = require('cors')

const productoRouter = require('./routes/producto')
const proveedorRouter = require('./routes/proveedor')
const reportesRouter = require('./routes/reportes')
const usuarioRouter = require('./routes/usuario')
const clienteRouter = require('./routes/cliente')
const compraRouter = require('./routes/compra')
const ventaRouter = require('./routes/venta')
const valeRouter = require('./routes/vale')
const certificadorRouter = require('./routes/certificador')
const autenticacionRouter = require('./routes/autenticacion')
const root = require('./routes/root')

const app = express()

const getCors = (allow) => {
	const restrictedCors = {
		origin: ['https://www.agropecuaria-aldana.com', 'https://agropecuaria-aldana.com'],
		methods: ['GET', 'POST', 'DELETE', 'UPDATE', 'PUT'],
		headers: ['authorization', 'Content-Type']
	}

	return allow === 'true' ? null : restrictedCors
}

app.use(cors(getCors(process.env.COSR)))

app.use(express.json())
//app.use(express.urlencoded({ extended: false }))
//app.use(cookieParser())
//app.use(express.static(path.join(__dirname, 'public')))

//Mongodb
const db = require('./models/index')
db.mongoose.set('strictQuery', true);
db.mongoose
	.connect(db.url,
		{
			useNewUrlParser: true,
			useUnifiedTopology: true,
			retryWrites: false

		})
	.then(() => {
		console.log('Se nexion exitosa con la base de datos')
	})
	.catch(err => {
		console.log('No se pudo conectar a la base de datos', err)
		process.exit()
	})
// Endpoints
app.use('/', root)
app.use('/productos', productoRouter)
app.use('/proveedor', proveedorRouter)
app.use('/usuario', usuarioRouter)
app.use('/cliente', clienteRouter)
app.use('/compra', compraRouter)
app.use('/venta', ventaRouter)
app.use('/vale', valeRouter)
app.use('/autenticacion', autenticacionRouter)
app.use('/reportes', reportesRouter)
app.use('/certificador', certificadorRouter)

const PORT = process.env.PORT;
app.set('port', PORT);

const getServer = (isCertificate) => {
	return isCertificate === 'true' ? https.createServer(
		{
			key: fs.readFileSync("key.pem"),
			cert: fs.readFileSync("cert.pem"),
		},
		app
	) : http.createServer(app);
}

const server = getServer(process.env.ISCERTIFICATE);
server.listen(PORT)
server.on('listening', onListening);


function onListening() {
	server.address();
	console.log('Listening on ' + PORT);
}

module.exports = app