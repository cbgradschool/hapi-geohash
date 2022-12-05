import Code from "@hapi/code";
import Lab from "@hapi/lab";
import Hapi from "@hapi/hapi";
import GeohashPlugin from "../lib";
import { PluginRequest } from "../lib/index.d";

const { expect } = Code;
const { it, describe } = (exports.lab = Lab.script());

describe("Implementation", () => {
  it("can be registered as a hapi plugin", async () => {
    const server = Hapi.server();

    await server.register(GeohashPlugin);

    server.route({
      method: "GET",
      path: "/test",
      handler(request: PluginRequest) {
        return expect(request.geohash).to.be.a.function();
      },
    });

    await server.inject({
      method: "GET",
      url: "/test",
    });
  });

  it("can be used a commonJs module", () => {
    expect(GeohashPlugin.encode).to.be.a.function();
    expect(GeohashPlugin.decode).to.be.a.function();
  });
});
