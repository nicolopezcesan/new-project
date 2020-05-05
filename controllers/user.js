'use strict'

import User from './../models/user';

import { hash as _hash, compare } from 'bcrypt-nodejs';
import { createToken } from './../services/jwt';


const test = (req, res) => {
    const params = req.body;

    return res.status(200).send({
        message: 'Todo ok! :)',
        params
    });
}

const registerUser = (req, res) => {
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
            if (err) return res.status(404).send({ message: 'Failed request' });
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

const loginUser = (req, res) => {
    const params = req.body;
    const email = params.email;
    const password = params.password;

    User.findOne({ email: email }, (err, user) => {
        if (err) return res.status(500).send({ message: 'Failed request' });

        if (user) {
            compare(password, user.password, (err, check) => {
                if (check) {
                    if (params.gettoken) {
                        return res.status(200).send({ token: createToken(user) });
                    } else {
                        user.password = undefined;
                        return res.status(200).send({ user });
                    }
                } else {
                    return res.status(404).send({ message: 'The user could not be identified' });
                }
            });
        } else {
            return res.status(404).send({ message: 'The user could not be identified' });
        }
    })
        .exec((err, users) => {
            if (err) return res.status(404).send({ message: 'Failed request' });
            if (users && users.length >= 1) return res.status(200).send({ message: 'User trying to register already exists' });
        });
}

const updateUser = (req, res) => {
    const userId = req.params.id;
    let update = req.body;

    delete update.password;

    if (userId != req.user.sub) {
        return res.status(500).send({ message: 'You do not have permission to update user data' });
    }

    User.find({
        $or: [
            { email: update.email.toLowerCase() },
            { nick: update.nick.toLowerCase() }
        ]
    }).exec((err, users) => {
        let user_isset = false;
        users.forEach((user) => {
            if (user && user._id != userId) user_isset = true;
        });

        if (user_isset) return res.status(404).send({ message: 'The entered data is already in use' });

        User.findByIdAndUpdate(userId, update, { new: true }, (err, user) => {
            if (err) return res.status(500).send({ message: 'Failed request' });

            if (!user) return res.status(404).send({ message: 'Could not update user' });

            return res.status(200).send({ user: user });
        });
    });
}

// function getUser(req, res) {
//     var userId = req.params.id;
//     findById(userId, (err, user) => {
//         if (err) return res.status(500).send({ message: 'Error en la petición' });
//         if (!user) return res.status(404).send({ message: 'El usuario no existe' });
//         followThisUser(req.user.sub, userId).then((value) => {
//             user.password = undefined;
//             return res.status(200).send({
//                 user,
//                 following: value.following,
//                 followed: value.followed
//             });
//         });
//     });
// }


// Obtener todos los usuarios
// function getUsers(req, res) {
//     let identity_user_id = req.user.sub;

//     let page = 1;
//     if (req.params.page) page = req.params.page;

//     const itemsPerPage = 3;

//     find().sort('_id').paginate(page, itemsPerPage, (err, users, total) => {
//         if (err) return res.status(500).send({ message: 'Error en la petición' });

//         if (!users) return res.status(404).send({ message: 'No hay usuarios disponibles' });

//         followUserIds(identity_user_id).then((value) => {
//             return res.status(200).send({
//                 users,
//                 users_following: value.following,
//                 users_follow_me: value.followed,
//                 total,
//                 pages: Math.ceil(total / itemsPerPage)
//             });

//         })
//     });
// }






export default {
    test,
    registerUser,
    loginUser,
    updateUser
}
