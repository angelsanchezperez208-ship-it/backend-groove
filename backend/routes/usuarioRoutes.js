// Rutas de registro, login y usuarios
const express = require('express')
const router = express.Router()

const {
    registrarUsuario,
    loginUsuario,
    getPerfil,
    actualizarPerfil, // Opcional, si tienes este método en tu controller
    getUsuarios,
    eliminarUsuario   // Opcional, si tienes este método
} = require('../controllers/usuarioController')

const { protect, soloAdmin } = require('../middleware/authMiddleware')

// Públicas
router.post('/registro', registrarUsuario)
router.post('/login', loginUsuario)

// Privadas (Solo tu usuario)
router
    .route('/perfil')
    .get(protect, getPerfil)
    .put(protect, actualizarPerfil)

// Privadas (Solo Administradores)
router.get('/', protect, soloAdmin, getUsuarios)
router.delete('/:id', protect, soloAdmin, eliminarUsuario)

module.exports = router