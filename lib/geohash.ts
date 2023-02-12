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
          bits += '1'; // East of midpoint

          lonMin = mid;
        } else {
          bits += '0'; // West of midpoint

          lonMax = mid;
        }
      } else {
        // odd bit => latitude

        const mid = (latMin + latMax) / 2;

        if (latitude >= mid) {
          bits += '1'; // North of midpoint

          latMin = mid;
        } else {
          bits += '0'; // South of midpoint

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
}

export default Geohash;
