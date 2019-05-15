/* eslint-disable no-implicit-coercion */
/* eslint-disable no-case-declarations */
/* eslint-disable @typescript-eslint/explicit-function-return-type */

import cheerio from 'cheerio';
import {http} from 'follow-redirects';
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
        http.get(url, res => {
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

export const parseMemberFor = (value: string) => {
    let years: any =  /(?<years>\d+(?= year))/.exec(value);
    years = years ? years[0] : 0;

    let months: any =  /(?<months>\d+(?= month))/.exec(value);
    months = months ? months[0] : 0;

    let days: any =  /(?<days>\d+(?= day))/.exec(value);
    days = days ? days[0] : 0;

    const now = moment.tz('Europe/Paris');
    const ago = now.clone().subtract({years,months,days}).toDate();
    return ago;
};

export const parseUserHTML = ({rawData}: any) => {
    const userObject: any = {};
    const $ = cheerio.load(rawData);
    const name = $('#page-title').text();
    const country = $('.field-type-country .even').text();
    const byTwo = Array.from($('dl').children()).reduce((acc: any,elem: any,i)=> i % 2 === 0 ? (acc.push([elem]),acc) : (acc[acc.length-1].push(elem),acc),[]);

    let playerID: any = $('meta[http-equiv="X-Yadis-Location"]').attr('content').split('/').slice(-2).shift();
    playerID = +(playerID);
    let champion = false;
    let premium = false;
    let rank2 = 0;
    let rank3 = 0;
    let rank4 = 0;
    let karma = 0;
    let total2v2Games = 0;
    let total3v3Games = 0;
    let total4v4Games = 0;
    let totalOldGames = 0;
    let totalNewGames = 0;
    let speedWin = 0;
    let thinWin = 0;
    let avatarURL = '';
    let title = null;
    let startedAt = new Date();
    let clans: string[] = [];

    byTwo.forEach((couple: string[]) => {
        const heading = $(couple[0]).text();
        let value =  $(couple[1]).text();
        if (heading === 'Member for') {
            userObject.startedAt = parseMemberFor(value);
        }
        if (heading === 'Premium member') {
            userObject.premium = true;
        }
        if (heading === 'Champion') {
            userObject.champion = true;
        }
        if (heading === 'number of games played') {
            userObject.totalOldGames = +value;
        }
    });
    // Is it a quickplay?
    // We might want to rank that on a special ladder outside from FFA/TEAM
    // TODO: us check
    const userFinal = {
        playerID,
        title,
        name,
        rank2,
        rank3,
        rank4,
        total2v2Games,
        total3v3Games,
        total4v4Games,
        totalOldGames,
        totalNewGames,
        clans,
        champion,
        karma,
        premium,
        speedWin,
        thinWin,
        avatarURL,
        country,
        startedAt,
    };
    return Object.assign({}, userFinal, userObject);
};

export const parseMatchHTML = ({rawData}: any) => {
    const matchObject: any = {};
    const $ = cheerio.load(rawData);
    let $main: any = $('#block-system-main .content');
    let matchID: any = $('.breadcrumb a').eq(1).attr('href').split('/').pop();
    console.log('Parsing ---->', matchID);
    matchID = +matchID;
    const name = $main.find('h1').text();
    let [gameType, rankType, field, playedAt] = $main.find('p').html().split('<br>');
    // Is it a quickplay?
    // We might want to rank that on a special ladder outside from FFA/TEAM
    // TODO: us check

    gameType = gameType.toLowerCase();
    if (name === 'Match results for Quickplay') {
        gameType = 'quickplay'; // Maybe change for hardcoded consts
    }
    if (gameType !== 'team' || rankType === 'Unranked') {
        // Don't store, only valid ranked teams
        return false;
    }
    // Check participants
    let playersID: number[] = [];
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
    let totalRounds = 0;


    const mappedParticipants = $main.find('tbody tr').map((_: any,x: Node) => $(x).find('td').map((i: number,x: any)=>{
        const $td = $(x);
        const text = $td.text();
        switch (i) {
            case 0:
                // Position 1 or 2
                const pos = $td.text() === '1' ?  1 : 0;
                return pos;
            case 1:
                // RoundForTeam and Playerscore
                const [,roundForTeam, playerScore]: any = text.match(/(\d+)\s\((\d+)\)/);
                return {
                    roundForTeam,
                    playerScore
                };
            case 2:
                // If the user deletes its profile the link will be gone but the game is still valid
                // and must not inpact the calculations
                let userId: any = false;
                try {
                    userId = $td.find('a').attr('href').split('/').pop();
                } catch {
                    userId = false; // Try to find him in DB?
                }
                return +userId;
            case 3:
                // Rank
                const rank = text.match(/\d+/) || 0;
                return +rank;
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
        playersID.push(playerID);
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
    totalRounds = winningRounds + losingRounds;
    let itemset;


    if (field === 'Normal field') {
        itemset = 'speed';
    } else {
        itemset = 'thin';
    }

    if (name.match(/thin/i)) {
        itemset = 'thin';
    }

    const filterDeletedUsersFromArray = (arr: any) => arr.filter(Boolean);

    // Apply filter
    [playersID, winningPlayersID,losingPlayersID] = [playersID, winningPlayersID,losingPlayersID].map(filterDeletedUsersFromArray);
    // Convert to moment
    playedAt = moment.tz(playedAt,'dddd, DD MMMM YYYY - HH:mm','Europe/Paris').toDate();
    const matchFinal = {
        name,
        field,
        matchID,
        gameType,
        itemset,
        playedAt,
        karma: 0,
        playersID,
        winningPlayersID,
        losingPlayersID,
        playersScores,
        playersRank,
        totalRounds,
        playersPointsChange,
        playersPositions,
        teamSize,
        tags,
        winningRounds,
        losingRounds,
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
            message: `Parser ready to batch ${tasks.length} matches `,
            time: Date.now(),
            service: 'parser',
        }, {});
        const matches = await batchHttp(tasks); // 1 - 8 rawData.
        const matchesToKeep = matches.filter((match: any) => !match.status && !match.rawData.match(/Match not yet recorded or outdated/)); // Keep only request that worked

        logz.send({
            message: `matchParser - Asked: ${tasks.length} - Received: ${matchesToKeep.length} - Keeping ${matchesToKeep.length}`,
            time: Date.now(),
            service: 'parser',
        }, {});

        const matchesDataFromHTML = matchesToKeep.map(parseMatchHTML).filter(Boolean);
        let lastIndexOfHttpSuccess = start-1;
        if (matchesToKeep.length) {
            lastIndexOfHttpSuccess = +(matchesToKeep[matchesToKeep.length-1].url.split('/').pop());
        }
        return {
            matches: matchesDataFromHTML,
            lastIndexOfHttpSuccess// The last match to poll from if not results
        };
    }
    return false;
};

export const commentLinkExtractor = ({rawData}: any) => {
    const $ = cheerio.load(rawData);
    return $('.views-field-subject a').first().attr('href');
};

export const userParser = async (opts: any = {}): Promise<any> => {
    const {usersID, batch} = opts;
    if (batch && batch.batchSize) {
        // BatchSize is a blind guess from start to + batchSize.
        // Some can 404 so
        const tasks = usersID.map((userID: number) => {
            return `${BASE}/user/${userID}`;
        });
        logz.send({
            message: `Parser ready to batch users ${tasks.join(',')}`,
            time: Date.now(),
            service: 'parser',
        }, {});
        const user = await batchHttp(tasks); // 1 - 8 rawData.
        const usersToKeep = user.filter((match: any) => !match.status && !match.rawData.match(/Match not yet recorded or outdated/)); // Keep only request that worked
        logz.send({
            message: `userParser - Asked: ${tasks.length} - Received: ${usersToKeep.length}`,
            time: Date.now(),
            service: 'parser',
        }, {});

        const userDataFromHTML = usersToKeep.map(parseUserHTML).filter(Boolean);

        // // Comments Parsing + Avatar finding should never stop the flow of saving a user
        // // Now fetch avatar for these people from the forum
        // const commentsTask = userDataFromHTML.map(({playerID}: any) => {
        //     return `${BASE}/user/${playerID}/`;
        // }); // subset with max 8
        // const comments = await batchHttp(commentsTask);

        // // No view fields if no entry
        // const commentsToKeep = comments.filter((match: any) => !match.statusCode && match.rawData.match(/views-field views-field-subject/)); // Keep only request that worked
        // logz.send({
        //     message: `commentParser - Asked: ${commentsTask.length} - Received: ${commentsToKeep.length}`,
        //     time: Date.now(),
        //     service: 'parser',
        // }, {});

        // const forumsTask = commentsToKeep.map(commentLinkExtractor);

        // // Now visit the links

        // // Set the avatar on the correct userDataFromHTML
        return userDataFromHTML;
    }
    return false;
};


export const avatarParser = async (_opts = {}) => {

};


export default {
    matchParser,
    userParser,
    avatarParser,
};
