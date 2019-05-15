
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

import buildMatchCreateWithRanking from './ranking';

const DEFAULT_START_MATCH_ID = 41315000;
const MAX_POINTER_MATCH_ID = 41401862; // Until when should I seed

const MATCH_BATCH_SIZE = 20;
// When polling and no results
let fetcherRestartPoint = 0;
const NO_MATCH_FOUND_TIMEOUT = 60000;

// Getting the call done
// /match/:id -> 260ms && 6.8kb (EMPTY)
//              -> 875ms && 7.3kb (TEAM DATA)

// At the seed step I need to fill the full month backwards
// = 86862 matches / 1 month data
// = 634mb of Network + users
// = 21h at 875ms / query
// = 2h ~ with 10 parrallel ? Cloudflare stopping us?
// Matches take 5min to show in the history of IDs so we can be 5min behind.

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
        const mostRecentMatch: any = await Match.findOne({},{matchID: 1},{sort: {matchID: -1}});
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
        let nextMatch = matchID+1;
        if (fetcherRestartPoint >= nextMatch) {
            logz.send({
                message: `Restarting from ${fetcherRestartPoint}`,
                service: 'fetcher',
                matchID,
                fetcherRestartPoint
            });
            nextMatch = fetcherRestartPoint + 1;
        }

        // Now let's parse from matchID until we've caught up
        if (nextMatch > MAX_POINTER_MATCH_ID) {
            // Slow delay between checking of matches
            // Compute the incrementals?
            await new Promise(res => setTimeout(res,NO_MATCH_FOUND_TIMEOUT));
        } else {
            // We're in the seeding phase. Go fast

        }

        const {lastIndexOfHttpSuccess, matches} = await matchParser({
            start: nextMatch,
            batch: {
                batchSize: MATCH_BATCH_SIZE,
            }
        });
        // There can be no team games played in this batch
        // matches would be 0. --> matchParser needs to return the last biggest parsed index
        // to continue from
        if (!matches || matches.length === 0) {
            // It should wait proportionally longer with a minimum.
            // But that will kill me during the seed where I want the max speed.
            //
            logz.send({
                message: `Nothing in batch ${nextMatch} - ${lastIndexOfHttpSuccess}... waiting`,
                service: 'fetcher',
                matchID,
            });

            if (lastIndexOfHttpSuccess > fetcherRestartPoint) {
                fetcherRestartPoint = lastIndexOfHttpSuccess;
            }
            return 0;
        }


        // Check the users we don't have in DB
        const playersIDsInMatches: any = new Set([].concat(...matches.map(({playersID}: any): number[] => playersID)));
        const playersIDsInMatchesUnique = Array.from(playersIDsInMatches);
        const alreadyIn = await Player.find({playerID: {$in: playersIDsInMatchesUnique}},{playerID: 1});
        const alreadyInSet = new Set(alreadyIn.map(({playerID})=>playerID));

        const toFetch = playersIDsInMatchesUnique.filter((x: any) => !alreadyInSet.has(x));
        if (toFetch.length) {
            logz.send({
                message: `Missing ${toFetch.length} users , fetching...`,
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
                message: `Saved ${users.length} users, saving ${matches.length} matches...`,
                savedUsers: users.length,
                service: 'fetcher',
                matchID,
            });
        }

        // Will update only ranked speeds with ranks
        await buildMatchCreateWithRanking(matches);
        const saveMatches = await Match.create(matches);

        // Todo: Compute derived stats.
        // Figure out new ranking system
        // Invalidate express caches of playersIDs touched by the stat.

        //
        const latestPlayedInBatch = matches[matches.length-1].playedAt;
        logz.send({
            message: `Saved ${matches.length} matches. End of run()`,
            savedMatches: matches.length,
            service: 'fetcher',
            matchID,
            latestPlayedInBatch
        });
        // Insert Matches
        // Update Users Stats
        return matches && matches.length;
    }
}

export default Fetcher;
