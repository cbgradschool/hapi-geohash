import { Plugin, Server } from '@hapi/hapi';
import Pkg from '../package.json';
import Geohash from './geohash';

export default {
    plugin: {
        pkg: Pkg,
        register(server: Server, options: any) {
            server.decorate('server', 'geohash', () => new Geohash(options));
        },
    },
};

export const implementation = Geohash;
