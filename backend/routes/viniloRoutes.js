// Rutas del catálogo de vinilos
const express = require('express')
const router = express.Router()

const {
    getVinilos,
    getViniloById,
    crearVinilo,
    actualizarVinilo,
    comprarVinilo,
    eliminarVinilo
} = require('../controllers/viniloController')

const { protect, soloAdmin } = require('../middleware/authMiddleware')

// Obtener todos o crear uno nuevo
router
    .route('/')
    .get(getVinilos) // Público
    .post(protect, soloAdmin, crearVinilo) // Solo admin

// Operaciones con ID específico
router
    .route('/:id')
    .get(getViniloById) // Público
    .put(protect, soloAdmin, actualizarVinilo) // Solo admin
    .delete(protect, soloAdmin, eliminarVinilo) // Solo admin

// Ruta especial para comprar
router.patch('/:id/comprar', protect, comprarVinilo)

module.exports = router