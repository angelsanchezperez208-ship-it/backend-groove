// ============================================================
// routes/viniloRoutes.js
// Define los endpoints (URLs) para la colección de vinilos
// y los conecta con sus controladores.
//
// Aquí también aplicamos los middlewares de autenticación
// para proteger las rutas que lo requieren.
// ============================================================

const express = require('express')
const router = express.Router()

// Importamos los controladores
const {
    getVinilos,
    getViniloById,
    crearVinilo,
    actualizarVinilo,
    comprarVinilo,
    eliminarVinilo
} = require('../controllers/viniloController')

// Importamos los middlewares de autenticación
const { protect, soloAdmin } = require('../middleware/authMiddleware')

// ============================================================
// RUTAS PRINCIPALES: /api/vinilos
// ============================================================

// GET  /api/vinilos        → Obtener todos los vinilos (público)
// POST /api/vinilos        → Crear un vinilo (solo admin)
router
    .route('/')
    .get(getVinilos)
    .post(protect, soloAdmin, crearVinilo)
    // protect → verifica que haya token JWT válido
    // soloAdmin → verifica que el rol sea 'admin'

// ============================================================
// RUTAS POR ID: /api/vinilos/:id
// ============================================================

// GET    /api/vinilos/:id  → Ver un vinilo específico (público)
// PUT    /api/vinilos/:id  → Actualizar datos del vinilo (solo admin)
// DELETE /api/vinilos/:id  → Eliminar un vinilo (solo admin)
router
    .route('/:id')
    .get(getViniloById)
    .put(protect, soloAdmin, actualizarVinilo)
    .delete(protect, soloAdmin, eliminarVinilo)

// ============================================================
// RUTA DE COMPRA: /api/vinilos/:id/comprar
// ============================================================

// PATCH /api/vinilos/:id/comprar → Restar 1 del stock (usuario logueado)
// Solo necesita protect, no soloAdmin (cualquier usuario puede comprar)
router
    .route('/:id/comprar')
    .patch(protect, comprarVinilo)

module.exports = router