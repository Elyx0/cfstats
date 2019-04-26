
import {logz} from './middlewares/logger';
import {EventEmitter} from 'events';
// LifeCycle management
// Imagine joining a Company. And having no idea if the people there are
// writing bad code in another language or not so you litteraly learn their mistakes?
// How much can paradigms help in detection of wrong workflow.
//


class Fetcher extends EventEmitter {
    public constructor() {
        super();
    }
    // Main entry point and this promise will be chained with itself. Forever.
    public async run(): Promise<any> {
        let parsed = 0;
        logz.send({
            message: 'Fetcher started',
            time: Date.now(),
            service: 'fetcher',
        });
        return parsed;
    }
}

export default Fetcher;
