/* eslint-disable @typescript-eslint/explicit-function-return-type */
console.log(process.env.PORT);
require('dotenv').config();

import app from './app';
import {logz} from './middlewares/logger';

import mongoose from 'mongoose';

import Fetcher from './fetcher';

// Use strict is implied in import with ES6 modules
const instance = app.listen(process.env.PORT, (err: any) => {
    if (err) {
        console.error(err);
        process.exit(0);
    }
    logz.send({message: `App Started on port ${process.env.PORT}`});

});

const {MONGO_USER, MONGO_PASS, MONGO_HOST, MONGO_PORT} = process.env;
const dbString = `mongodb://${MONGO_USER}:${MONGO_PASS}@${MONGO_HOST}:${MONGO_PORT}`;

const setupConnection = async () => {
    console.log({
        message: `Attempting to connect to ${dbString}`
    });
    mongoose.connect(dbString, err => {
        if (err) {
            throw err;
        }
        logz.send({
            message: 'Connected to MongoDB',
        });
        // Must be kept alive
        const fetcher = new Fetcher();

        async function nextRun() {
            let pulled;
            try {
                pulled = await fetcher.run();
            } catch (err) {
                throw err;
            }
            logz.send({
                message: 'Fetcher success',
                time: Date.now(),
                err: JSON.stringify(err),
                pulled: pulled,
                service: 'fetcher',
            });
            fetcher.emit('fetching_ended');
        }

        // Loop again
        // Check memory heap,
        // We need to release everything
        fetcher.on('fetching_ended',nextRun);
        fetcher.emit('fetching_ended'); // Renable me
    });
};

//

setupConnection().catch(err => {
    logz.error({
        message: 'Fetcher error',
        time: Date.now(),
        err: JSON.stringify(err),
        service: 'fetcher',
    },err);
    process.exit(0);
});
// Mail me it's down? Respin itself?


// Graceful process ending
process.on('SIGINT', function (): void {
    console.log('SIGINT caught');
    instance.close(function (): void {
        // Forwarding to logz.io
        logz.log({
            message: 'App SIGINT caught',
            service: 'boot',
        });
        console.log('Instance closed, exiting process');
        process.exit(0);
    });
});

process.on('uncaughtException', function (err) {
    logz.error({
        message: 'Uncaught Exception error',
        time: Date.now(),
        err: JSON.stringify(err),
        service: 'fetcher',
    },err);
    process.exit(1);
});
// https://medium.com/dbkoda/coding-efficient-mongodb-joins-97fe0627751a

// Forwarding to logz.log.io
logz.log({
    message: 'Server Started',
    service: 'boot',
});

console.log(`Server Started on port ${process.env.PORT}`);
