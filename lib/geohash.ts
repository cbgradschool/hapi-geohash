import joi from 'joi';

const LAT_MIN = -90;
const LAT_MAX = 90;
const LON_MIN = -180;
const LON_MAX = 180;

interface BoundingBox {
  ne: {
    lat: number,
    lon: number
  }
  sw: {
    lat: number,
    lon: number
  }
}

interface GeohashNeighbours {
  n: string,
  ne: string,
  e: string,
  se: string,
  s: string,
  sw: string,
  w: string,
  nw: string,
}

class Geohash {
  private static base32 = '0123456789bcdefghjkmnpqrstuvwxyz';

  static encode(lat: number, lon: number, hashPrecision: number): string {
    const precision = joi.attempt(
      hashPrecision,
      joi.number().min(1).max(12)
    )

    const latitude = joi.attempt(
      lat,
      joi.number().min(LAT_MIN).max(LAT_MAX).required()
    );

    const longitude = joi.attempt(
      lon,
      joi.number().min(LON_MIN).max(LON_MAX).required()
    );

    let geohash = '';

    let iteration = 0;

    let bits = '';

    let latMin = -90;

    let latMax = 90;

    let lonMin = -180;

    let lonMax = 180;

    while (geohash.length < precision) {
      if (!(iteration % 2)) {
        // even bit => longitude

        const mid = (lonMin + lonMax) / 2;

        if (longitude >= mid) {
          bits += '1'; // East of Prime Meridian (+)

          lonMin = mid;
        } else {
          bits += '0'; // West of Prime Meridain (-)

          lonMax = mid;
        }
      } else {
        // odd bit => latitude

        const mid = (latMin + latMax) / 2;

        if (latitude >= mid) {
          bits += '1'; // North of Equator (+)

          latMin = mid;
        } else {
          bits += '0'; // South of Equator (-)

          latMax = mid;
        }
      }

      if (bits.length === 5) { // Question: why 5 bits
        geohash += Geohash.base32.charAt(parseInt(bits, 2));

        bits = '';
      }

      iteration += 1;
    }

    return geohash;
  }

  static decode(geohash: string): any {
    let iteration = 0;
    let latMin = -90;
    let latMax = 90;
    let lonMin = -180;
    let lonMax = 180;

    for (let index = 0; index < geohash.length; index += 1) {
      const char = geohash.charAt(index);

      const idx = Geohash.base32.indexOf(char);

      const bits = idx.toString(2).padStart(5, '0')

      // eslint-disable-next-line
      for (const bit of bits) {
        if (!(iteration % 2)) {
          // even bit => longitude
          const mid = (lonMin + lonMax) / 2;
          if (bit === '1') {
            lonMin = mid;
          } else {
            lonMax = mid;
          }
        } else {
          // odd bit => latitude
          const mid = (latMin + latMax) / 2;
          if (bit === '1') {
            latMin = mid;
          } else {
            latMax = mid;
          }
        }

        iteration += 1;
      }

    }

    return Geohash.center({
      sw: { lat: latMin, lon: lonMin },
      ne: { lat: latMax, lon: lonMax },
    });
  }

  static center(bounds: BoundingBox): number[] {
    const { sw, ne } = bounds

    const lat = (sw.lat + ne.lat) / 2;
    const lon = (sw.lon + ne.lon) / 2;

    return [lat, lon]
  }

  static adjacent(geohashArg: string, directionArg: string) {
    // based on https://github.com/chrisveness/latlon-geohash/blob/master/latlon-geohash.js
    const geohash = joi.attempt(
      geohashArg,
      joi.string().lowercase()
    );
    const direction = joi.attempt(
      directionArg,
      joi.string().lowercase().valid('n', 'e', 's', 'w')
    );

    const neighbour: { [key: string]: string[] } = {
      n: ['p0r21436x8zb9dcf5h7kjnmqesgutwvy', 'bc01fg45238967deuvhjyznpkmstqrwx'],
      s: ['14365h7k9dcfesgujnmqp0r2twvyx8zb', '238967debc01fg45kmstqrwxuvhjyznp'],
      e: ['bc01fg45238967deuvhjyznpkmstqrwx', 'p0r21436x8zb9dcf5h7kjnmqesgutwvy'],
      w: ['238967debc01fg45kmstqrwxuvhjyznp', '14365h7k9dcfesgujnmqp0r2twvyx8zb'],
    };
    const border: { [key: string]: string[] } = {
      n: ['prxz', 'bcfguvyz'],
      s: ['028b', '0145hjnp'],
      e: ['bcfguvyz', 'prxz'],
      w: ['0145hjnp', '028b'],
    };

    const lastCh = geohash.slice(-1);    // last character of hash
    let parent = geohash.slice(0, -1); // hash without last character

    const type = geohash.length % 2;

    // check for edge-cases which don't share common prefix
    if (border[direction][type].indexOf(lastCh) !== -1 && parent !== '') {
      parent = Geohash.adjacent(parent, direction);
    }

    // append letter for direction to parent
    return parent + Geohash.base32.charAt(neighbour[direction][type].indexOf(lastCh));
  }

  static neighboursOf(geohash: string): GeohashNeighbours {
    // based on https://github.com/chrisveness/latlon-geohash/blob/master/latlon-geohash.js
    const northNeighbour = Geohash.adjacent(geohash, 'n');
    const eastNeighbour = Geohash.adjacent(geohash, 'e')
    const southNeighbour = Geohash.adjacent(geohash, 's')
    const westNeighbour = Geohash.adjacent(geohash, 'w')

    return {
      n: northNeighbour,
      ne: Geohash.adjacent(northNeighbour, 'e'),
      e: eastNeighbour,
      se: Geohash.adjacent(southNeighbour, 'e'),
      s: southNeighbour,
      sw: Geohash.adjacent(southNeighbour, 'w'),
      w: westNeighbour,
      nw: Geohash.adjacent(northNeighbour, 'w'),
    };
  }
}

export default Geohash;
