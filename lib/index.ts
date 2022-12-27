import { Server } from '@hapi/hapi';
import Geohash from './geohash';

const Pkg = require('../package.json');

export default {
  plugin: {
    pkg: Pkg,
    register(server: Server, options: any) {
      server.decorate('server', 'geohash', () => new Geohash(options));
    },
  },
};

export const Implementation = Geohash;
