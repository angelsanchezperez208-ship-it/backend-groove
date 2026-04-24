// ============================================================
// controllers/carritoController.js
// Lógica de negocio para el carrito de compras.
//
// Operaciones disponibles:
//  - getCarrito       → Ver mi carrito actual
//  - agregarItem      → Añadir un vinilo al carrito (o subir cantidad)
//  - actualizarItem   → Cambiar la cantidad de un ítem
//  - eliminarItem     → Quitar un vinilo del carrito
//  - vaciarCarrito    → Limpiar todo el carrito
//  - confirmarCompra  → Procesar la compra (descuenta stock real)
// ============================================================

const asyncHandler = require('express-async-handler')
const Carrito = require('../models/carritoModel')
const Vinilo = require('../models/viniloModel')

// ============================================================
// @desc    Obtener el carrito del usuario logueado
// @route   GET /api/carrito
// @access  Private
// ============================================================
const getCarrito = asyncHandler(async (req, res) => {
    // Buscamos el carrito del usuario logueado y "poblamos" los datos
    // del vinilo para obtener su nombre, imagen, etc.
    let carrito = await Carrito.findOne({ usuario: req.usuario._id })
        .populate('items.vinilo', 'titulo artista imagen stock precio')

    // Si el usuario no tiene carrito todavía, devolvemos uno vacío
    if (!carrito) {
        carrito = { usuario: req.usuario._id, items: [], total: 0 }
    }

    res.status(200).json(carrito)
})

// ============================================================
// @desc    Agregar un vinilo al carrito
// @route   POST /api/carrito
// @access  Private
// Body: { viniloId: "...", cantidad: 1 }
// ============================================================
const agregarItem = asyncHandler(async (req, res) => {
    const { viniloId, cantidad = 1 } = req.body

    // Validamos que se envió el ID del vinilo
    if (!viniloId) {
        res.status(400)
        throw new Error('Por favor proporciona el ID del vinilo')
    }

    // Verificamos que el vinilo exista en la BD
    const vinilo = await Vinilo.findById(viniloId)
    if (!vinilo) {
        res.status(404)
        throw new Error('Vinilo no encontrado')
    }

    // Verificamos que haya stock suficiente
    if (vinilo.stock < cantidad) {
        res.status(400)
        throw new Error(
            `Stock insuficiente. Disponible: ${vinilo.stock} unidad(es)`
        )
    }

    // Buscamos el carrito del usuario, o lo creamos si no existe
    let carrito = await Carrito.findOne({ usuario: req.usuario._id })

    if (!carrito) {
        // Primera vez que el usuario agrega algo: creamos su carrito
        carrito = await Carrito.create({
            usuario: req.usuario._id,
            items: [
                {
                    vinilo: viniloId,
                    cantidad,
                    precioUnitario: vinilo.precio
                }
            ]
        })
    } else {
        // El carrito ya existe: verificamos si el vinilo ya está dentro
        const itemExistente = carrito.items.find(
            (item) => item.vinilo.toString() === viniloId
        )

        if (itemExistente) {
            // El vinilo ya está en el carrito: sumamos la cantidad
            const nuevaCantidad = itemExistente.cantidad + cantidad

            // Verificamos que no supere el stock disponible
            if (nuevaCantidad > vinilo.stock) {
                res.status(400)
                throw new Error(
                    `No puedes agregar más. Stock disponible: ${vinilo.stock}, ya tienes ${itemExistente.cantidad} en el carrito`
                )
            }

            itemExistente.cantidad = nuevaCantidad
        } else {
            // Nuevo vinilo en el carrito: lo agregamos
            carrito.items.push({
                vinilo: viniloId,
                cantidad,
                precioUnitario: vinilo.precio
            })
        }

        await carrito.save() // El pre-save recalcula el total
    }

    // Poblamos los datos del vinilo antes de responder
    carrito = await Carrito.findById(carrito._id)
        .populate('items.vinilo', 'titulo artista imagen stock precio')

    res.status(200).json(carrito)
})

// ============================================================
// @desc    Actualizar la cantidad de un ítem en el carrito
// @route   PUT /api/carrito/:viniloId
// @access  Private
// Body: { cantidad: 2 }
// ============================================================
const actualizarItem = asyncHandler(async (req, res) => {
    const { cantidad } = req.body
    const { viniloId } = req.params

    // La cantidad debe ser al menos 1
    if (!cantidad || cantidad < 1) {
        res.status(400)
        throw new Error('La cantidad debe ser mayor a 0. Para eliminar, usa DELETE.')
    }

    const carrito = await Carrito.findOne({ usuario: req.usuario._id })
    if (!carrito) {
        res.status(404)
        throw new Error('No tienes un carrito activo')
    }

    const item = carrito.items.find(
        (item) => item.vinilo.toString() === viniloId
    )
    if (!item) {
        res.status(404)
        throw new Error('Este vinilo no está en tu carrito')
    }

    // Verificamos stock
    const vinilo = await Vinilo.findById(viniloId)
    if (!vinilo) {
        res.status(404)
        throw new Error('Vinilo no encontrado')
    }
    if (cantidad > vinilo.stock) {
        res.status(400)
        throw new Error(`Stock insuficiente. Disponible: ${vinilo.stock}`)
    }

    item.cantidad = cantidad
    await carrito.save()

    const carritoActualizado = await Carrito.findById(carrito._id)
        .populate('items.vinilo', 'titulo artista imagen stock precio')

    res.status(200).json(carritoActualizado)
})

// ============================================================
// @desc    Eliminar un vinilo del carrito
// @route   DELETE /api/carrito/:viniloId
// @access  Private
// ============================================================
const eliminarItem = asyncHandler(async (req, res) => {
    const { viniloId } = req.params

    const carrito = await Carrito.findOne({ usuario: req.usuario._id })
    if (!carrito) {
        res.status(404)
        throw new Error('No tienes un carrito activo')
    }

    const itemIndex = carrito.items.findIndex(
        (item) => item.vinilo.toString() === viniloId
    )
    if (itemIndex === -1) {
        res.status(404)
        throw new Error('Este vinilo no está en tu carrito')
    }

    // Eliminamos el ítem del array
    carrito.items.splice(itemIndex, 1)
    await carrito.save()

    const carritoActualizado = await Carrito.findById(carrito._id)
        .populate('items.vinilo', 'titulo artista imagen stock precio')

    res.status(200).json(carritoActualizado)
})

// ============================================================
// @desc    Vaciar completamente el carrito
// @route   DELETE /api/carrito
// @access  Private
// ============================================================
const vaciarCarrito = asyncHandler(async (req, res) => {
    const carrito = await Carrito.findOne({ usuario: req.usuario._id })
    if (!carrito) {
        res.status(404)
        throw new Error('No tienes un carrito activo')
    }

    carrito.items = []
    await carrito.save() // El pre-save recalcula total a 0

    res.status(200).json({ mensaje: 'Carrito vaciado correctamente', carrito })
})

// ============================================================
// @desc    Confirmar la compra (descuenta el stock real)
// @route   POST /api/carrito/confirmar
// @access  Private
//
// Este es el paso final: valida stock de TODOS los ítems,
// descuenta el stock de cada vinilo y vacía el carrito.
// ============================================================
const confirmarCompra = asyncHandler(async (req, res) => {
    const carrito = await Carrito.findOne({ usuario: req.usuario._id })
        .populate('items.vinilo')

    if (!carrito || carrito.items.length === 0) {
        res.status(400)
        throw new Error('Tu carrito está vacío')
    }

    // Paso 1: Validar stock de TODOS los ítems antes de descontar
    for (const item of carrito.items) {
        if (!item.vinilo) {
            res.status(404)
            throw new Error('Uno de los vinilos ya no existe en el catálogo')
        }
        if (item.vinilo.stock < item.cantidad) {
            res.status(400)
            throw new Error(
                `Stock insuficiente para "${item.vinilo.titulo}". Disponible: ${item.vinilo.stock}, en tu carrito: ${item.cantidad}`
            )
        }
    }

    // Paso 2: Descontar el stock de cada vinilo
    const resumen = []
    for (const item of carrito.items) {
        await Vinilo.findByIdAndUpdate(
            item.vinilo._id,
            { $inc: { stock: -item.cantidad } },
            { new: true }
        )
        resumen.push({
            titulo: item.vinilo.titulo,
            artista: item.vinilo.artista,
            cantidad: item.cantidad,
            subtotal: item.precioUnitario * item.cantidad
        })
    }

    const totalCompra = carrito.total

    // Paso 3: Vaciar el carrito
    carrito.items = []
    await carrito.save()

    res.status(200).json({
        mensaje: '¡Compra confirmada con éxito! ',
        resumen,
        totalCompra,
        carritoVaciado: true
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