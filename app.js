'use strict'

import express from 'express';
import { urlencoded, json } from 'body-parser';
import cors from 'cors';
import routes from './routes';

const app = express();

// middlewares
app.use(urlencoded({ extended: false }));
app.use(json());


// Cors
app.use(cors());


// Routes
app.use(routes.prefix, routes.user);


export default app;