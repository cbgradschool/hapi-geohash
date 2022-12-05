import { Plugin, Server } from "@hapi/hapi";
import Pkg from "../package.json";

const implementation: Plugin = {
  plugin: {
    pkg: Pkg,
    register(server: Server) {
      server.decorate("request", "geohash", () => {});
    },
  },
  core: true,
};

export default implementation;
