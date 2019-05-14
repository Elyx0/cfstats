require('dotenv').config();
import mongoose from 'mongoose';
import Player from './models/player';
import Match, {MatchDoc} from './models/match';
import {logz} from './middlewares/logger';
import {rate, Rating, quality, winProbability} from 'ts-trueskill';

const {MONGO_USER, MONGO_PASS, MONGO_HOST, MONGO_PORT} = process.env;
const dbString = `mongodb://${MONGO_USER}:${MONGO_PASS}@${MONGO_HOST}:${MONGO_PORT}`;


const setupConnection = async () => {
    console.log({
        message: `Attempting to connect to ${dbString}`
    });
    await mongoose.connect(dbString);
};


// Make 2v2 3v3 4v4 {speed,thin} rankings if not exist
const addRankingToMatches = async (matches: any[], memory: any): Promise<any> => {
    const {users} = memory; // User is a memory set {rank2,rank3,rank4}
    let i = 0;
    for (let match of matches) {
        // Grab users playing this game
        const {
            playersID,
            winningPlayersID,
            losingPlayersID,
            teamSize,
        } = match;
        // Grab db users into the Map
        const rankKey = `rank${teamSize}`;
        playersID.forEach((playerID: number): void => {
            if (!users.has(playerID)) {
                // He never played ever
                users.set(playerID,{});
            }
            let player = users.get(playerID);
            if (!player[rankKey] || !player[rankKey].mu) {
                player = Object.assign(player,{[rankKey]: new Rating()});
                users.set(playerID,player);
            }

        });

        const team1 = winningPlayersID.map((x: number) => users.get(x)).map((user: any) => user[rankKey]);
        const team2 = losingPlayersID.map((x: number) => users.get(x)).map((user: any) => user[rankKey]);
        if (team1.length !== team2.length) {
            continue;
        }

        const [rated1, rated2] = rate([team1, team2]);

        const qualityScore = quality([team1, team2]);
        const winProbabilityTeam1 = winProbability(team1,team2);
        const winProbabilityTeam2 = 1 - winProbabilityTeam1;
        const extractRating = (x: any): number => x.mu;
        const extractMuPiSigmaTau = (arr: any[]) => arr.map(({pi,tau,sigma,mu}) => ({pi,tau,sigma,mu}));
        // https://boostlog.io/@vithalreddy/push-and-pop-items-into-mongodb-array-via-mongoose-in-nodejs-5a8c3a95a7e5b7008ae1d809
        // if (match.ratings) {
        //     for (let matchRating of match.ratings) {
        //         matchRating.remove();
        //         await match.save();
        //     }

        //     // Not enough time to actually do it?
        // } else {
        match.ratings = [];
        // }
        match.ratings.push(...extractMuPiSigmaTau(rated1),...extractMuPiSigmaTau(rated2));

        match.winProbabilityTeam1 = winProbabilityTeam1,
        match.winProbabilityTeam2 = winProbabilityTeam2,
        match.qualityScore = qualityScore;

        const matchRatingsChange = [...rated1,...rated2].map((rating: any,index: number): any => {
            const playerID = playersID[index];
            // console.log(`Before: ${player} : ${extractRating(users.get(player))}`);
            const player = users.get(playerID);
            const playerRank = player[rankKey].mu;
            player[rankKey] = rating;
            return rating.mu - playerRank;
            // console.log(`After: ${player} : ${extractRating(users.get(player))}`);
        });

        // if (match.ratingsChange) {
        //     match.ratingsChange.remove();
        //     await match.save();
        //     match.ratingsChange = [];
        //     await match.save();
        // } else {
        match.ratingsChange = [];
        // }
        match.ratingsChange.push(...matchRatingsChange);
        console.log(`Patched: ${match.matchID}`);
    }
};

const saveUsersFromMatches = async (matches: any[],memory: any): Promise<any> => {
    const {users} = memory;
    // Can be deleted players in that bunch,
    // So updateOrInsert? {upsert:true}
    // Maybe increment gameType counter too?
    const usersPromises: any[] = [];
    users.forEach((keys: any,id: number): void => {
        const user: any = {
            playerID: id,
        };
        Object.keys(keys).forEach(key => {
            let {mu,pi,tau,sigma} = keys[key];
            user[key] = {mu,pi,tau,sigma};
        });
        usersPromises.push(Player.update({playerID: id},user,{
            upsert: true,
            setDefaultsOnInsert: true,
        }));
        console.log(`Inserting Scores for: ${id}`);
    });
    await Promise.all(usersPromises);
};


// At one point for seeding we will deal with matches that don't exist yet
// Live > Match doesn't exist ye
// Seed > They do, update them
async function run(): Promise<any> {
    await setupConnection();
    // const query = {$and: [{itemset: 'speed'},{playedAt: {$gt: new Date('2019-04-01T00:00:00.000+0000')}}, {playedAt: {$lt: new Date('2019-05-01T00:00:00.000+0000')}}]};
    const query = {itemset: 'speed'};
    const matches = await Match.find(query,{}).sort({matchID: 1});
    console.log(matches);
    // In normal (not seeding) I have to reset ranks on the first
    // game of the month a player played.
    // Either player.rankHistory.may not present = 700;
    const memory = {users: new Map()};
    // We need starting rank point
    await addRankingToMatches(matches,memory);

    // These two saves should be transactions so rollback is possible
    await saveUsersFromMatches(matches,memory);
    // Save matches
    await Promise.all(matches.map(m => m.save()));
    console.log('Done!');
}

// run().catch(err => {
//     throw err;
// });

const buildMatchCreateWithRanking = async (matches: any[]): Promise<any> => {
    const speedMatches = matches.filter((m: any): boolean => m.itemset === 'speed');
    const playersIDsInMatches: any = new Set(speedMatches.map(({playersID}: any): number[] => playersID).reduce((acc,el) => acc.concat(...el),[]));
    const playersIDsInMatchesUnique = Array.from(playersIDsInMatches);
    const players = await Player.find({playerID: {$in: playersIDsInMatchesUnique}},{
        playerID: 1,
        rank2: 1,
        rank3: 1,
        rank4: 1
    });
    const users = new Map();
    players.forEach(({playerID,rank2,rank3,rank4}): void => {
        if (rank2) {
            rank2 = new Rating(rank2.mu,rank2.sigma);
        }
        if (rank3) {
            rank3 = new Rating(rank3.mu,rank3.sigma);
        }
        if (rank4) {
            rank4 = new Rating(rank4.mu,rank4.sigma);
        }
        users.set(playerID,{
            rank2,
            rank3,
            rank4,
        });
    });
    const memory = {users};
    addRankingToMatches(speedMatches,memory); // Mutates
    await saveUsersFromMatches(speedMatches,memory);
    const {size} = memory.users;
    logz.send({
        message: `Updated ${size} players, with ranks`,
        playersUpdatedWithRank: size,
        service: 'ranker',
    });
};

export default buildMatchCreateWithRanking;


// const p1 = new Rating(700);
// const p2 = new Rating(700);
// const p3 = new Rating(700);
// const p4 = new Rating(700);
// const team1 = [p1,p2];
// const team2 = [p3,p4];

// const q = quality([team1,team2]);
// console.log(`Quality: ${q}`);

// // Assumes the first team was the winner by default
// const [rated1, rated2] = rate([team1, team2]); // rate also takes weights of winners or draw
// // rated1 and rated2 are now arrays with updated scores from result of match

// console.log(rated1.toString()); // team 1 went up in rating
// // >> Rating(mu=28.108, sigma=7.774),Rating(mu=28.108, sigma=7.774)
// console.log(rated2.toString()); // team 2 went down in rating

// console.log();
// Logistic curve
// const probAWins = (rankA: number,rankB: number): number => 1/(1+Math.pow(32,(rankB-rankA)/400));
// const probBWins = (rA: number,rB: number) => 1-probAWins(rA,rB);


// const WIN_POINTS = 1;
// const LOSE_POINTS = 0;

// const rankBoostGamesMax = 10;
// const rankScoreBoost = 100;
// const DEFAULT_MAXIMUM_POSSIBLE_CHANGE = 32;

// const newRatingFormula = (rating: number,score: number,expectedScore: number,K=32): number => {
//     const rankChange =K*(score-expectedScore);
//     console.log(`change: ${rankChange}`);
//     return rating + rankChange;
// };


// let pArank = 1656;
// let pBrank = 1763;
// pArank = (1810-10+1855-10)/2;
// pBrank = (1611+10+10+1634)/2;

// let teamOneranks;// = [1354, 1504, 1203, 1280, 1464].map(x => x-25);
// let teamTworanks;// = [1464, 1469, 1436, 1079].map(x => x+25);

// teamOneranks = [1233,1230];
// teamTworanks = [995,1311]
// ;// 1233 1230 995 1311

// const avg = (arr: number[]) => (arr.reduce((acc: any,el: any) => acc+el,0)/arr.length);
// pArank = avg(teamOneranks);
// pBrank = avg(teamTworanks);
// Im -3  :/ ?

// const expectedPaWins = probAWins(pArank,pBrank);
// const expectedPbWins = probBWins(pArank,pBrank);

// const newRankPA = newRatingFormula(pArank,WIN_POINTS,expectedPaWins);
// const newRankPB = newRatingFormula(pBrank,LOSE_POINTS,expectedPbWins);

// console.log(newRankPA,newRankPB);

// No draws
