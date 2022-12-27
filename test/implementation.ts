import Code from '@hapi/code';
import Lab from '@hapi/lab';
import Hapi from '@hapi/hapi';
import GeohashPlugin, { Implementation } from '../lib';
import { PluginRequest } from '../lib/index.d';

const { expect } = Code;
const lab = Lab.script();
const { it, describe } = lab;

exports.lab = lab

describe('Implementation', () => {
  it('can be registered as a hapi plugin', async () => {
    const server = Hapi.server();

    await server.register(GeohashPlugin);

    server.route({
      method: 'GET',
      path: '/test',
      handler(request: PluginRequest) {
        return expect(request.geohash).to.be.a.function();
      },
    });

    await server.inject({
      method: 'GET',
      url: '/test',
    });
  });

  it('can be used as a commonJs module', () => {
    expect(Implementation).to.be.a.function();
  });
});
