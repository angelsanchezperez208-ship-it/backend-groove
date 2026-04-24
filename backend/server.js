// Archivo principal del servidor
const express = require('express')
const colors = require('colors')
const dotenv = require('dotenv').config()
const cors = require('cors')
const connectDB = require('./config/db')
const { errorHandler } = require('./middleware/errorMiddleware')

// Conectar a MongoDB
connectDB()

const app = express()

// Middlewares
app.use(cors()) // Permite que el front de React se conecte
app.use(express.json()) // Para poder leer JSON en los req.body
app.use(express.urlencoded({ extended: false }))

// Rutas de la API
app.use('/api/vinilos', require('./routes/viniloRoutes'))
app.use('/api/usuarios', require('./routes/usuarioRoutes'))
app.use('/api/carrito', require('./routes/carritoRoutes'))

// Ruta de prueba para Postman/Navegador
app.get('/', (req, res) => {
    res.json({ mensaje: 'API de Groove & Needle funcionando' })
})

// Manejo de errores global
app.use(errorHandler)

// Iniciar servidor
const PORT = process.env.PORT || 5000

app.listen(PORT, () => {
    console.log(`Servidor corriendo en el puerto ${PORT}`.yellow.bold)
})