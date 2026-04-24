const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')

// Esquema de usuarios
const usuarioSchema = mongoose.Schema(
    {
        nombre: {
            type: String,
            required: [true, 'Por favor ingresa tu nombre'],
            trim: true
        },
        email: {
            type: String,
            required: [true, 'Por favor ingresa tu email'],
            unique: true,
            trim: true,
            lowercase: true,
            // Regex básico para validar formato de correo
            match: [
                /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
                'Por favor ingresa un email válido'
            ]
        },
        password: {
            type: String,
            required: [true, 'Por favor ingresa una contraseña'],
            minlength: [6, 'La contraseña debe tener al menos 6 caracteres']
        },
        rol: {
            type: String,
            enum: ['usuario', 'admin'],
            default: 'usuario'
        }
    },
    { timestamps: true }
)

// Encriptar la contraseña antes de guardarla en la base de datos
usuarioSchema.pre('save', async function () {
    if (!this.isModified('password')) {
        return
    }
    const salt = await bcrypt.genSalt(10)
    this.password = await bcrypt.hash(this.password, salt)
})

// Método para comparar contraseñas al hacer login
usuarioSchema.methods.matchPassword = async function (passwordIngresada) {
    return await bcrypt.compare(passwordIngresada, this.password)
}

module.exports = mongoose.model('Usuario', usuarioSchema)