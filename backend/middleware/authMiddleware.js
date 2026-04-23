// ============================================================
// middleware/authMiddleware.js
// Middlewares de autenticación y autorización.
//
// Un middleware en Express es una función que se ejecuta
// ENTRE que llega la petición (req) y se envía la respuesta (res).
// Puede modificar req/res, terminar el ciclo o llamar a next().
// ============================================================

const jwt = require('jsonwebtoken')
const asyncHandler = require('express-async-handler')
const Usuario = require('../models/usuarioModel')

// ============================================================
// MIDDLEWARE 1: protect
// Verifica que el usuario tenga un JWT válido en el header.
// Se usa para proteger cualquier ruta que requiera estar logueado.
// ============================================================
const protect = asyncHandler(async (req, res, next) => {
    let token

    // Los tokens JWT se envían en el header "Authorization"
    // con el formato: "Bearer eyJhbGciOiJIUzI1NiIs..."
    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        try {
            // Extraemos solo el token (sin la palabra "Bearer ")
            // split(' ') divide en ["Bearer", "el_token"]
            // [1] toma el segundo elemento
            token = req.headers.authorization.split(' ')[1]

            // jwt.verify() decodifica y VERIFICA la firma del token
            // Si el token fue alterado o expiró, lanzará un error
            const decoded = jwt.verify(token, process.env.JWT_SECRET)

            // Con el id que viene dentro del token, buscamos al usuario en la BD
            // .select('-password') excluye el campo password de la respuesta
            req.usuario = await Usuario.findById(decoded.id).select('-password')

            if (!req.usuario) {
                res.status(401)
                throw new Error('Usuario no encontrado')
            }

            // Si todo está bien, llamamos a next() para continuar
            // al siguiente middleware o al controlador de la ruta
            next()
        } catch (error) {
            res.status(401)
            throw new Error('No autorizado, token inválido o expirado')
        }
    }

    // Si no existe token en el header, rechazamos la petición
    if (!token) {
        res.status(401)
        throw new Error('No autorizado, no se encontró el token')
    }
})

// ============================================================
// MIDDLEWARE 2: soloAdmin
// DESPUÉS de protect, verifica que el usuario tenga rol 'admin'.
// Se encadena así en las rutas: protect, soloAdmin, controlador
// ============================================================
const soloAdmin = (req, res, next) => {
    // En este punto, req.usuario ya fue poblado por el middleware "protect"
    if (req.usuario && req.usuario.rol === 'admin') {
        // Es admin: permitimos el acceso
        next()
    } else {
        res.status(403) // 403 Forbidden: autenticado pero sin permisos
        throw new Error('Acceso denegado: se requiere rol de administrador')
    }
}

module.exports = { protect, soloAdmin }