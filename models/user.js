'use strict'

import { Schema as _Schema, model } from 'mongoose';
const Schema = _Schema;

const UserSchema = Schema({
    name: String,
    surname: String,
    nick: String,
    email: String,
    password: String,
    role: { type: String, enum: ['ADMIN', 'QUIZER', 'QUIZ_CREATOR', 'QUIZ_REVIEWER'], required: true },
    image: String
});


export default model('User', UserSchema);