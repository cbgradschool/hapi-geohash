import { Server } from '@hapi/hapi';
import Implementation from './geohash';

const Pkg = require('../package.json');

export default {
  plugin: {
    pkg: Pkg,
    register(server: Server) {
      server.decorate('server', 'geohash', () => Implementation)
    },
  },
};

export const Geohash = Implementation
