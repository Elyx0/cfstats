/* eslint-disable @typescript-eslint/explicit-function-return-type */
import mongoose from 'mongoose';
import User from './models/user';
import Match, {MatchDoc} from './models/match';
import cheerio from 'cheerio';
import http from 'http';
import {logz} from './middlewares/logger';

// All of matchParser, userParser and avatarParser,
// Will have some of the batching logic.
// At max a request to matchParser
// Only care about ranked team   (0)
// --> Finds 8 never seen users  (1)
// --> Gets their info + avatar  (2)
// --> So 16 request worst case. (3)

const BASE = 'http://forum.curvefever.com';

const doHttp = (url: string) => {
    return new Promise((rs, _rj) => {
        http.get(url, {}, res => {
            console.log(`[${res.statusCode}] - ${url}`);
            if (res.statusCode !== 200) {
                logz.send({
                    message: `Parser doHttp error for ${url}`,
                    time: Date.now(),
                    statusCode: res.statusCode,
                    url,
                    service: 'parser',
                }, {});
                return rs({url, rawData: res, status: res.statusCode});
            }
            let rawData = '';
            res.on('data', (chunk) => {
                rawData += chunk;
            });
            // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
            res.on('end', () => rs({url, rawData}));
        });
    });
};

const batchHttp = (tasks: string[]): Promise<any> => {
    const promBatch = tasks.map((task: any): Promise<any> => doHttp(task));
    return Promise.all(promBatch);
};

export const parseMatchHTML = ({rawData}: any) => {
    const matchObject: any = {};
    const $ = cheerio.load(rawData);
    const $main: any = $('#block-system-main .content');
    const name = $main.find('h1').text();
    let [gameType, rankType, field, playedAt] = $main.find('p').html().split('<br>');
    // Is it a quickplay?
    // We might want to rank that on a special ladder outside from FFA/TEAM
    // TODO: us check
    if (name === 'Match results for Quickplay') {
        gameType = 'quickplay'; // Maybe change for hardcoded consts
    }
    return Object.assign({}, matchObject, {
        name,
        gameType,
        itemset,
        playedAt,
        participants,
        karma,
        scores,
        ranks,
        points,
        positions,
        premium,
        createdAt,
        updatedAt,
    });
};

export const matchParser = async (opts: any = {}): Promise<any> => {
    const {start, batch} = opts;
    if (batch && batch.batchSize) {
        // BatchSize is a blind guess from start to + batchSize.
        // Some can 404 so
        const tasks = Array.from(Array(batch.batchSize), ((x, i) => {
            return `${BASE}/achtung/match/${start + i}`;
        }));
        logz.send({
            message: `Parser ready to batch ${tasks.join(',')}`,
            time: Date.now(),
            service: 'parser',
        }, {});
        const matches = await batchHttp(tasks); // 1 - 8 rawData.
        const matchesToKeep = matches.filter((match: any) => !match.statusCode && !match.rawData.match(/Match not yet recorded or outdated/)); // Keep only request that worked
        logz.send({
            message: `matchParser - Asked: ${tasks.length} - Received: ${matchesToKeep.length}`,
            time: Date.now(),
            service: 'parser',
        }, {});
        const matchesDataFromHTML = matchesToKeep.map(parseMatchHTML);
    }
    return false;
};

export const userParser = async (_opts = {}) => {

};

export const avatarParser = async (_opts = {}) => {

};


export default {
    matchParser,
    userParser,
    avatarParser,
};
