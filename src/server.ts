/* eslint-disable @typescript-eslint/explicit-function-return-type */
require('dotenv').config();

import app from './app';
import {logz} from './middlewares/logger';

import mongoose from 'mongoose';

import Fetcher from './fetcher';

// Use strict is implied in import with ES6 modules
const instance = app.listen(process.env.PORT);

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
            const pulled = await fetcher.run();
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
        //  fetcher.on('fetching_ended',nextRun);
        fetcher.emit('fetching_ended');
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
// https://medium.com/dbkoda/coding-efficient-mongodb-joins-97fe0627751a

// Forwarding to logz.log.io
logz.log({
    message: 'App Started',
    service: 'boot',
});

console.log(`App Started on port ${process.env.PORT}`);
