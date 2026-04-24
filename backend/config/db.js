// Configuración y conexión a la base de datos MongoDB Atlas
const mongoose = require('mongoose')

const connectDB = async () => {
    try {
        // Conexión usando la URI de las variables de entorno 
        const conn = await mongoose.connect(process.env.MONGO_URI)

        console.log(`MongoDB Conectado: ${conn.connection.host}`.cyan.underline)
    } catch (error) {
        console.error(`Error de conexión: ${error.message}`.red.underline.bold)
        process.exit(1) // Detiene la app si la base de datos falla 
    }
}

module.exports = connectDB