
'use strict'

import { Router } from 'express';
import UserController from './../controllers/user';

const api = Router();

api.post('/test', UserController.test);
api.post('/register', UserController.registerUser);


export default api;