// ============================================================
// controllers/usuarioController.js
// Lógica de negocio para autenticación de usuarios:
// registro, inicio de sesión, consulta de perfil,
// editar perfil y eliminar usuario.
// ============================================================

const asyncHandler = require('express-async-handler')
const jwt = require('jsonwebtoken')
const Usuario = require('../models/usuarioModel')

// ============================================================
// FUNCIÓN AUXILIAR: generarToken
// ============================================================
const generarToken = (id) => {
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

    if (!nombre || !email || !password) {
        res.status(400)
        throw new Error('Por favor completa todos los campos: nombre, email y contraseña')
    }

    const usuarioExiste = await Usuario.findOne({ email })
    if (usuarioExiste) {
        res.status(400)
        throw new Error('Ya existe una cuenta registrada con ese email')
    }

    const usuario = await Usuario.create({ nombre, email, password })

    if (usuario) {
        res.status(201).json({
            _id: usuario._id,
            nombre: usuario.nombre,
            email: usuario.email,
            rol: usuario.rol,
            token: generarToken(usuario._id)
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

    const usuario = await Usuario.findOne({ email })

    if (usuario && (await usuario.matchPassword(password))) {
        res.status(200).json({
            _id: usuario._id,
            nombre: usuario.nombre,
            email: usuario.email,
            rol: usuario.rol,
            token: generarToken(usuario._id)
        })
    } else {
        res.status(401)
        throw new Error('Email o contraseña incorrectos')
    }
})

// ============================================================
// @desc    Obtener perfil del usuario logueado
// @route   GET /api/usuarios/perfil
// @access  Private
// ============================================================
const getPerfil = asyncHandler(async (req, res) => {
    const usuario = await Usuario.findById(req.usuario._id).select('-password')

    if (usuario) {
        res.status(200).json(usuario)
    } else {
        res.status(404)
        throw new Error('Usuario no encontrado')
    }
})

// ============================================================
// @desc    Actualizar perfil del usuario logueado
// @route   PUT /api/usuarios/perfil
// @access  Private
// Body: { nombre, email, password } — todos opcionales
// ============================================================
const actualizarPerfil = asyncHandler(async (req, res) => {
    const usuario = await Usuario.findById(req.usuario._id)

    if (!usuario) {
        res.status(404)
        throw new Error('Usuario no encontrado')
    }

    // Si se envía un nuevo email, verificamos que no esté en uso
    if (req.body.email && req.body.email !== usuario.email) {
        const emailExiste = await Usuario.findOne({ email: req.body.email })
        if (emailExiste) {
            res.status(400)
            throw new Error('Ese email ya está en uso por otra cuenta')
        }
    }

    // Actualizamos solo los campos que se enviaron
    usuario.nombre = req.body.nombre || usuario.nombre
    usuario.email = req.body.email || usuario.email

    // Si se envía nueva contraseña, el pre-save hook la encriptará automáticamente
    if (req.body.password) {
        usuario.password = req.body.password
    }

    const usuarioActualizado = await usuario.save()

    res.status(200).json({
        _id: usuarioActualizado._id,
        nombre: usuarioActualizado.nombre,
        email: usuarioActualizado.email,
        rol: usuarioActualizado.rol,
        token: generarToken(usuarioActualizado._id)
    })
})

// ============================================================
// @desc    Obtener todos los usuarios
// @route   GET /api/usuarios
// @access  Private/Admin
// ============================================================
const getUsuarios = asyncHandler(async (req, res) => {
    const usuarios = await Usuario.find({}).select('-password')
    res.status(200).json(usuarios)
})

// ============================================================
// @desc    Eliminar un usuario por ID
// @route   DELETE /api/usuarios/:id
// @access  Private/Admin
// ============================================================
const eliminarUsuario = asyncHandler(async (req, res) => {
    const usuario = await Usuario.findById(req.params.id)

    if (!usuario) {
        res.status(404)
        throw new Error('Usuario no encontrado')
    }

    // Evitamos que un admin se elimine a sí mismo por accidente
    if (usuario._id.toString() === req.usuario._id.toString()) {
        res.status(400)
        throw new Error('No puedes eliminar tu propia cuenta desde aquí')
    }

    await Usuario.findByIdAndDelete(req.params.id)

    res.status(200).json({
        mensaje: `Usuario "${usuario.nombre}" eliminado correctamente`,
        id: req.params.id
    })
})

module.exports = {
    registrarUsuario,
    loginUsuario,
    getPerfil,
    actualizarPerfil,
    getUsuarios,
    eliminarUsuario
}