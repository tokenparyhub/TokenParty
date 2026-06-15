import type { ReactNode } from "react";

export interface RequestContext {
  cost: number;
  latencyMs: number;
  inputTokens: number;
  outputTokens: number;
  cacheReadTokens: number;
  cacheWriteTokens: number;
  model: string;
  status: number;
  error?: string;
}

export interface AgentDetailAdapter {
  agentId: string;
  displayName: string;
  badgeClass: string;
  renderMetaChips(reqLog: any): ReactNode;
  getRequestSections(reqLog: any, resLog: any, ctx: RequestContext): { id: string; label: string }[];
  getResponseSections(resLog: any): { id: string; label: string }[];
  renderSection(sectionId: string, reqLog: any, resLog: any, ctx: RequestContext): ReactNode | null;
}
