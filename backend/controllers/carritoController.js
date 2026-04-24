// Controlador del carrito de compras
const asyncHandler = require('express-async-handler')
const Carrito = require('../models/carritoModel')
const Vinilo = require('../models/viniloModel')

// Obtener el carrito actual del usuario
const getCarrito = asyncHandler(async (req, res) => {
    let carrito = await Carrito.findOne({ usuario: req.usuario._id })
        .populate('items.vinilo', 'titulo artista imagen stock precio')

    if (!carrito) {
        carrito = { usuario: req.usuario._id, items: [], total: 0 }
    }

    res.status(200).json(carrito)
})

// Agregar un ítem o aumentar su cantidad
const agregarItem = asyncHandler(async (req, res) => {
    const { viniloId, cantidad = 1 } = req.body

    if (!viniloId) {
        res.status(400)
        throw new Error('Falta el ID del vinilo')
    }

    const vinilo = await Vinilo.findById(viniloId)
    if (!vinilo) {
        res.status(404)
        throw new Error('Vinilo no encontrado')
    }

    if (vinilo.stock < cantidad) {
        res.status(400)
        throw new Error('Stock insuficiente')
    }

    let carrito = await Carrito.findOne({ usuario: req.usuario._id })

    if (!carrito) {
        // Crear carrito nuevo si no tiene
        carrito = await Carrito.create({
            usuario: req.usuario._id,
            items: [{ vinilo: viniloId, cantidad, precioUnitario: vinilo.precio }]
        })
    } else {
        // Modificar carrito existente
        const itemExistente = carrito.items.find(item => item.vinilo.toString() === viniloId)

        if (itemExistente) {
            const nuevaCantidad = itemExistente.cantidad + cantidad
            if (nuevaCantidad > vinilo.stock) {
                res.status(400)
                throw new Error('La cantidad excede el stock disponible')
            }
            itemExistente.cantidad = nuevaCantidad
        } else {
            carrito.items.push({ vinilo: viniloId, cantidad, precioUnitario: vinilo.precio })
        }
        await carrito.save()
    }

    carrito = await Carrito.findById(carrito._id).populate('items.vinilo', 'titulo artista imagen stock precio')
    res.status(200).json(carrito)
})

// Cambiar la cantidad específica de un ítem
const actualizarItem = asyncHandler(async (req, res) => {
    const { cantidad } = req.body
    const { viniloId } = req.params

    if (!cantidad || cantidad < 1) {
        res.status(400)
        throw new Error('Cantidad no válida')
    }

    const carrito = await Carrito.findOne({ usuario: req.usuario._id })
    if (!carrito) {
        res.status(404)
        throw new Error('Carrito no encontrado')
    }

    const item = carrito.items.find(item => item.vinilo.toString() === viniloId)
    if (!item) {
        res.status(404)
        throw new Error('Ítem no encontrado en el carrito')
    }

    const vinilo = await Vinilo.findById(viniloId)
    if (cantidad > vinilo.stock) {
        res.status(400)
        throw new Error('Stock insuficiente')
    }

    item.cantidad = cantidad
    await carrito.save()

    const carritoActualizado = await Carrito.findById(carrito._id).populate('items.vinilo', 'titulo artista imagen stock precio')
    res.status(200).json(carritoActualizado)
})

// Quitar un ítem del carrito
const eliminarItem = asyncHandler(async (req, res) => {
    const { viniloId } = req.params

    const carrito = await Carrito.findOne({ usuario: req.usuario._id })
    if (!carrito) {
        res.status(404)
        throw new Error('Carrito no encontrado')
    }

    const itemIndex = carrito.items.findIndex(item => item.vinilo.toString() === viniloId)
    if (itemIndex === -1) {
        res.status(404)
        throw new Error('Ítem no encontrado en el carrito')
    }

    carrito.items.splice(itemIndex, 1)
    await carrito.save()

    const carritoActualizado = await Carrito.findById(carrito._id).populate('items.vinilo', 'titulo artista imagen stock precio')
    res.status(200).json(carritoActualizado)
})

// Eliminar todos los ítems del carrito
const vaciarCarrito = asyncHandler(async (req, res) => {
    const carrito = await Carrito.findOne({ usuario: req.usuario._id })
    if (!carrito) {
        res.status(404)
        throw new Error('Carrito no encontrado')
    }

    carrito.items = []
    await carrito.save()

    res.status(200).json({ mensaje: 'Carrito vaciado', carrito })
})

// Finalizar la compra: valida, descuenta stock global y limpia carrito
const confirmarCompra = asyncHandler(async (req, res) => {
    const carrito = await Carrito.findOne({ usuario: req.usuario._id }).populate('items.vinilo')

    if (!carrito || carrito.items.length === 0) {
        res.status(400)
        throw new Error('El carrito está vacío')
    }

    // Validar el stock de todo antes de procesar
    for (const item of carrito.items) {
        if (!item.vinilo) {
            res.status(404)
            throw new Error('Un vinilo de tu carrito ya no existe')
        }
        if (item.vinilo.stock < item.cantidad) {
            res.status(400)
            throw new Error(`Stock insuficiente para: ${item.vinilo.titulo}`)
        }
    }

    // Descontar el inventario
    const resumen = []
    for (const item of carrito.items) {
        await Vinilo.findByIdAndUpdate(
            item.vinilo._id,
            { $inc: { stock: -item.cantidad } },
            { new: true }
        )
        resumen.push({
            titulo: item.vinilo.titulo,
            cantidad: item.cantidad,
            subtotal: item.precioUnitario * item.cantidad
        })
    }

    const totalCompra = carrito.total

    // Limpiar carrito al finalizar
    carrito.items = []
    await carrito.save()

    res.status(200).json({
        mensaje: 'Compra confirmada',
        resumen,
        totalCompra
    })
})

module.exports = {
    getCarrito,
    agregarItem,
    actualizarItem,
    eliminarItem,
    vaciarCarrito,
    confirmarCompra
}