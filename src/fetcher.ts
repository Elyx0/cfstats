
import {logz} from './middlewares/logger';
import {EventEmitter} from 'events';
// LifeCycle management
// Imagine joining a Company. And having no idea if the people there are
// writing bad code in another language or not so you litteraly learn their mistakes?
// How much can paradigms help in detection of wrong workflow.
//

import mongoose from 'mongoose';
import Player from './models/player';
import Match, {MatchDoc} from './models/match';

import {matchParser, userParser} from './parser';

const DEFAULT_START_MATCH_ID = 41315000;
const MAX_POINTER_MATCH_ID = 41401862; // Until when should I seed

// Getting the call done
// /match/:id -> 260ms && 6.8kb (EMPTY)
//              -> 875ms && 7.3kb (TEAM DATA)

// At the seed step I need to fill the full month backwards
// = 86862 matches / 1 month data
// = 634mb of Network + users
// = 21h at 875ms / query
// = 2h ~ with 10 parrallel ? Cloudflare stopping us?

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

        // Now let's parse from matchID until we've caught up
        if (matchID > MAX_POINTER_MATCH_ID) {
            // Slow delay between checking of matches
            // Compute the incrementals?
            await new Promise(res => setTimeout(res,1000));
        } else {
            // We're in the seeding phase. Go fast

        }

        const matches = await matchParser({
            start: matchID,
            batch: {
                batchSize: 10,
            }
        });

        if (!matches || matches.length === 0) {
            // It should wait proportionally longer with a minimum.
            // But that will kill me during the seed where I want the max speed.
            //
            logz.send({
                message: `Match ${nextMatch} did not happen yet... waiting`,
                service: 'fetcher',
                matchID,
            });
            return 0;
        }


        // Check the users we don't have in DB
        const playersIDsInMatches: any = new Set([].concat(...matches.map(({playersID}: any): number[] => playersID)));
        const playersIDsInMatchesUnique = Array.from(playersIDsInMatches);
        const alreadyIn = await Player.find({id: {$in: playersIDsInMatchesUnique}},{id: 1});
        const alreadyInSet = new Set(alreadyIn.map(({id})=>id));

        const toFetch = playersIDsInMatchesUnique.filter(x => !alreadyInSet.has(x));
        logz.send({
            message: `Missing users ${toFetch}, fetching...`,
            service: 'fetcher',
            missing: toFetch.length,
            matchID,
        });

        const users = await userParser({
            usersID: toFetch,
            batch: {
                batchSize: toFetch.length,
            }
        });

        logz.send({
            message: `Fetched ${users.length}, saving...`,
            service: 'fetcher',
            missing: toFetch.length,
            matchID,
        });

        // Insert Users
        const saveUsers = await Player.create(users);

        logz.send({
            message: `Saved ${users.length} users, saving matches...`,
            service: 'fetcher',
            matchID,
        });

        const saveMatches = await Match.create(matches);

        logz.send({
            message: `Saved ${matches.length} matches. End of run()`,
            service: 'fetcher',
            matchID,
        });
        // Insert Matches
        // Update Users Stats
        return matches || matches.length;
    }
}

export default Fetcher;
