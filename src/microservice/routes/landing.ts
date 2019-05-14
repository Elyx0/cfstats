import mongoose from 'mongoose';
import Player from '../../models/player';
import Match, {MatchDoc} from '../../models/match';
import {logz} from '../../middlewares/logger';

const landingEnpoint = async (req: any, res: any): Promise<any> => {
    const ladder2v2 = await Player.find({
        'rank2.mu': {$ne: null}
    },{
        name: 1,
        rank2: 1,
        playerID: 1,
    }).sort({
        'rank2.mu': -1,
    })
        .limit(100);
    const ladder3v3 = await Player.find({
        'rank3.mu': {$ne: null}
    },{
        name: 1,
        rank3: 1,
        playerID: 1,
    }).sort({
        'rank3.mu': -1,
    })
        .limit(100);
    const ladder4v4 = await Player.find({
        'rank4.mu': {$ne: null}
    },{
        name: 1,
        rank4: 1,
        playerID: 1,
    })
        .sort({
            'rank4.mu': -1,
        })
        .limit(100);
    res.json({data: {
        ladder2v2,
        ladder3v3,
        ladder4v4,
    }});
};

export default landingEnpoint;
