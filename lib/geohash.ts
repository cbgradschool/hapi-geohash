import joi from 'joi';

const LAT_MIN = -90;
const LAT_MAX = 90;
const LNG_MIN = -180;
const LNG_MAX = 180;

class Geohash {
    private base32 = '0123456789bcdefghjkmnpqrstuvwxyz';

    readonly precisionRequired: boolean;

    constructor(precisionRequired: boolean = true) {
        this.precisionRequired = precisionRequired;
    }

    public encode(lat: number, lng: number, precision: number = 6) {
        if (precision == undefined && this.precisionRequired) {
            throw new Error('precision is required');
        }

        const latitude = joi.attempt(
            lat,
            joi.number().min(LAT_MIN).max(LAT_MAX).required()
        );

        const longitude = joi.attempt(
            lng,
            joi.number().min(LNG_MIN).max(LNG_MAX).required()
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

                if (longitude > mid) {
                    bits += '1'; // East of midpoint

                    lonMin = mid;
                } else {
                    bits += '0'; // West of midpoint

                    lonMax = mid;
                }
            } else {
                // odd bit => latitude

                const mid = (latMin + latMax) / 2;

                if (latitude > latMin) {
                    bits += '1'; // North of midpoint

                    latMin = mid;
                } else {
                    bits += '0'; // South of midpoint

                    latMax = mid;
                }
            }

            if (!(iteration % 5)) {
                geohash += this.base32.charAt(parseInt(bits, 2));

                bits = '';
            }

            iteration += 1;
        }

        return geohash;
    }
}

export default Geohash;
