// ============================================================
// models/viniloModel.js
// Define el ESQUEMA y MODELO de Mongoose para la colección
// "vinilos" en MongoDB.
//
// Un esquema en Mongoose es como el "molde" o "plantilla" que
// define qué campos tendrá cada documento en la colección,
// su tipo de dato y sus validaciones.
// ============================================================

const mongoose = require('mongoose')

// Definimos el esquema del vinilo
const viniloSchema = mongoose.Schema(
    {
        // Título del álbum (ej: "The Dark Side of the Moon")
        titulo: {
            type: String,
            required: [true, 'Por favor ingresa el título del álbum'],
            trim: true // Elimina espacios al inicio y al final
        },

        // Nombre del artista o banda (ej: "Pink Floyd")
        artista: {
            type: String,
            required: [true, 'Por favor ingresa el nombre del artista'],
            trim: true
        },

        // Género musical (ej: "Progressive Rock")
        genero: {
            type: String,
            required: [true, 'Por favor ingresa el género musical'],
            trim: true
        },

        // Año de lanzamiento del álbum (ej: 1973)
        anio: {
            type: Number,
            required: [true, 'Por favor ingresa el año de lanzamiento']
        },

        // Precio en pesos mexicanos (ej: 850)
        // Lo guardamos como Number para poder hacer cálculos
        precio: {
            type: Number,
            required: [true, 'Por favor ingresa el precio del vinilo'],
            min: [0, 'El precio no puede ser negativo']
        },

        // URL de la imagen de la portada del álbum
        imagen: {
            type: String,
            required: [true, 'Por favor ingresa la URL de la imagen'],
            default: 'https://via.placeholder.com/300x300?text=Sin+Imagen'
        },

        // Stock o existencias disponibles en la tienda
        // Este campo es clave: se reducirá con cada "compra"
        stock: {
            type: Number,
            required: [true, 'Por favor ingresa el stock disponible'],
            min: [0, 'El stock no puede ser negativo'],
            default: 0
        },

        // Descripción del álbum (opcional)
        descripcion: {
            type: String,
            trim: true,
            default: ''
        }
    },
    {
        // timestamps: true hace que Mongoose agregue automáticamente
        // los campos "createdAt" y "updatedAt" a cada documento
        timestamps: true
    }
)

// Exportamos el modelo llamado 'Vinilo'.
// Mongoose usará este nombre para crear/buscar la colección "vinilos" en MongoDB
// (convierte el nombre a minúsculas y plural automáticamente)
module.exports = mongoose.model('Vinilo', viniloSchema)