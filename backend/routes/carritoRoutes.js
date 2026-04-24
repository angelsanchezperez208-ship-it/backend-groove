// Rutas del carrito de compras
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

// Todas las rutas del carrito requieren estar logueado (token)
router.use(protect)

// CRUD del carrito
router
    .route('/')
    .get(getCarrito)
    .post(agregarItem)
    .delete(vaciarCarrito)

// Confirmar compra (tiene que ir antes de /:viniloId para que no choque)
router.post('/confirmar', confirmarCompra)

// Operaciones sobre un vinilo específico en el carrito
router
    .route('/:viniloId')
    .put(actualizarItem)
    .delete(eliminarItem)

module.exports = router