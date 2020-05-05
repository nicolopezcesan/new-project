'use strict';

import mongoose from 'mongoose';
import app from './app';
var port = 3800;

// Conexión Database
let url = 'mongodb://localhost:27017/ask_question_app';
mongoose.connect(url, { useUnifiedTopology: true, useNewUrlParser: true })
    .then(() => {
        console.log('Connect successfull! :)');

        app.listen(port, () => {
            console.log('Server run on http://localhost:3800');
        });
    })
    .catch(err => console.log(err));