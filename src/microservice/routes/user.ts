import mongoose from 'mongoose';
import Player from '../../models/player';
import Match, {MatchDoc} from '../../models/match';
import {logz} from '../../middlewares/logger';

const userEndpoint = async (req: any, res: any): Promise<any> => {
    const {user} = req.params;
    let response = {};
    const player = await Player.findOne({playerID: Number(user)});
    if (player) {
        const matches = await Match.find({$and: [{itemset: 'speed'},{playersID: {$in: [player.playerID]}}]}).sort({matchID: -1}).limit(1000);
        const playersIDsInMatches: any = new Set(matches.map(({playersID}: any): number[] => playersID).reduce((acc,el) => acc.concat(...el),[]));
        const playersIDsInMatchesUnique = Array.from(playersIDsInMatches);
        const players = await Player.find({playerID: {$in: playersIDsInMatchesUnique}});
        response = {
            data: {players,
                matches}
        };

    }
    res.json(response);
};

export default userEndpoint;
