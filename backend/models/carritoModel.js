const mongoose = require('mongoose')

// Sub-esquema para los productos dentro del carrito
const itemCarritoSchema = mongoose.Schema(
    {
        vinilo: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Vinilo',
            required: true
        },
        cantidad: {
            type: Number,
            required: true,
            min: [1, 'La cantidad mínima es 1'],
            default: 1
        },
        // Guardamos el precio fijo por si cambia en el catálogo después
        precioUnitario: {
            type: Number,
            required: true,
            min: [0, 'El precio no puede ser negativo']
        }
    },
    { _id: false }
)

// Esquema principal del carrito
const carritoSchema = mongoose.Schema(
    {
        usuario: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Usuario',
            required: true,
            unique: true // 1 carrito por usuario
        },
        items: [itemCarritoSchema],
        total: {
            type: Number,
            default: 0,
            min: 0
        }
    },
    { timestamps: true }
)

// Calcular el total automáticamente antes de guardar
carritoSchema.pre('save', function () {
    this.total = this.items.reduce((acc, item) => {
        return acc + item.precioUnitario * item.cantidad
    }, 0)
})

module.exports = mongoose.model('Carrito', carritoSchema)