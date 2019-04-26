/* eslint-disable no-implicit-coercion */
/* eslint-disable no-case-declarations */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
import mongoose from 'mongoose';
import User from './models/user';
import Match, {MatchDoc} from './models/match';
import cheerio from 'cheerio';
import http from 'http';
import {logz} from './middlewares/logger';
import moment from 'moment-timezone';

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
    let $main: any = $('#block-system-main .content');
    const name = $main.find('h1').text();
    let [gameType, rankType, field, playedAt] = $main.find('p').html().split('<br>');
    // Is it a quickplay?
    // We might want to rank that on a special ladder outside from FFA/TEAM
    // TODO: us check

    gameType = gameType.toLowerCase();
    if (name === 'Match results for Quickplay') {
        gameType = 'quickplay'; // Maybe change for hardcoded consts
    }
    if (gameType === 'quickplay' || rankType === 'Unranked' || gameType === 'FFA') {
        // Don't store, only valid ranked teams
        return false;
    }
    // Check participants
    let playersID = [];
    let winningPlayersID: number[] = [];
    let losingPlayersID: number[] = [];
    let playersScores: number[] = [];
    let playersRank: number[] = [];
    let playersPointsChange: number[] = [];
    let playersPositions: number[] = [];
    let teamSize = 0;
    let tags: string[] = [];
    let winningRounds = 0;
    let losingRounds = 0;


    const mappedParticipants = $main.find('tbody tr').map((_: any,x: Node) => $(x).find('td').map((i: number,x: any)=>{
        const $td = $(x);
        const text = $td.text();
        switch (i) {
            case 0:
                // Position 1 or 2
                const pos = $td.text() === '1' ?  1 : 0;
                return pos;
            case 1:
                const [,roundForTeam, playerScore]: any = text.match(/(\d+)\s\((\d+)\)/);
                return {
                    roundForTeam,
                    playerScore
                };
            case 2:
                const userId: any = $td.find('a').attr('href').split('/').pop();
                return +userId;
            case 3:
                return +text;
            case 4:
                return +text;
        }
    }));

    Array.from(mappedParticipants).forEach((participant: any) => {
        const [pos, {roundForTeam,playerScore}, playerID, rank, pointsChange] = Array.from(participant);
        if (pos) {
            winningPlayersID.push(playerID);
            winningRounds = +roundForTeam;
        } else {
            losingPlayersID.push(playerID);
            losingRounds = +roundForTeam;
        }
        playersPositions.push(pos);
        playersRank.push(rank);
        playersScores.push(+playerScore);
        playersPointsChange.push(pointsChange);
    });

    // You can start a ranked Hot 1 vs 3 Cool. Even number doesn't mean it's
    // valid.
    if (winningPlayersID.length !== losingPlayersID.length) {
        return false;
    }

    teamSize = winningPlayersID.length;

    let itemset;


    if (field === 'Normal field') {
        itemset = 'speed';
    } else {
        itemset = 'thin';
    }

    // Convert to moment
    playedAt = moment.tz(playedAt,'dddd, DD MMMM YYYY - HH:mm','Europe/Paris').toDate();
    const matchFinal = {
        name,
        gameType,
        itemset,
        playedAt,
        karma: 0,
        winningPlayersID,
        losingPlayersID,
        playersScores,
        playersRank,
        playersPointsChange,
        playersPositions,
        teamSize,
        tags,
    };
    return Object.assign({}, matchObject, matchFinal);
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
