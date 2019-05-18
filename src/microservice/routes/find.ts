import mongoose from 'mongoose';
import Player from '../../models/player';
import Match, {MatchDoc} from '../../models/match';
import {logz} from '../../middlewares/logger';

const findEndpoint = async (req: any, res: any): Promise<any> => {
    const {user} = req.params;
    let response = {};
    if (user.length < 3) {
        return res.json({data: []});
    }
    const search = new RegExp(user,'i'); // DDOS beware
    const players = await Player.find({name: search});
    if (players) {
        response = {
            data: {players}
        };

    }
    res.json(response);
};

export default findEndpoint;
