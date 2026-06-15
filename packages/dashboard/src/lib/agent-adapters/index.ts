import { registerAdapter } from "./registry";
import { claudeCodeAdapter } from "./claude-code";

registerAdapter(claudeCodeAdapter);

export { getAdapterForAgent } from "./registry";
