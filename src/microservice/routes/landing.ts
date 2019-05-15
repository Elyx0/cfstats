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
        'rank2.base': -1,
    })
        .limit(300);
    const ladder3v3 = await Player.find({
        'rank3.base': {$ne: null}
    },{
        name: 1,
        rank3: 1,
        playerID: 1,
    }).sort({
        'rank3.base': -1,
    })
        .limit(300);
    const ladder4v4 = await Player.find({
        'rank4.base': {$ne: null}
    },{
        name: 1,
        rank4: 1,
        playerID: 1,
    })
        .sort({
            'rank4.base': -1,
        })
        .limit(300);
    res.json({data: {
        ladder2v2,
        ladder3v3,
        ladder4v4,
    }});
};

export default landingEnpoint;
