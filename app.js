'use strict'

import express from 'express';
import { urlencoded, json } from 'body-parser';
import routes from './routes';

const app = express();

// middlewares
app.use(urlencoded({ extended: false }));
app.use(json());

// Cors
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Authorization, X-API-KEY, Origin, X-Requested-With, Content-Type, Accept, Access-Control-Allow-Request-Method');
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
    res.header('Allow', 'GET, POST, OPTIONS, PUT, DELETE');

    next();
});


// Routes
app.use(routes.prefix, routes.user);


export default app;