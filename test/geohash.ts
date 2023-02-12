import Code from '@hapi/code';
import Lab from '@hapi/lab';
import { ValidationError } from 'joi';
import { Geohash } from '../lib';

const { expect } = Code;
const lab = Lab.script();
const { it, describe } = lab;

exports.lab = lab

const toFixedNoRound = (target: number, precision: number): number => {
  const factor = 10 ** precision

  return Math.floor(target * factor) / factor
}

describe('Geohash', () => {
  const precision = 6;

  it('throws an exception if an invalid latitude is provided', () => {
    function subject() {
      Geohash.encode(2000, 45.67, precision);
    };

    expect(subject).to.throw(
      ValidationError,
      '"value" must be less than or equal to 90'
    );
  });

  it('throws an exception if an invalid longitude is provided', () => {
    function subject() {
      Geohash.encode(90, -200, precision);
    };

    expect(subject).to.throw(
      ValidationError,
      '"value" must be greater than or equal to -180'
    );
  });

  it('encodes coordinates into a 32-bit encoded string', () => {
    const geohash = Geohash.encode(37.422, -122.0841, 12);

    expect(geohash).to.equal('9q9hvumnfq3j');
  });

  it('can decode a 32-bit encoded string back into coordinates', () => {
    const expectedLat = 40.72470580906875;

    const expectedLon = -73.99975952911369;

    const geohash = Geohash.encode(expectedLat, expectedLon, 8);

    expect(geohash).to.equal('dr5rsjen')

    const [lat, lon] = Geohash.decode(geohash);

    expect([toFixedNoRound(lat, 3), toFixedNoRound(lon, 3)]).to.include([toFixedNoRound(expectedLat, 3), toFixedNoRound(expectedLon, 3)]);
  });

  it('can return a geohash without a specified precision', () => {
    const expectedLat = 40.7247058090;

    const expectedLon = -73.9997595291;

    const geohash = Geohash.encode(expectedLat, expectedLon, 8);

    expect(geohash).to.equal('dr5rsjen')

    const [lat, lon] = Geohash.decode(geohash);

    expect([toFixedNoRound(lat, 3), toFixedNoRound(lon, 3)]).to.include([toFixedNoRound(expectedLat, 3), toFixedNoRound(expectedLon, 3)]);
  })
});
