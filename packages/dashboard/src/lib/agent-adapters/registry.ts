import type { AgentDetailAdapter } from "./types";

const adapters = new Map<string, AgentDetailAdapter>();

export function registerAdapter(a: AgentDetailAdapter) {
  adapters.set(a.agentId, a);
}

export function getAdapterForAgent(agent?: string): AgentDetailAdapter | null {
  if (!agent) return null;
  return adapters.get(agent) ?? null;
}
