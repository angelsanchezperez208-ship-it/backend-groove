// ============================================================
// routes/carritoRoutes.js
// Define los endpoints para el carrito de compras.
// Todas las rutas son privadas (requieren token JWT).
// ============================================================

const express = require('express')
const router = express.Router()

const {
    getCarrito,
    agregarItem,
    actualizarItem,
    eliminarItem,
    vaciarCarrito,
    confirmarCompra
} = require('../controllers/carritoController')

const { protect } = require('../middleware/authMiddleware')

// Todas las rutas del carrito requieren estar logueado
router.use(protect)

// ============================================================
// GET    /api/carrito          → Ver mi carrito
// POST   /api/carrito          → Agregar un vinilo al carrito
// DELETE /api/carrito          → Vaciar todo el carrito
// ============================================================
router
    .route('/')
    .get(getCarrito)
    .post(agregarItem)
    .delete(vaciarCarrito)

// ============================================================
// POST /api/carrito/confirmar  → Confirmar compra (descuenta stock)
// ============================================================
// IMPORTANTE: esta ruta debe ir ANTES de /:viniloId
// para que Express no confunda "confirmar" con un ID
router.post('/confirmar', confirmarCompra)

// ============================================================
// PUT    /api/carrito/:viniloId → Cambiar cantidad de un ítem
// DELETE /api/carrito/:viniloId → Eliminar un ítem específico
// ============================================================
router
    .route('/:viniloId')
    .put(actualizarItem)
    .delete(eliminarItem)

module.exports = router