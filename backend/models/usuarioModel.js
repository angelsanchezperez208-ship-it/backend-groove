// ============================================================
// models/usuarioModel.js
// Define el esquema y modelo de Mongoose para la colección
// "usuarios". Aquí manejamos el registro y login de usuarios,
// incluyendo el ENCRIPTADO de contraseñas con bcryptjs.
// ============================================================

const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')

const usuarioSchema = mongoose.Schema(
    {
        // Nombre completo del usuario
        nombre: {
            type: String,
            required: [true, 'Por favor ingresa tu nombre'],
            trim: true
        },

        // Email único: no puede haber dos usuarios con el mismo correo
        email: {
            type: String,
            required: [true, 'Por favor ingresa tu email'],
            unique: true, // Crea un índice único en MongoDB
            trim: true,
            lowercase: true, // Guarda siempre en minúsculas para consistencia
            // Validación simple con expresión regular para formato de email
            match: [
                /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
                'Por favor ingresa un email válido'
            ]
        },

        // Contraseña: NUNCA se guarda en texto plano.
        // Será encriptada antes de guardarse (ver el middleware de abajo)
        password: {
            type: String,
            required: [true, 'Por favor ingresa una contraseña'],
            minlength: [6, 'La contraseña debe tener al menos 6 caracteres']
        },

        // Rol del usuario: 'usuario' para clientes normales, 'admin' para administradores
        // Esto nos permitirá proteger rutas según el rol en el middleware de auth
        rol: {
            type: String,
            enum: ['usuario', 'admin'], // Solo acepta estos dos valores
            default: 'usuario'          // Por defecto, todo nuevo registro es un usuario normal
        }
    },
    {
        timestamps: true
    }
)

// ============================================================
// MIDDLEWARE DE MONGOOSE (Pre-save Hook)
// Esta función se ejecuta ANTES de guardar un documento en la BD.
// Su propósito es encriptar la contraseña usando bcrypt.
// ============================================================
usuarioSchema.pre('save', async function (next) {
    // Si la contraseña NO fue modificada (ej: solo se actualizó el nombre),
    // saltamos este paso para no volver a encriptarla
    if (!this.isModified('password')) {
        return next()
    }

    // El "salt" es un valor aleatorio que bcrypt agrega al hash para más seguridad.
    // El número (10) indica las "rondas" de procesamiento: más rondas = más seguro pero más lento.
    // 10 es el estándar recomendado para proyectos en producción.
    const salt = await bcrypt.genSalt(10)

    // Reemplazamos el texto plano de la contraseña con el hash encriptado
    this.password = await bcrypt.hash(this.password, salt)

    next() // Continuamos con el guardado
})

// ============================================================
// MÉTODO DE INSTANCIA: matchPassword
// Agregamos un método personalizado al esquema que nos permite
// comparar la contraseña ingresada en el login con el hash guardado.
// ============================================================
usuarioSchema.methods.matchPassword = async function (passwordIngresada) {
    // bcrypt.compare() compara el texto plano con el hash de forma segura
    // Devuelve true si coinciden, false si no
    return await bcrypt.compare(passwordIngresada, this.password)
}

module.exports = mongoose.model('Usuario', usuarioSchema)