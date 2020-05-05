
'use strict'

import { Router } from 'express';
// import { saveUser, loginUser, getUser, getUsers, getCounters, updateUser, uploadImage, getImageFile } from '../controllers/user';
import UserController from './../controllers/user';
// import { ensureAuth } from '../middlewares/authenticated';

const api = Router();
// import multipart from 'connect-multiparty';
// const md_upload = multipart({ uploadDir: './uploads/users' });

// api.get('/pruebas', md_auth.ensureAuth, UserController.pruebas);
api.post('/pruebas', UserController.pruebas);
api.post('/register', UserController.registerUser);
// api.post('/login', loginUser);
// api.get('/user/:id', ensureAuth, getUser);
// api.get('/users/:page?', ensureAuth, getUsers);
// api.get('/counters/:id?', ensureAuth, getCounters);
// api.put('/update-user/:id', ensureAuth, updateUser);
// api.post('/upload-image-user/:id', [ensureAuth, md_upload], uploadImage);
// api.get('/get-image-user/:imageFile', ensureAuth, getImageFile);

export default api;