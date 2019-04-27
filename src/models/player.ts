import {createSchema, Type, typedModel, ExtractDoc, ExtractProps} from 'ts-mongoose';

const playerSchema = createSchema({
    playerID: Type.number({index: true}),
    title: Type.optionalString(),
    name: Type.string(),
    rank2: Type.number({index: true}),
    rank3: Type.number({index: true}),
    rank4: Type.number({index: true}),
    clans: Type.array().of(Type.string()),
    karma: Type.number({index: true}), // Up thinner down speeder over his own speed games
    premium: Type.boolean({index: true}),
    speedWin: Type.boolean({index: true}),
    total2v2Games: Type.number({index: true}),
    total3v3Games: Type.number({index: true}),
    total4v4Games: Type.number({index: true}),
    totalOldGames: Type.number({index: true}),
    totalNewGames: Type.number({index: true}),
    thinWin: Type.boolean(),
    avatarURL: Type.optionalString(),
    champion: Type.boolean(),
    // Clan history?
    country: Type.string(),
    startedAt: Type.date(),
    updatedAt: Type.optionalDate(),
    createdAt: Type.optionalDate(),
});

playerSchema.index({id: -1},{name: 'idIndex'});
playerSchema.index({rank2: -1},{name: 'rank2Index'});
playerSchema.index({rank3: -1},{name: 'rank3Index'});
playerSchema.index({rank4: -1},{name: 'rank4Index'});
playerSchema.index({speedWin: -1, id: 1},{name: 'speedWinIdIndex'});

// Win Lose -> ?
// Speed Game
// SpeederRatio /  SpeederWinRatio)

// https:// mongoosejs.com/docs/2.7.x/docs/methods-statics.html
// playerSchema.methods.findSimilarType = function findSimilarType(cb: any): void {
//     return this.model('player').find({type: this.type}, cb);
// };

const Player = typedModel('Player', playerSchema);


export type PlayerDoc = ExtractDoc<typeof playerSchema>;
export type PlayerProps = ExtractProps<typeof playerSchema>;


// on every save, add the date
playerSchema.pre<PlayerDoc>('save', function (next): void {
    // get the current date
    var currentDate = new Date();

    // change the updated_at field to current date

    // https://stackoverflow.com/questions/42448372/typescript-mongoose-static-model-method-property-does-not-exist-on-type
    // https://stackoverflow.com/questions/34482136/mongoose-the-typescript-way
    // Solution -> https://www.npmjs.com/package/ts-mongoose
    this.updatedAt = currentDate;

    // if created_at doesn't exist, add to that field
    if (!this.createdAt) {
        this.createdAt = currentDate;
    }
    next();
});

export default Player;
