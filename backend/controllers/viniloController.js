// ============================================================
// controllers/viniloController.js
// Contiene la LÓGICA DE NEGOCIO para cada operación del CRUD
// de la colección "vinilos".
//
// asyncHandler envuelve las funciones async para que cualquier
// error sea capturado automáticamente y enviado a errorMiddleware,
// sin necesidad de escribir try/catch en cada función.
// ============================================================

const asyncHandler = require('express-async-handler')
const Vinilo = require('../models/viniloModel')

// ============================================================
// @desc    Obtener todos los vinilos (con búsqueda opcional)
// @route   GET /api/vinilos
// @access  Public (cualquiera puede ver el catálogo)
// ============================================================
const getVinilos = asyncHandler(async (req, res) => {
    // Funcionalidad de búsqueda: si viene ?busqueda=floyd en la URL,
    // filtramos por título o artista usando expresiones regulares
    // Si no viene, el objeto queda vacío {} y devuelve todos
    const busqueda = req.query.busqueda
        ? {
            $or: [
                { titulo: { $regex: req.query.busqueda, $options: 'i' } },   // 'i' = case insensitive
                { artista: { $regex: req.query.busqueda, $options: 'i' } }
            ]
          }
        : {}

    // find() con el objeto de búsqueda devuelve todos los documentos que coincidan
    const vinilos = await Vinilo.find(busqueda)

    res.status(200).json(vinilos)
})

// ============================================================
// @desc    Obtener un vinilo por su ID
// @route   GET /api/vinilos/:id
// @access  Public
// ============================================================
const getViniloById = asyncHandler(async (req, res) => {
    // req.params.id captura el :id dinámico de la URL
    const vinilo = await Vinilo.findById(req.params.id)

    // Si no se encuentra el vinilo con ese ID, respondemos con 404
    if (!vinilo) {
        res.status(404)
        throw new Error('Vinilo no encontrado')
    }

    res.status(200).json(vinilo)
})

// ============================================================
// @desc    Crear un nuevo vinilo en el catálogo
// @route   POST /api/vinilos
// @access  Private/Admin (solo administradores)
// ============================================================
const crearVinilo = asyncHandler(async (req, res) => {
    // Destructuramos los campos del cuerpo de la petición (req.body)
    const { titulo, artista, genero, anio, precio, imagen, stock, descripcion } = req.body

    // Validación manual: verificamos que los campos requeridos estén presentes
    if (!titulo || !artista || !genero || !anio || !precio || !imagen) {
        res.status(400)
        throw new Error('Por favor completa todos los campos requeridos: título, artista, género, año, precio e imagen')
    }

    // Vinilo.create() inserta el nuevo documento en la colección
    const vinilo = await Vinilo.create({
        titulo,
        artista,
        genero,
        anio,
        precio,
        imagen,
        stock: stock || 0,    // Si no se envía stock, por defecto es 0
        descripcion: descripcion || ''
    })

    // 201 Created: el recurso fue creado exitosamente
    res.status(201).json(vinilo)
})

// ============================================================
// @desc    Actualizar un vinilo (datos generales)
// @route   PUT /api/vinilos/:id
// @access  Private/Admin (solo administradores)
// ============================================================
const actualizarVinilo = asyncHandler(async (req, res) => {
    const vinilo = await Vinilo.findById(req.params.id)

    if (!vinilo) {
        res.status(404)
        throw new Error('Vinilo no encontrado')
    }

    // findByIdAndUpdate() busca por ID, aplica los cambios de req.body
    // { new: true } → devuelve el documento YA ACTUALIZADO (no el viejo)
    // { runValidators: true } → aplica las validaciones del esquema al actualizar
    const viniloActualizado = await Vinilo.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true, runValidators: true }
    )

    res.status(200).json(viniloActualizado)
})

// ============================================================
// @desc    Comprar un vinilo (resta 1 unidad del stock)
// @route   PATCH /api/vinilos/:id/comprar
// @access  Private (cualquier usuario logueado)
//
// Usamos PATCH porque es una actualización PARCIAL de un recurso.
// PUT sería para reemplazar el documento completo.
// ============================================================
const comprarVinilo = asyncHandler(async (req, res) => {
    const vinilo = await Vinilo.findById(req.params.id)

    if (!vinilo) {
        res.status(404)
        throw new Error('Vinilo no encontrado')
    }

    // Verificamos que haya stock antes de procesar la "compra"
    if (vinilo.stock <= 0) {
        res.status(400)
        throw new Error('Lo sentimos, este vinilo está agotado (sin stock)')
    }

    // $inc es un operador de MongoDB que INCREMENTA un campo numéricamente
    // Usamos -1 para RESTAR una unidad al stock
    const viniloActualizado = await Vinilo.findByIdAndUpdate(
        req.params.id,
        { $inc: { stock: -1 } }, // Resta 1 al campo "stock"
        { new: true }
    )

    res.status(200).json({
        mensaje: `¡Compra exitosa! Stock restante de "${viniloActualizado.titulo}": ${viniloActualizado.stock}`,
        vinilo: viniloActualizado
    })
})

// ============================================================
// @desc    Eliminar un vinilo del catálogo
// @route   DELETE /api/vinilos/:id
// @access  Private/Admin
// ============================================================
const eliminarVinilo = asyncHandler(async (req, res) => {
    const vinilo = await Vinilo.findById(req.params.id)

    if (!vinilo) {
        res.status(404)
        throw new Error('Vinilo no encontrado')
    }

    await Vinilo.findByIdAndDelete(req.params.id)

    res.status(200).json({
        mensaje: `Vinilo "${vinilo.titulo}" eliminado correctamente`,
        id: req.params.id
    })
})

// Exportamos todas las funciones para usarlas en las rutas
module.exports = {
    getVinilos,
    getViniloById,
    crearVinilo,
    actualizarVinilo,
    comprarVinilo,
    eliminarVinilo
}