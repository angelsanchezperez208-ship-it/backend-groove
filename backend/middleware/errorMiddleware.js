// Manejador global de errores para la API
const errorHandler = (err, req, res, next) => {
    const statusCode = res.statusCode && res.statusCode !== 200
        ? res.statusCode
        : 500

    res.status(statusCode).json({
        message: err.message,
        // Ocultar el stack trace en producción por seguridad
        stack: process.env.NODE_ENV === 'production' ? null : err.stack
    })
}

module.exports = { errorHandler }