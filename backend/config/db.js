// ============================================================
// config/db.js
// Configuración y conexión a MongoDB Atlas usando Mongoose.
// Este archivo es idéntico en concepto al de tu proyecto de
// calculadora, pero adaptado para Groove & Needle.
// ============================================================

const mongoose = require('mongoose')

// Función asíncrona que establece la conexión con la base de datos
const connectDB = async () => {
    try {
        // mongoose.connect() recibe la URI desde las variables de entorno (.env)
        // y devuelve una promesa con el objeto de conexión
        const conn = await mongoose.connect(process.env.MONGO_URI)

        // Si la conexión es exitosa, mostramos el host en consola con colores
        console.log(`MongoDB Conectado: ${conn.connection.host}`.cyan.underline)
    } catch (error) {
        // Si hay un error (credenciales incorrectas, sin red, etc.), lo mostramos
        console.error(`Error: ${error.message}`.red.underline.bold)
        // process.exit(1) termina el proceso con código de error
        // Así el servidor NO arranca si no hay BD disponible
        process.exit(1)
    }
}

module.exports = connectDB