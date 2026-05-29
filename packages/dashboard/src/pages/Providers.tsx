import { useEffect, useState } from "react";
import { api } from "../lib/api";

type ModelConfig = string | { id: string; inputPrice?: number; outputPrice?: number };

interface Provider {
  id: string;
  type: string;
  name: string;
  apiKey: string | string[];
  baseUrl: string;
  models: ModelConfig[];
  enabled: boolean;
  group?: string;
  _apiKeysText?: string;
}

function getModelId(m: ModelConfig): string {
  return typeof m === "string" ? m : m.id;
}

function normalizeModels(models: ModelConfig[]): ModelConfig[] {
  return models.map((m) => {
    if (typeof m === "string") return m;
    if (m.inputPrice === undefined && m.outputPrice === undefined) return m.id;
    return m;
  });
}

export default function Providers() {
  const [providers, setProviders] = useState<Provider[]>([]);
  const [editing, setEditing] = useState<Partial<Provider> | null>(null);
  const [isNew, setIsNew] = useState(false);

  const load = () => api.getProviders().then(setProviders).catch(console.error);
  useEffect(() => { load(); }, []);

  const save = async () => {
    if (!editing) return;
    const { _apiKeysText, ...data } = editing;
    data.models = normalizeModels(data.models ?? []);
    if (isNew) {
      await api.createProvider(data);
    } else {
      await api.updateProvider(data.id!, data);
    }
    setEditing(null);
    load();
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this provider?")) return;
    await api.deleteProvider(id);
    load();
  };

  const updateModel = (index: number, field: string, value: any) => {
    const models = [...(editing?.models ?? [])];
    let model = models[index];
    if (typeof model === "string") {
      model = { id: model };
    }
    (model as any)[field] = value;
    models[index] = model;
    setEditing({ ...editing, models });
  };

  const addModel = () => {
    setEditing({ ...editing, models: [...(editing?.models ?? []), ""] });
  };

  const removeModel = (index: number) => {
    const models = [...(editing?.models ?? [])];
    models.splice(index, 1);
    setEditing({ ...editing, models });
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold">Providers</h2>
        <button
          onClick={() => { setEditing({ type: "openai", models: [], enabled: true }); setIsNew(true); }}
          className="px-4 py-2 bg-indigo-600 text-white rounded text-sm hover:bg-indigo-700"
        >
          Add Provider
        </button>
      </div>

      <div className="grid gap-4">
        {providers.map((p) => (
          <div key={p.id} className="bg-white rounded-lg shadow p-4 flex items-center justify-between">
            <div>
              <div className="font-medium">{p.name}</div>
              <div className="text-sm text-gray-500">{p.type} &middot; {p.baseUrl}{p.group ? ` · group: ${p.group}` : ""}</div>
              <div className="text-xs text-gray-400 font-mono mt-1">API Key: {Array.isArray(p.apiKey) ? `${p.apiKey.length} keys` : p.apiKey}</div>
              <div className="text-xs text-gray-500 mt-1">Models: {p.models?.map((m) => getModelId(m)).join(", ") || "none"}</div>
            </div>
            <div className="flex items-center gap-2">
              <span className={`px-2 py-0.5 rounded text-xs ${p.enabled ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                {p.enabled ? "Active" : "Disabled"}
              </span>
              <button onClick={() => { setEditing(p); setIsNew(false); }} className="text-sm text-indigo-600 hover:underline">Edit</button>
              <button onClick={() => remove(p.id)} className="text-sm text-red-600 hover:underline">Delete</button>
            </div>
          </div>
        ))}
      </div>

      {editing && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-[560px] max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold mb-4">{isNew ? "Add" : "Edit"} Provider</h3>
            <div className="space-y-3">
              <Field label="Name" value={editing.name ?? ""} onChange={(v) => setEditing({ ...editing, name: v })} />
              <div>
                <label className="block text-sm text-gray-600 mb-1">Type</label>
                <select
                  value={editing.type ?? "openai"}
                  onChange={(e) => setEditing({ ...editing, type: e.target.value })}
                  className="w-full border rounded px-3 py-2 text-sm"
                >
                  <option value="openai">OpenAI</option>
                  <option value="anthropic">Anthropic</option>
                </select>
              </div>
              <Field label="Base URL" value={editing.baseUrl ?? ""} onChange={(v) => setEditing({ ...editing, baseUrl: v })} />
              <Field label="Group (optional, for key access control)" value={editing.group ?? ""} onChange={(v) => setEditing({ ...editing, group: v || undefined })} />
              <div>
                <label className="block text-sm text-gray-600 mb-1">API Keys (one per line, multiple keys enable load balancing)</label>
                <textarea
                  value={editing._apiKeysText ?? (Array.isArray(editing.apiKey) ? editing.apiKey.join("\n") : (editing.apiKey ?? ""))}
                  onChange={(e) => {
                    const text = e.target.value;
                    const keys = text.split("\n").map(s => s.trim()).filter(Boolean);
                    setEditing({ ...editing, _apiKeysText: text, apiKey: keys.length === 1 ? keys[0] : keys });
                  }}
                  onKeyDown={(e) => e.stopPropagation()}
                  rows={3}
                  placeholder="sk-your-api-key"
                  className="w-full border rounded px-3 py-2 text-sm font-mono"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Models</label>
                <div className="space-y-2">
                  {(editing.models ?? []).map((m, i) => (
                    <div key={i} className="flex gap-2 items-start">
                      <input
                        type="text"
                        value={getModelId(m)}
                        onChange={(e) => updateModel(i, "id", e.target.value)}
                        placeholder="model-id"
                        className="flex-1 border rounded px-2 py-1.5 text-sm font-mono"
                      />
                      <input
                        type="number"
                        value={typeof m === "object" ? (m.inputPrice ?? "") : ""}
                        onChange={(e) => updateModel(i, "inputPrice", e.target.value ? Number(e.target.value) : undefined)}
                        placeholder="Input $/1M"
                        title="Input price ($ per 1M tokens)"
                        className="w-24 border rounded px-2 py-1.5 text-sm"
                      />
                      <input
                        type="number"
                        value={typeof m === "object" ? (m.outputPrice ?? "") : ""}
                        onChange={(e) => updateModel(i, "outputPrice", e.target.value ? Number(e.target.value) : undefined)}
                        placeholder="Output $/1M"
                        title="Output price ($ per 1M tokens)"
                        className="w-24 border rounded px-2 py-1.5 text-sm"
                      />
                      <button onClick={() => removeModel(i)} className="text-red-500 hover:text-red-700 px-1 py-1.5">×</button>
                    </div>
                  ))}
                  <button onClick={addModel} type="button" className="text-sm text-indigo-600 hover:underline">+ Add model</button>
                  <div className="text-xs text-gray-400">Prices are in USD per 1M tokens (optional)</div>
                </div>
              </div>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={editing.enabled ?? true}
                  onChange={(e) => setEditing({ ...editing, enabled: e.target.checked })}
                />
                Enabled
              </label>
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <button onClick={() => setEditing(null)} className="px-4 py-2 border rounded text-sm">Cancel</button>
              <button onClick={save} className="px-4 py-2 bg-indigo-600 text-white rounded text-sm">Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Field({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <label className="block text-sm text-gray-600 mb-1">{label}</label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full border rounded px-3 py-2 text-sm"
      />
    </div>
  );
}
