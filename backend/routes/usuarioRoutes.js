// ============================================================
// routes/usuarioRoutes.js
// Define los endpoints para el manejo de usuarios.
// ============================================================

const express = require('express')
const router = express.Router()

const {
    registrarUsuario,
    loginUsuario,
    getPerfil,
    actualizarPerfil,
    getUsuarios,
    eliminarUsuario
} = require('../controllers/usuarioController')

const { protect, soloAdmin } = require('../middleware/authMiddleware')

// ============================================================
// RUTAS PÚBLICAS
// ============================================================

// POST /api/usuarios/registro  → Crear cuenta nueva
router.post('/registro', registrarUsuario)

// POST /api/usuarios/login     → Iniciar sesión, devuelve JWT
router.post('/login', loginUsuario)

// ============================================================
// RUTAS PRIVADAS (requieren token JWT)
// ============================================================

// GET /api/usuarios/perfil     → Ver mi propio perfil
// PUT /api/usuarios/perfil     → Editar mi propio perfil
router
    .route('/perfil')
    .get(protect, getPerfil)
    .put(protect, actualizarPerfil)

// ============================================================
// RUTAS SOLO ADMIN
// ============================================================

// GET /api/usuarios            → Ver todos los usuarios
router.get('/', protect, soloAdmin, getUsuarios)

// DELETE /api/usuarios/:id     → Eliminar un usuario por ID
router.delete('/:id', protect, soloAdmin, eliminarUsuario)

module.exports = router