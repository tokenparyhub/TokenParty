import { serve } from "@hono/node-server";
import { loadConfig, watchConfig } from "./config.js";
import { initDb, getValidAdminToken, getAdminTokenInfo, createAdminToken } from "./store/db.js";
import { cleanupLogs } from "./store/log-writer.js";
import { createServer } from "./server.js";

const config = loadConfig();
initDb();

{
  let token = getValidAdminToken();
  if (!token) { token = createAdminToken(); console.log(`[tokenparty] New admin token generated`); }
  const info = getAdminTokenInfo()!;
  console.log(`[tokenparty] Admin token: ${info.token} (expires: ${new Date(info.expires_at).toISOString().slice(0, 10)})`);
}

{
  const result = cleanupLogs();
  if (result.deletedDays.length > 0) {
    console.log(`[tokenparty] Log cleanup: deleted ${result.deletedDays.length} day(s), freed ${result.freedMB}MB`);
  }
}

const app = createServer();

watchConfig((newConfig) => {
  console.log(`[tokenparty] Config reloaded`);
});

serve(
  { fetch: app.fetch, port: config.server.port, hostname: config.server.host },
  (info) => {
    console.log(`[tokenparty] Proxy running at http://${info.address}:${info.port}`);
    console.log(`[tokenparty] OpenAI endpoint:    /v1/*`);
    console.log(`[tokenparty] Anthropic endpoint: /anthropic/*`);
    console.log(`[tokenparty] Dashboard API:      /api/*`);
  }
);
