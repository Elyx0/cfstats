import {createSchema, Type, typedModel, ExtractDoc, ExtractProps} from 'ts-mongoose';

const userSchema = createSchema({
    id: Type.number({index: true}),
    title: Type.string(),
    name: Type.string(),
    rank: Type.number(),
    karma: Type.number({index: true}), // Up thinner down speeder over his own speed games
    premium: Type.boolean({index: true}),
    speedWin: Type.boolean({index: true}),
    thinWin: Type.boolean(),
    avatarURL: Type.string(),
    updatedAt: Type.optionalDate(),
    createdAt: Type.optionalDate(),
});

userSchema.index({id: 1},{name: 'idIndex'});
userSchema.index({premium: 1, rank: 1},{name: 'PremiumRankIndex'});
userSchema.index({speedWin: 1, id: 1},{name: 'speedWinIdIndex'});
userSchema.index({karma: 1, speedWin: 1},{name: 'KarmaSpeedWinIndex'});

// Win Lose -> ?
// Speed Game
// SpeederRatio /  SpeederWinRatio)

// https:// mongoosejs.com/docs/2.7.x/docs/methods-statics.html
// userSchema.methods.findSimilarType = function findSimilarType(cb: any): void {
//     return this.model('user').find({type: this.type}, cb);
// };

const User = typedModel('User', userSchema);


export type UserDoc = ExtractDoc<typeof userSchema>;
export type UserProps = ExtractProps<typeof userSchema>;


// on every save, add the date
userSchema.pre<UserDoc>('save', function (next): void {
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

export default User;
