import {createSchema, Type, typedModel, ExtractDoc, ExtractProps} from 'ts-mongoose';
const matchSchema = createSchema({
    matchID: Type.number({
        index: true,
        unique: true,
    }),
    name: Type.optionalString(),
    gameType: Type.string({enum: ['ffa','team','quickplay'], index: true}),
    itemset: Type.string({enum: ['speed','thin'], index: true}),
    playedAt: Type.date({index: true}),
    playersID: Type.array({index: true}).of(Type.number()), // ids of playing players? [{Players}]? [id1,id2] , double entry? full row insert?
    karma: Type.number(),
    ratings: Type.optionalArray().of({
        mu: Type.number({index: true}), // The rating
        pi: Type.number(),
        sigma: Type.number(),
        tau: Type.number(),
    }),
    field: Type.optionalString(),
    qualityScore: Type.optionalNumber(),
    winProbabilityTeam1: Type.optionalNumber(),
    winProbabilityTeam2: Type.optionalNumber(),
    ratingsChange: Type.array().of(Type.number()),
    winningPlayersID: Type.array({index: true}).of(Type.number()),
    losingPlayersID: Type.array({index: true}).of(Type.number()),
    playersScores: Type.array().of(Type.number()),
    playersRank: Type.array().of(Type.number()),
    playersPointsChange: Type.array().of(Type.number()),
    playersPositions: Type.array().of(Type.number()), // 1 1 2 2 || 1 2 3 4
    teamSize: Type.number({enum: [2,3,4], index: true}),
    totalRounds: Type.number(),
    winningRounds: Type.number(),
    losingRounds: Type.number(),
    premium: Type.optionalBoolean(), // Was it made only by premiums?
    createdAt: Type.optionalDate(),
    updatedAt: Type.optionalDate(),
    tags: Type.array().of(Type.string())
});

matchSchema.index({matchID: -1},{name: 'idIndex'});
matchSchema.index({gameType: -1, itemset: -1},{name: 'GameItemSetIndex'});
matchSchema.index({playersID: -1, itemset: -1},{name: 'GameItemSetIndex'});


const Match = typedModel('Match', matchSchema);


export type MatchDoc = ExtractDoc<typeof matchSchema>;
export type MatchProps = ExtractProps<typeof matchSchema>;

export default Match;
