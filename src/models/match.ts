import {createSchema, Type, typedModel, ExtractDoc, ExtractProps} from 'ts-mongoose';
const matchSchema = createSchema({
    matchID: Type.number({
        index: true,
    }),
    name: Type.optionalString(),
    gameType: Type.string({enum: ['ffa','team','quickplay'], index: true}),
    itemset: Type.string({enum: ['speed','thin'], index: true}),
    playedAt: Type.date({index: true}),
    participants: Type.array({index: true}).of(Type.number()), // ids of playing players? [{Players}]? [id1,id2] , double entry? full row insert?
    karma: Type.number(),
    scores: Type.array().of(Type.number()),
    ranks: Type.array().of(Type.number()),
    points: Type.array().of(Type.number()),
    positions: Type.array().of(Type.number()), // 1 1 2 2 || 1 2 3 4
    premium: Type.boolean(), // Was it made only by premiums?
    createdAt: Type.optionalDate(),
    updatedAt: Type.optionalDate(),
});

matchSchema.index({id: 1},{name: 'idIndex'});
matchSchema.index({gameType: 1, itemset: 1},{name: 'GameItemSetIndex'});
matchSchema.index({participants: 1, itemset: 1},{name: 'GameItemSetIndex'});


const Match = typedModel('Match', matchSchema);


export type MatchDoc = ExtractDoc<typeof matchSchema>;
export type MatchProps = ExtractProps<typeof matchSchema>;

export default Match;
