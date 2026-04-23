// ============================================================
// routes/usuarioRoutes.js
// Define los endpoints para el manejo de usuarios:
// registro, login y perfil.
// ============================================================

const express = require('express')
const router = express.Router()

const {
    registrarUsuario,
    loginUsuario,
    getPerfil,
    getUsuarios
} = require('../controllers/usuarioController')

const { protect, soloAdmin } = require('../middleware/authMiddleware')

// ============================================================
// RUTAS DE AUTENTICACIÓN (públicas)
// ============================================================

// POST /api/usuarios/registro  → Crear cuenta nueva
router.post('/registro', registrarUsuario)

// POST /api/usuarios/login     → Iniciar sesión, devuelve JWT
router.post('/login', loginUsuario)

// ============================================================
// RUTAS PRIVADAS (requieren token JWT)
// ============================================================

// GET /api/usuarios/perfil     → Ver mi propio perfil (usuario logueado)
router.get('/perfil', protect, getPerfil)

// GET /api/usuarios            → Ver todos los usuarios (solo admin)
router.get('/', protect, soloAdmin, getUsuarios)

module.exports = router