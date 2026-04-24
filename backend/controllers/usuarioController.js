// Controlador de usuarios y autenticación
const asyncHandler = require('express-async-handler')
const jwt = require('jsonwebtoken')
const Usuario = require('../models/usuarioModel')

// Función auxiliar para generar el JWT
const generarToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d'
    })
}

// Registrar un usuario nuevo
const registrarUsuario = asyncHandler(async (req, res) => {
    const { nombre, email, password } = req.body

    if (!nombre || !email || !password) {
        res.status(400)
        throw new Error('Faltan datos requeridos (nombre, email, password)')
    }

    const usuarioExiste = await Usuario.findOne({ email })
    if (usuarioExiste) {
        res.status(400)
        throw new Error('El email ya está registrado')
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
        throw new Error('Error al crear el usuario')
    }
})

// Iniciar sesión
const loginUsuario = asyncHandler(async (req, res) => {
    const { email, password } = req.body

    if (!email || !password) {
        res.status(400)
        throw new Error('Faltan credenciales')
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
        throw new Error('Credenciales incorrectas')
    }
})

// Ver mi propio perfil
const getPerfil = asyncHandler(async (req, res) => {
    const usuario = await Usuario.findById(req.usuario._id).select('-password')

    if (usuario) {
        res.status(200).json(usuario)
    } else {
        res.status(404)
        throw new Error('Usuario no encontrado')
    }
})

// Modificar datos del perfil
const actualizarPerfil = asyncHandler(async (req, res) => {
    const usuario = await Usuario.findById(req.usuario._id)

    if (!usuario) {
        res.status(404)
        throw new Error('Usuario no encontrado')
    }

    if (req.body.email && req.body.email !== usuario.email) {
        const emailExiste = await Usuario.findOne({ email: req.body.email })
        if (emailExiste) {
            res.status(400)
            throw new Error('El email ya está en uso')
        }
    }

    usuario.nombre = req.body.nombre || usuario.nombre
    usuario.email = req.body.email || usuario.email

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

// Obtener lista completa de usuarios (Solo Admin)
const getUsuarios = asyncHandler(async (req, res) => {
    const usuarios = await Usuario.find({}).select('-password')
    res.status(200).json(usuarios)
})

// Eliminar un usuario (Solo Admin)
const eliminarUsuario = asyncHandler(async (req, res) => {
    const usuario = await Usuario.findById(req.params.id)

    if (!usuario) {
        res.status(404)
        throw new Error('Usuario no encontrado')
    }

    if (usuario._id.toString() === req.usuario._id.toString()) {
        res.status(400)
        throw new Error('No puedes eliminar tu propia cuenta')
    }

    await Usuario.findByIdAndDelete(req.params.id)

    res.status(200).json({
        mensaje: 'Usuario eliminado',
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