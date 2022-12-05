import { Request, Server } from "@hapi/hapi";

export interface PluginRequest extends Request {
  geohash: any;
}

type Package = {
  pkg: any;
};

export interface Plugin {
  plugin: {
    pkg: Package;
    register: (server: Server) => void;
  };
  decode: () => void;
  encode: () => void;
}
