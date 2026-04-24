// Controlador para el catálogo de vinilos
const asyncHandler = require('express-async-handler')
const Vinilo = require('../models/viniloModel')

// Obtener todos los vinilos (incluye filtro de búsqueda opcional)
const getVinilos = asyncHandler(async (req, res) => {
    const busqueda = req.query.busqueda
        ? {
            $or: [
                { titulo: { $regex: req.query.busqueda, $options: 'i' } },
                { artista: { $regex: req.query.busqueda, $options: 'i' } }
            ]
          }
        : {}

    const vinilos = await Vinilo.find(busqueda)
    res.status(200).json(vinilos)
})

// Buscar un vinilo específico por ID
const getViniloById = asyncHandler(async (req, res) => {
    const vinilo = await Vinilo.findById(req.params.id)

    if (!vinilo) {
        res.status(404)
        throw new Error('Vinilo no encontrado')
    }
    res.status(200).json(vinilo)
})

// Agregar un nuevo vinilo al catálogo (Solo Admin)
const crearVinilo = asyncHandler(async (req, res) => {
    const { titulo, artista, genero, anio, precio, imagen, stock, descripcion } = req.body

    if (!titulo || !artista || !genero || !anio || !precio || !imagen) {
        res.status(400)
        throw new Error('Faltan campos obligatorios para registrar el vinilo')
    }

    const vinilo = await Vinilo.create({
        titulo,
        artista,
        genero,
        anio,
        precio,
        imagen,
        stock: stock || 0,
        descripcion: descripcion || ''
    })

    res.status(201).json(vinilo)
})

// Editar datos de un vinilo (Solo Admin)
const actualizarVinilo = asyncHandler(async (req, res) => {
    const vinilo = await Vinilo.findById(req.params.id)

    if (!vinilo) {
        res.status(404)
        throw new Error('Vinilo no encontrado')
    }

    const viniloActualizado = await Vinilo.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true, runValidators: true }
    )

    res.status(200).json(viniloActualizado)
})

// Compra rápida: descuenta 1 del stock
const comprarVinilo = asyncHandler(async (req, res) => {
    const vinilo = await Vinilo.findById(req.params.id)

    if (!vinilo) {
        res.status(404)
        throw new Error('Vinilo no encontrado')
    }

    if (vinilo.stock <= 0) {
        res.status(400)
        throw new Error('Este vinilo está agotado')
    }

    const viniloActualizado = await Vinilo.findByIdAndUpdate(
        req.params.id,
        { $inc: { stock: -1 } },
        { new: true }
    )

    res.status(200).json({
        mensaje: 'Compra exitosa',
        vinilo: viniloActualizado
    })
})

// Eliminar un vinilo (Solo Admin)
const eliminarVinilo = asyncHandler(async (req, res) => {
    const vinilo = await Vinilo.findById(req.params.id)

    if (!vinilo) {
        res.status(404)
        throw new Error('Vinilo no encontrado')
    }

    await Vinilo.findByIdAndDelete(req.params.id)

    res.status(200).json({
        mensaje: 'Vinilo eliminado correctamente',
        id: req.params.id
    })
})

module.exports = {
    getVinilos,
    getViniloById,
    crearVinilo,
    actualizarVinilo,
    comprarVinilo,
    eliminarVinilo
}