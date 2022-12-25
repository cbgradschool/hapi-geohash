class Geohash {
    private base32 = '0123456789bcdefghjkmnpqrstuvwxyz';

    readonly precisionRequired: boolean;

    constructor(precisionRequired: boolean = true) {
        this.precisionRequired = precisionRequired;
    }

    public encode(lat: number, long: number, precision?: number) {
        if (precision == undefined && this.precisionRequired) {
            throw new Error('precision is required');
        }
    }
}

export default Geohash;
