import * as chai from 'chai';
import * as mongoose from 'mongoose';
import {Mockgoose} from 'mockgoose';

let mockgoose: Mockgoose = new Mockgoose(mongoose);

import sinon from 'sinon';

import Fetcher from '../src/fetcher';

chai.use(require('chai-diff'));
chai.use(require('sinon-chai'));
const {expect} = chai;


process.on('beforeExit',_=> mongoose.disconnect());
/**
 * @summary Builds the given test from the fixtures object
 * @param name {String}
 */
// const buildExpectFromFixtures = (fixtures: any): Function => (name: string): void => {
//     const fixture = fixtures[name];
//     if (!fixture) {
//         throw new Error('Fixture not found in fixtures.ts');
//     }
//     const actual = filter(fixture.settings,fixture.components);
//     // @ts-ignore (https://github.com/chaijs/chai/issues/1100)
//     expect(actual).not.differentFrom(fixture.expected);
// };

// Uses the builder for this test fixtures from './fixtures.ts'
// const assertFromFixtures: Function = buildExpectFromFixtures(fixtures);

let sandbox = sinon.sandbox.create();

describe('filterService', function (): void {

    before(function (done) {
        mockgoose.prepareStorage().then(function () {
            mongoose.connection.on('connected', () => {
                console.log('db connection is now open');
            });
            mongoose.connect('mongodb://example.com/cftest', function (err) {
                done(err);
            });
        });
    });

    it('returns data and emits after a run', async (): Promise<any> => {
        const fixture = {};
        const fetcher = new Fetcher();

        const actual = await fetcher.run();
        // @ts-ignore (https://github.com/chaijs/chai/issues/1100)
        expect(actual).to.equal(247);
    });

});
