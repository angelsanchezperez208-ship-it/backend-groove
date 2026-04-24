const mongoose = require('mongoose')

// Esquema del catálogo de vinilos
const viniloSchema = mongoose.Schema(
    {
        titulo: {
            type: String,
            required: [true, 'Por favor ingresa el título del álbum'],
            trim: true
        },
        artista: {
            type: String,
            required: [true, 'Por favor ingresa el nombre del artista'],
            trim: true
        },
        genero: {
            type: String,
            required: [true, 'Por favor ingresa el género musical'],
            trim: true
        },
        anio: {
            type: Number,
            required: [true, 'Por favor ingresa el año de lanzamiento']
        },
        precio: {
            type: Number,
            required: [true, 'Por favor ingresa el precio del vinilo'],
            min: [0, 'El precio no puede ser negativo']
        },
        imagen: {
            type: String,
            required: [true, 'Por favor ingresa la URL de la imagen'],
            default: 'https://via.placeholder.com/300x300?text=Sin+Imagen'
        },
        stock: {
            type: Number,
            required: [true, 'Por favor ingresa el stock disponible'],
            min: [0, 'El stock no puede ser negativo'],
            default: 0
        },
        descripcion: {
            type: String,
            trim: true,
            default: ''
        }
    },
    { timestamps: true }
)

module.exports = mongoose.model('Vinilo', viniloSchema)