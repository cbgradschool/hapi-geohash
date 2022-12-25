import Code from '@hapi/code';
import Lab from '@hapi/lab';
import Hapi from '@hapi/hapi';
import { implementation } from '../lib';

const { expect } = Code;
const { it, describe } = (exports.lab = Lab.script());

describe('Geohash', () => {
    it('can be configured to throw if precision is not provided', () => {
        const instance = new implementation();
        const subject = function () {
            instance.encode(34.56, 45.67);
        };

        expect(subject).to.throw(Error, 'precision is required');
    });
});
