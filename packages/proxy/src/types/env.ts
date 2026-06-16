import type { Token } from "./config.js";

export type AppEnv = {
  Variables: {
    authToken: Token;
    recorded: boolean;
  };
};

export type UserApiEnv = {
  Variables: {
    userToken: Token;
  };
};
