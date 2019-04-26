/* eslint-disable @typescript-eslint/explicit-function-return-type */
require('dotenv').config();

import app from './app';
import {logz} from './middlewares/logger';

// Use strict is implied in import with ES6 modules
const instance = app.listen(process.env.PORT);

import Fetcher from './fetcher';

// Must be kept alive
const fetcher = new Fetcher();

async function nextRun() {
    try {
        await fetcher.run();
    } catch (err) {
        console.error(err);
        logz.send({
            message: 'Fetcher error',
            time: Date.now(),
            err,
            service: 'fetcher',
        });
    }
    fetcher.emit('fetching_ended');
}

// Loop again
// Check memory heap,
// We need to release everything
fetcher.on('fetching_ended',nextRun);


// Graceful process ending
process.on('SIGTERM', function (): void {
    console.log('SIGTERM caught');
    instance.close(function (): void {
        // Forwarding to logz.io
        logz.log({
            message: 'App SIGTERM caught',
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
