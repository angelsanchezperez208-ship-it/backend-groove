// ============================================================
// server.js
// Punto de entrada principal del backend de Groove & Needle.
// Aquí configuramos Express, conectamos la BD y registramos
// todas las rutas y middlewares.
// ============================================================

const express = require('express')
const colors = require('colors')
const dotenv = require('dotenv').config() // Carga las variables de .env
const cors = require('cors')
const connectDB = require('./config/db')
const { errorHandler } = require('./middleware/errorMiddleware')

// ============================================================
// CONEXIÓN A LA BASE DE DATOS
// Llamamos a connectDB() al iniciar el servidor.
// Si falla, process.exit(1) detendrá el servidor.
// ============================================================
connectDB()

const app = express()

// ============================================================
// MIDDLEWARES GLOBALES
// ============================================================

// cors() permite peticiones desde otros orígenes (ej: tu frontend React en localhost:5173)
// En producción se puede configurar para aceptar solo dominios específicos
app.use(cors())

// express.json() parsea los cuerpos de petición en formato JSON
// Sin esto, req.body estaría vacío en los POST/PUT
app.use(express.json())

// express.urlencoded() parsea datos de formularios HTML (por si acaso)
app.use(express.urlencoded({ extended: false }))

// ============================================================
// RUTAS DE LA API
// Cada "use" registra un grupo de rutas bajo una URL base
// ============================================================

// Todas las rutas de vinilos → /api/vinilos
app.use('/api/vinilos', require('./routes/viniloRoutes'))

// Todas las rutas de usuarios → /api/usuarios
app.use('/api/usuarios', require('./routes/usuarioRoutes'))

app.use('/api/carrito', require('./routes/carritoRoutes'))

// Ruta raíz: útil para verificar que el servidor está en pie
// en Postman o en el browser
app.get('/', (req, res) => {
    res.json({ mensaje: '🎵 Groove & Needle API está en línea' })
})

// ============================================================
// MIDDLEWARE DE MANEJO DE ERRORES
// DEBE ir al final, después de todas las rutas.
// Express lo identifica como manejador de errores por tener 4 parámetros.
// ============================================================
app.use(errorHandler)

// ============================================================
// INICIAR EL SERVIDOR
// Render inyecta el PORT automáticamente como variable de entorno.
// En local, usamos el 5000 definido en .env.
// ============================================================
const PORT = process.env.PORT || 5000

app.listen(PORT, () => {
    console.log(
        `Servidor corriendo en modo ${process.env.NODE_ENV} en el puerto ${PORT}`.yellow.bold
    )
})