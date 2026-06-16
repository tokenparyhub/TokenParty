import type { Context, Next } from "hono";
import { nanoid } from "nanoid";
import { getDb } from "../store/db.js";
import { writeLog, headersToRecord } from "../store/log-writer.js";
import type { AppEnv } from "../types/env.js";

export async function accessLogMiddleware(c: Context<AppEnv>, next: Next) {
  const startTime = Date.now();
  await next();

  if (c.get("recorded")) return;

  const status = c.res.status;
  const requestId = nanoid();
  const method = c.req.method;
  const path = new URL(c.req.url).pathname;

  const reqHeaders = headersToRecord(c.req.raw.headers);
  const authHeader = reqHeaders["authorization"] ?? "";
  const tokenKey = authHeader.replace(/^Bearer\s+/i, "") || reqHeaders["x-api-key"] || "";

  let body: any = null;
  try {
    body = await c.req.json();
  } catch {}

  const logFile = writeLog(requestId, {
    type: "request",
    timestamp: startTime,
    headers: { ...reqHeaders, "x-method": method, "x-path": path },
    body,
  });

  let errorText: string | null = null;
  try {
    const resBody = await c.res.clone().json();
    if (resBody?.error) errorText = typeof resBody.error === "string" ? resBody.error : JSON.stringify(resBody.error);

    writeLog(requestId, {
      type: "response",
      timestamp: Date.now(),
      body: resBody,
      error: errorText ?? undefined,
    });
  } catch {}

  const latencyMs = Date.now() - startTime;
  const db = getDb();

  db.prepare(`
    INSERT INTO request_index (id, timestamp, token_id, provider_id, model, input_tokens, output_tokens, cache_read_tokens, cache_write_tokens, latency_ms, status, log_file, error, cost, agent, custom_tags)
    VALUES (?, ?, ?, ?, ?, 0, 0, 0, 0, ?, ?, ?, ?, 0, '', '')
  `).run(
    requestId, startTime, tokenKey || null, null, body?.model ?? null,
    latencyMs, status, logFile, errorText,
  );
}
