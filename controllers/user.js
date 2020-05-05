'use strict'

import { hash as _hash, compare } from 'bcrypt-nodejs';
import User, { find, findOne, findById, findByIdAndUpdate } from './../models/user';
// const Publication = require('../models/publication');

import { createToken } from './../services/jwt';
// import MongoosePaginate from '../libraries/mongoose-pagination';
import { unlink, exists as _exists } from 'fs';
import { resolve } from 'path';

function pruebas(req, res) {
    const params = req.body;

    return res.status(200).send({
        message: 'Todo ok! :)'
    });
}

function registerUser(req, res) {
    let params = req.body;
    let user = new User();

    if (params.name && params.surname
        && params.nick && params.email && params.password) {

        user.name = params.name;
        user.surname = params.surname;
        user.nick = params.nick;
        user.email = params.email;
        user.role = params.role;
        user.image = null;

        // Check users duplicate
        User.find({
            $or: [
                { email: user.email.toLowerCase() },
                { nick: user.nick.toLowerCase() }
            ]
        }).exec((err, users) => {
            if (err) return res.status(404).send({ message: 'Petition failed' });
            if (users && users.length >= 1) return res.status(200).send({ message: 'User trying to register already exists' });
        });

        // Hash password & Register User.
        _hash(params.password, null, null, (err, hash) => {
            user.password = hash;
            user.save((err, userStored) => {
                if (err) return res.status(404).send({ message: 'Error saving user' });

                if (userStored) {
                    return res.status(200).send({ user: userStored });
                } else {
                    return res.status(404).send({ message: 'User has not registered' });
                }
            })
        });

    } else {
        return res.status(200).send({
            message: 'Send all the fields required'
        });
    }
}

// Login de usuario
function loginUser(req, res) {
    const params = req.body;
    const email = params.email;
    const password = params.password;

    findOne({ email: email }, (err, user) => {
        if (err) return res.status(500).send({ message: 'Error en la petición' });

        if (user) {
            compare(password, user.password, (err, check) => {
                if (check) {
                    if (params.gettoken) {
                        // Generar y devolver token
                        return res.status(200).send({ token: createToken(user) });
                    } else {
                        user.password = undefined;
                        return res.status(200).send({ user });
                    }
                } else {
                    return res.status(404).send({ message: 'El usuario no se ha podido identificar' });
                }
            });
        } else {
            return res.status(404).send({ message: 'El usuario no se ha podido identificar' });
        }
    })
        .exec((err, users) => {
            if (err) return res.status(404).send({ message: 'Error en la petición de usuarios' });
            if (users && users.length >= 1) return res.status(200).send({ message: 'El usuario que intenta registrar ya existe' });
        });
}




function getUser(req, res) {
    var userId = req.params.id;
    findById(userId, (err, user) => {
        if (err) return res.status(500).send({ message: 'Error en la petición' });
        if (!user) return res.status(404).send({ message: 'El usuario no existe' });
        followThisUser(req.user.sub, userId).then((value) => {
            user.password = undefined;
            return res.status(200).send({
                user,
                following: value.following,
                followed: value.followed
            });
        });
    });
}


// Obtener todos los usuarios
function getUsers(req, res) {
    let identity_user_id = req.user.sub;

    let page = 1;
    if (req.params.page) page = req.params.page;

    const itemsPerPage = 3;

    find().sort('_id').paginate(page, itemsPerPage, (err, users, total) => {
        if (err) return res.status(500).send({ message: 'Error en la petición' });

        if (!users) return res.status(404).send({ message: 'No hay usuarios disponibles' });

        followUserIds(identity_user_id).then((value) => {
            return res.status(200).send({
                users,
                users_following: value.following,
                users_follow_me: value.followed,
                total,
                pages: Math.ceil(total / itemsPerPage)
            });

        })
    });
}



// Edición de datos del usuario
function updateUser(req, res) {
    const userId = req.params.id;
    const update = req.body;

    delete update.password;

    if (userId != req.user.sub) {
        return res.status(500).send({ message: 'No tienes permiso para actualizar los datos del usuario' });
    }

    find({
        $or: [
            { email: update.email.toLowerCase() },
            { nick: update.nick.toLowerCase() }
        ]
    }).exec((err, users) => {
        let user_isset = false;
        users.forEach((user) => {
            if (user && user._id != userId) user_isset = true;
        });

        if (user_isset) return res.status(404).send({ message: 'Los datos ingresados ya están en uso' });

        findByIdAndUpdate(userId, update, { new: true }, (err, user) => {
            if (err) return res.status(500).send({ message: 'Error en la petición' });

            if (!user) return res.status(404).send({ message: 'No se ha podido actualizar el usuario' });

            return res.status(200).send({ user: user });
        });
    });
}

// Subir archivos de imagen/avatar de usuario
function uploadImage(req, res) {
    const userId = req.params.id;

    try {
        const file_path = req.files.image.path;

        const file_split = file_path.split('\\');
        const file_name = file_split[2];
        const ext_split = file_name.split('\.');
        const file_ext = ext_split[1];


        if (userId != req.user.sub) {
            return removeFilesOfUploads(res, file_path, 'No tienes permiso para actualizar los datos del usuario');
        }

        if (file_ext == 'png' || file_ext == 'jpg' || file_ext == 'jpeg' || file_ext == 'gif') {
            // Actualizar documento de usuario logueado
            findByIdAndUpdate(userId, { image: file_name }, { new: true }, (err, userUpdated) => {
                if (err) return res.status(500).send({ message: 'Error en la petición' });
                if (!userUpdated) return res.status(404).send({ message: 'No se ha podido actualizar los datos del usuario' });
                return res.status(200).send({ user: userUpdated });
            });
        } else {
            // En caso de que la extensión sea incorrecta
            return removeFilesOfUploads(res, file_path, 'La extensión no es Valida');
        }

    } catch {
        return res.status(200).send({ message: 'No se han subido imagenes' });
    }

}

function removeFilesOfUploads(res, file_path, message) {
    unlink(file_path, (err) => {
        return res.status(200).send({ message: message });
    });
}

function getImageFile(req, res) {
    const image_file = req.params.imageFile;
    const path_file = './uploads/users/' + image_file;

    _exists(path_file, (exists) => {
        if (exists) {
            res.sendFile(resolve(path_file));
        } else {
            return res.status(200).send({ message: 'No existe la imagen..' });
        }
    });
}



export default {
    pruebas,
    registerUser,
    // loginUser,
    // getUser,
    // getUsers,
    // updateUser,
    // uploadImage,
    // getImageFile
}
