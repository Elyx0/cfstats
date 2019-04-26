
import {logz} from './middlewares/logger';
import {EventEmitter} from 'events';
// LifeCycle management
// Imagine joining a Company. And having no idea if the people there are
// writing bad code in another language or not so you litteraly learn their mistakes?
// How much can paradigms help in detection of wrong workflow.
//

import mongoose from 'mongoose';
import User from './models/user';
import Match, {MatchDoc} from './models/match';

import matchParser from './parser';

const DEFAULT_START_MATCH_ID = 41315000;

// Getting the call done
// /match/:id -> 260ms && 6.8kb (EMPTY)
//              -> 875ms && 7.3kb (TEAM DATA)

// At the seed step I need to fill the full month backwards
// = 86862 matches / 1 month data
// = 634mb of Network + users
// = 21h at 875ms / query

class Fetcher extends EventEmitter {
    public constructor() {
        super();
    }
    // Main entry point and this promise will be chained with itself. Forever.
    public async run(): Promise<any> {
        logz.send({
            message: 'Fetcher started',
            time: Date.now(),
            service: 'fetcher',
        });
        let parsed = 0;
        const mostRecentMatch: any = await Match.findOne({},{matchID: 1},{sort: {matchID: 1}});
        const matchID = (mostRecentMatch && mostRecentMatch.matchID) || DEFAULT_START_MATCH_ID;
        logz.send({
            message: 'Latest match entry processed: ' + matchID,
            service: 'fetcher',
            matchID,
        });

        // matchID can be down --> 10, 11 (deleted), 12;
        // it should still create an empty row to know where to go from on the next tick
        // what if i'm too soon --> Won't exist either yet.
        // I actually need to wait until I get the next no matter what
        const nextMatch = matchID+1;
        const match = await matchParser();

        if (!match) {
            // It should wait proportionally longer with a minimum.
            // But that will kill me during the seed where I want the max speed.
            //
            logz.send({
                message: `Match ${nextMatch} did not happen yet... waiting`,
                service: 'fetcher',
                matchID,
            });
        }
        // Now let's parse from matchID until we've caught up
        return await new Promise(res => setTimeout(res,200,match));
    }
}

export default Fetcher;
