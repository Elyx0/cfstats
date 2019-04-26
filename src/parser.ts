import mongoose from 'mongoose';
import User from './models/user';
import Match, {MatchDoc} from './models/match';
import cheerio from 'cheerio';

// All of matchParser, userParser and avatarParser,
// Will have some of the batching logic.
// At max a request to matchParser
// --> Finds 8 never seen users
// --> Gets their info + avatar
// --> So 16 request worst case.
// Only care about ranked team

export const matchParser =  async (opts: any = {}): Promise<any> => {
    const {start, batch} = opts;
    if (batch && batch.batchSize) {
        // BatchSize is a blind guess from start to + batchSize.
        // Some can 404 so
    }
};

export const userParser =  async (opts = {}) => {

};

export const avatarParser =  async (opts = {}) => {

};


export default {
    matchParser,
    userParser,
    avatarParser,
};
