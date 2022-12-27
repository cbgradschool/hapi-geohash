import Code from '@hapi/code';
import Lab from '@hapi/lab';
import Hapi from '@hapi/hapi';
import { ValidationError } from 'joi';
import { Implementation } from '../lib';

const { expect } = Code;
const { it, describe } = (exports.lab = Lab.script());

describe('Geohash', () => {
    it.skip('can be configured to throw if precision is not provided', () => {
        const subject = function () {
            new Implementation().encode(34.56, 45.67);
        };

        expect(subject).to.throw(Error, 'precision is required');
    });

    it('can be configured to not throw if precision is not provided', () => {
        const subject = function () {
            new Implementation().encode(34.56, 45.67);
        };

        expect(subject).not.to.throw();
    });

    it.skip('can deduce the precision from the coordinates passed in when configured not to throw', () => {});

    it('throws an exception if an invalid latitude is provided', () => {
        const subject = function () {
            new Implementation().encode(2000, 45.67);
        };

        expect(subject).to.throw(
            ValidationError,
            '"value" must be less than or equal to 90'
        );
    });

    it('throws an exception if an invalid longitude is provided', () => {
        const subject = function () {
            new Implementation().encode(90, -200);
        };

        expect(subject).to.throw(
            ValidationError,
            '"value" must be greater than or equal to -180'
        );
    });

    it('encodes coordinates into a 32-bit encoded string', () => {
        const geohash = new Implementation().encode(37.422, -122.0841, 12);

        expect(geohash).to.equal('0q4212p20842');
    });
});
