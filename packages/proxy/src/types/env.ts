import type { Token } from "./config.js";

export type AppEnv = {
  Variables: {
    authToken: Token;
  };
};

export type UserApiEnv = {
  Variables: {
    userToken: Token;
  };
};
