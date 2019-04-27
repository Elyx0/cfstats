import {createSchema, Type, typedModel, ExtractDoc, ExtractProps} from 'ts-mongoose';
const tagsSchema = createSchema({
    tagID: Type.number({
        index: true,
    }),
    description: Type.string(),
    name: Type.string(),
});

const Tag = typedModel('Tag', tagsSchema);


export type TagDoc = ExtractDoc<typeof tagsSchema>;
export type TagProps = ExtractProps<typeof tagsSchema>;

export default Tag;
