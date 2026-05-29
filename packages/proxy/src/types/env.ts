import type { Token } from "./config.js";

export type AppEnv = {
  Variables: {
    authToken: Token;
  };
};
