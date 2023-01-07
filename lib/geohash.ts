import joi from 'joi';

const LAT_MIN = -90;
const LAT_MAX = 90;
const LNG_MIN = -180;
const LNG_MAX = 180;

interface BoundingBox {
    ne: {
        lat: number,
        lng: number
    }
    sw: {
        lat: number,
        lng: number
    }
}

class Geohash {
    private base32 = '0123456789bcdefghjkmnpqrstuvwxyz';

    readonly precisionRequired: boolean;

    constructor(precisionRequired: boolean = true) {
        this.precisionRequired = precisionRequired;
    }

    public encode(lat: number, lng: number, precision: number = 6): string {
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
            /*
            west

            north                                                                                                                                                                                               
            east                                                                                                                                                                                                
            south                                                                                                                                                                                               
            west 
            */
            if (!(iteration % 2)) {
                // even bit => longitude

                const mid = (lonMin + lonMax) / 2;

                if (longitude >= mid) {
                    console.log('east');
                    bits += '1'; // East of midpoint

                    lonMin = mid;
                } else {
                    console.log('west');
                    bits += '0'; // West of midpoint

                    lonMax = mid;
                }
            } else {
                // odd bit => latitude

                const mid = (latMin + latMax) / 2;

                if (latitude >= mid) {
                    console.log('north');
                    bits += '1'; // North of midpoint

                    latMin = mid;
                } else {
                    console.log('south');
                    bits += '0'; // South of midpoint

                    latMax = mid;
                }
            }

            if (bits.length == 5) {

                geohash += this.base32.charAt(parseInt(bits, 2));

                bits = '';
            }

            iteration += 1;
        }

        return geohash;
    }

    public decode(geohash: string): any {
        let iteration = 0;
        let latMin = -90;
        let latMax = 90;
        let lonMin = -180;
        let lonMax = 180;

        for (let index = 0; index < geohash.length; index++) {
            const char = geohash.charAt(index);

            const idx = this.base32.indexOf(char);

            const bits = idx.toString(2).padStart(4, '0') // Bug why paddding of 5
            
            for (let n=4; n>=0; n--) {
                const bit = bits[n];
                if (!(iteration % 2)) {
                    // even bit => longitude
                    const mid = (lonMin + lonMax) / 2;
                    if (bit == '1') {
                        lonMin = mid;
                    } else {
                        lonMax = mid;
                    }
                } else {
                    // odd bit => latitude
                    const mid = (latMin + latMax) / 2;
                    if (bit == '1') {
                        latMin = mid;
                    } else {
                        latMax = mid;
                    }
                }
            }

            iteration += 1;
        }

        // return [(latMin + latMax) / 2, (lonMin + lonMax) / 2]
        const bounds = {
            sw: {
                lat: latMin,
                lng: lonMin,
            },
            ne: {
                lat: latMax,
                lng: lonMax,
            },
        }

        // console.log(bounds, 'decode');

        return this.center(bounds)
    }

    public dc(geohash: string): any {
        if (geohash.length == 0) throw new Error('Invalid geohash');

        geohash = geohash.toLowerCase();

        let evenBit = true;
        let latMin =  -90, latMax =  90;
        let lonMin = -180, lonMax = 180;

        for (let i=0; i<geohash.length; i++) {
            const chr = geohash.charAt(i);
            const idx = this.base32.indexOf(chr);
            if (idx == -1) throw new Error('Invalid geohash');

            for (let n=4; n>=0; n--) {
                const bitN = idx >> n & 1;
                if (evenBit) {
                    // longitude
                    const lonMid = (lonMin+lonMax) / 2;
                    if (bitN == 1) {
                        lonMin = lonMid;
                    } else {
                        lonMax = lonMid;
                    }
                } else {
                    // latitude
                    const latMid = (latMin+latMax) / 2;
                    if (bitN == 1) {
                        latMin = latMid;
                    } else {
                        latMax = latMid;
                    }
                }
                evenBit = !evenBit;
            }
        }

        const bounds = {
            sw: { lat: latMin, lng: lonMin },
            ne: { lat: latMax, lng: lonMax },
        };

        // console.log(bounds, 'dc');

        return this.center(bounds);
    }

    public center(bounds: BoundingBox): number[] {
        const latMin = bounds.sw.lat, lonMin = bounds.sw.lng;
        const latMax = bounds.ne.lat, lonMax = bounds.ne.lng;

        // cell centre
        let lat = (latMin + latMax)/2;
        let lon = (lonMin + lonMax)/2;

        // round to close to centre without excessive precision: ⌊2-log10(Δ°)⌋ decimal places
        lat = Number(lat.toFixed(Math.floor(2-Math.log(latMax-latMin)/Math.LN10)));
        lon = Number(lon.toFixed(Math.floor(2-Math.log(lonMax-lonMin)/Math.LN10)));

        return [lat, lon]
    }
}

export default Geohash;
