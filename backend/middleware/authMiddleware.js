const jwt = require('jsonwebtoken')
const asyncHandler = require('express-async-handler')
const Usuario = require('../models/usuarioModel')

// Proteger rutas verificando el token JWT
const protect = asyncHandler(async (req, res, next) => {
    let token

    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        try {
            // Extraer token del header (Formato: "Bearer token...")
            token = req.headers.authorization.split(' ')[1]

            // Verificar firma del token
            const decoded = jwt.verify(token, process.env.JWT_SECRET)

            // Buscar al usuario por ID excluyendo la contraseña
            req.usuario = await Usuario.findById(decoded.id).select('-password')

            if (!req.usuario) {
                res.status(401)
                throw new Error('Usuario no encontrado')
            }

            next()
        } catch (error) {
            res.status(401)
            throw new Error('No autorizado, token inválido o expirado')
        }
    }

    if (!token) {
        res.status(401)
        throw new Error('No autorizado, no se encontró el token')
    }
})

// Verificar que el usuario tenga rol de administrador
const soloAdmin = (req, res, next) => {
    if (req.usuario && req.usuario.rol === 'admin') {
        next()
    } else {
        res.status(403)
        throw new Error('Acceso denegado: se requiere rol de administrador')
    }
}

module.exports = { protect, soloAdmin }