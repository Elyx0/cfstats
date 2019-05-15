import {createSchema, Type, typedModel, ExtractDoc, ExtractProps} from 'ts-mongoose';

const RankType = Type.optionalObject().of({
    mu: Type.number({index: true}), // The rating
    pi: Type.number(),
    sigma: Type.number(),
    tau: Type.number(),
    base: Type.optionalNumber({index: true, default: 0}),
});

const playerSchema = createSchema({
    playerID: Type.number({index: true}),
    title: Type.optionalString(),
    name: Type.optionalString(),
    rank2: RankType,
    rank3: RankType,
    rank4: RankType,
    clans: Type.optionalArray().of(Type.string()),
    karma: Type.number({index: true, default: 0}), // Up thinner down speeder over his own speed games
    premium: Type.boolean({index: true, default: false}),
    speedWin: Type.boolean({index: true, default: false}),
    total2v2Games: Type.number({index: true, default: 0}),
    total3v3Games: Type.number({index: true, default: 0}),
    total4v4Games: Type.number({index: true, default: 0}),
    totalOldGames: Type.number({index: true, default: 0}),
    totalNewGames: Type.number({index: true, default: 0}),
    thinWin: Type.optionalBoolean(),
    avatarURL: Type.optionalString(),
    champion: Type.boolean({default: false}),
    deleted: Type.boolean({default: false}),
    // Clan history?
    country: Type.optionalString(),
    startedAt: Type.optionalDate(),
    updatedAt: Type.optionalDate(),
    createdAt: Type.optionalDate(),
});

playerSchema.index({id: -1},{name: 'idIndex'});
playerSchema.index({'r2.base': -1},{name: 'r2Index'});
playerSchema.index({'r3.base': -1},{name: 'r3Index'});
playerSchema.index({'r4.base': -1},{name: 'r4Index'});
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
