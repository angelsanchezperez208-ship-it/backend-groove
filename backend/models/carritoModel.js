// ============================================================
// models/carritoModel.js
// Define el esquema y modelo de Mongoose para la colección
// "carritos" en MongoDB.
//
// Cada usuario tiene UN carrito. Cuando "confirma" su compra,
// el carrito se vacía y el stock de los vinilos se descuenta.
// ============================================================

const mongoose = require('mongoose')

// Sub-esquema para cada ítem dentro del carrito
// (no es un modelo propio, es un esquema embebido)
const itemCarritoSchema = mongoose.Schema(
    {
        // Referencia al vinilo — mongoose poblará los datos con .populate()
        vinilo: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Vinilo',
            required: true
        },

        // Cantidad de ese vinilo en el carrito
        cantidad: {
            type: Number,
            required: true,
            min: [1, 'La cantidad mínima es 1'],
            default: 1
        },

        // Guardamos el precio AL MOMENTO de agregar al carrito.
        // Así, si el precio cambia después, el carrito no se ve afectado.
        precioUnitario: {
            type: Number,
            required: true,
            min: [0, 'El precio no puede ser negativo']
        }
    },
    { _id: false } // Los ítems no necesitan su propio _id
)

const carritoSchema = mongoose.Schema(
    {
        // Cada carrito pertenece a UN usuario (relación 1:1)
        usuario: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Usuario',
            required: true,
            unique: true // UN carrito por usuario
        },

        // Array de ítems en el carrito
        items: [itemCarritoSchema],

        // Campo calculado: total acumulado del carrito
        // Se recalcula cada vez que se modifica el carrito
        total: {
            type: Number,
            default: 0,
            min: 0
        }
    },
    {
        timestamps: true
    }
)

// ============================================================
// MIDDLEWARE PRE-SAVE: recalcular el total automáticamente
// Cada vez que se guarda el carrito, recalculus el total
// sumando precio * cantidad de cada ítem.
// ============================================================
carritoSchema.pre('save', function () {
    this.total = this.items.reduce((acc, item) => {
        return acc + item.precioUnitario * item.cantidad
    }, 0)
})

module.exports = mongoose.model('Carrito', carritoSchema)