// ============================================================
// controllers/usuarioController.js
// Lógica de negocio para autenticación de usuarios:
// registro, inicio de sesión y consulta de perfil.
// ============================================================

const asyncHandler = require('express-async-handler')
const jwt = require('jsonwebtoken')
const Usuario = require('../models/usuarioModel')

// ============================================================
// FUNCIÓN AUXILIAR: generarToken
// Crea y firma un JWT con el ID del usuario.
// El token vivirá 30 días (configurable).
// ============================================================
const generarToken = (id) => {
    // jwt.sign(payload, secreto, opciones)
    // payload: datos que queremos guardar dentro del token
    // secreto: clave privada para firmar (viene de .env)
    // expiresIn: tiempo de vida del token
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d'
    })
}

// ============================================================
// @desc    Registrar un nuevo usuario
// @route   POST /api/usuarios/registro
// @access  Public
// ============================================================
const registrarUsuario = asyncHandler(async (req, res) => {
    const { nombre, email, password } = req.body

    // Validación: todos los campos son obligatorios
    if (!nombre || !email || !password) {
        res.status(400)
        throw new Error('Por favor completa todos los campos: nombre, email y contraseña')
    }

    // Verificamos si ya existe un usuario con ese email
    // findOne() busca el PRIMER documento que coincida con el filtro
    const usuarioExiste = await Usuario.findOne({ email })

    if (usuarioExiste) {
        res.status(400)
        throw new Error('Ya existe una cuenta registrada con ese email')
    }

    // Creamos el usuario. La contraseña se encriptará automáticamente
    // gracias al middleware pre('save') que definimos en el modelo.
    const usuario = await Usuario.create({
        nombre,
        email,
        password // Se encripta en el modelo antes de guardarse
    })

    // Si el usuario fue creado exitosamente, respondemos con sus datos
    // y un TOKEN para que quede logueado de inmediato
    if (usuario) {
        res.status(201).json({
            _id: usuario._id,
            nombre: usuario.nombre,
            email: usuario.email,
            rol: usuario.rol,
            token: generarToken(usuario._id) // Generamos y enviamos el JWT
        })
    } else {
        res.status(400)
        throw new Error('Datos de usuario inválidos')
    }
})

// ============================================================
// @desc    Iniciar sesión (Login)
// @route   POST /api/usuarios/login
// @access  Public
// ============================================================
const loginUsuario = asyncHandler(async (req, res) => {
    const { email, password } = req.body

    if (!email || !password) {
        res.status(400)
        throw new Error('Por favor ingresa tu email y contraseña')
    }

    // Buscamos al usuario por email
    const usuario = await Usuario.findOne({ email })

    // Verificamos que el usuario exista Y que la contraseña coincida
    // matchPassword() es el método que definimos en el modelo para comparar con bcrypt
    if (usuario && (await usuario.matchPassword(password))) {
        // Login exitoso: devolvemos los datos y un nuevo token
        res.status(200).json({
            _id: usuario._id,
            nombre: usuario.nombre,
            email: usuario.email,
            rol: usuario.rol,
            token: generarToken(usuario._id)
        })
    } else {
        // Usamos el mismo mensaje para email y contraseña incorrectos
        // por seguridad (no revelar cuál de los dos es incorrecto)
        res.status(401)
        throw new Error('Email o contraseña incorrectos')
    }
})

// ============================================================
// @desc    Obtener perfil del usuario logueado
// @route   GET /api/usuarios/perfil
// @access  Private (requiere token JWT)
// ============================================================
const getPerfil = asyncHandler(async (req, res) => {
    // req.usuario fue agregado por el middleware "protect"
    // Simplemente lo devolvemos (sin password, gracias al .select('-password'))
    const usuario = await Usuario.findById(req.usuario._id).select('-password')

    if (usuario) {
        res.status(200).json(usuario)
    } else {
        res.status(404)
        throw new Error('Usuario no encontrado')
    }
})

// ============================================================
// @desc    Obtener todos los usuarios (solo para admin)
// @route   GET /api/usuarios
// @access  Private/Admin
// ============================================================
const getUsuarios = asyncHandler(async (req, res) => {
    // .select('-password') excluye las contraseñas de la respuesta
    const usuarios = await Usuario.find({}).select('-password')
    res.status(200).json(usuarios)
})

module.exports = {
    registrarUsuario,
    loginUsuario,
    getPerfil,
    getUsuarios
}