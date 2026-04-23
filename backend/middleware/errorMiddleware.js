// ============================================================
// middleware/errorMiddleware.js
// Manejador global de errores para Express.
// Captura cualquier error lanzado con "throw new Error(...)"
// en los controladores y devuelve una respuesta JSON limpia.
// ============================================================

const errorHandler = (err, req, res, next) => {
    // Si ya se asignó un statusCode al response (ej: res.status(400)),
    // lo usamos; si no, usamos 500 (Internal Server Error)
    const statusCode = res.statusCode && res.statusCode !== 200
        ? res.statusCode
        : 500

    res.status(statusCode).json({
        // Mostramos el mensaje del error
        message: err.message,

        // El "stack trace" (ruta del error en el código) SOLO se muestra
        // en desarrollo. En producción se oculta por seguridad.
        stack: process.env.NODE_ENV === 'production' ? null : err.stack
    })
}

module.exports = { errorHandler }