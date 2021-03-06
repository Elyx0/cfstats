import * as bodyParser from 'body-parser';
import express from 'express';
import logger from '../middlewares/logger';
import filter from '../filter';
import path from 'path';
import cors from 'cors';

// Health endpoint for load balancing
const healthEndpoint = (req: any ,res: any): void => {
    res.send({code: 200});
};

const rootEndpoint = (req: any, res: any): void => {
    const {body: {settings, components}} = req;
    if (!settings || !components) {
        throw new Error('Settings and Components parameters are required');
    }
    // res.send() adds the correct headers by default from infering
    const result = filter(settings, components);
    return res.send(result);
};

import landingEndpoint from './routes/landing';
import userEndpoint from './routes/user';
import findEndpoint from './routes/find';

const routesDefinition = {
    'GET': {
        '/health': healthEndpoint,
        '/search/:user': findEndpoint,
        '/user/:user': userEndpoint,
        '/ladder/': landingEndpoint,
        '/ping': (req: any,res: any) => res.json({pong: 1})
    },
    'POST': {
        '/': rootEndpoint,
    }
};

const loggerMiddleware = logger();

const middlewares = [
    bodyParser.json(),
    cors(),
    express.static(path.join('..','frontend','build')),
    bodyParser.urlencoded({extended: true}), // Handle JSON post for our endpoint
    loggerMiddleware
];

/**
 * Binds routes & middlewares for given app parameter
 * @param routesDefinition Routes to be partially applied
 * @param middlewares Middlewares to be partially applied
 */
export const applyMicroservicesRoutes = (routesDefinition: any, middlewares: any): any => (app: any): void => {
    // Apply the middlewares
    middlewares.forEach((middleware: any): void => app.use(middleware));

    // Apply the routes
    Object.keys(routesDefinition).forEach((method): void => {
        const routes = routesDefinition[method];
        Object.keys(routes).forEach((route): void => {
            const fn = routesDefinition[method][route];
            app[method.toLowerCase()](route,fn);
            console.log(`Setting up [${method}] ${route}`);
        });
    });
};

export default applyMicroservicesRoutes(routesDefinition, middlewares);
