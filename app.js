'use strict'

import express from 'express';
import { urlencoded, json } from 'body-parser';

const app = express();

// cargar rutas
import user_routes from './routes/user';
// import publication_routes from './routes/publication';

// middlewares
app.use(urlencoded({ extended: false }));
app.use(json()); // Nos devolverá siempre Json

// Cors
// Configurar cabeceras http
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Authorization, X-API-KEY, Origin, X-Requested-With, Content-Type, Accept, Access-Control-Allow-Request-Method');
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
    res.header('Allow', 'GET, POST, OPTIONS, PUT, DELETE');

    next();
});


// rutas
app.use('/api', user_routes);
// app.use('/api', follow_routes);
// app.use('/api', publication_routes);
// app.use('/api', message_routes);


// exportar
export default app;