import { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { api } from "../lib/api";
import { formatCost } from "./Settings";

type GroupBy = "user" | "provider" | "model";

const COLORS = ["#6366f1", "#22c55e", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4", "#ec4899", "#14b8a6"];

export default function Overview() {
  const [stats, setStats] = useState<any[]>([]);
  const [days, setDays] = useState(7);
  const [keyNames, setKeyNames] = useState<Record<string, string>>({});
  const [providerNames, setProviderNames] = useState<Record<string, string>>({});

  useEffect(() => {
    api.getStats(days).then(setStats).catch(console.error);
  }, [days]);

  useEffect(() => {
    api.getKeys().then((keys) => {
      const map: Record<string, string> = {};
      for (const k of keys) map[k.key] = k.name;
      setKeyNames(map);
    }).catch(console.error);
    api.getProviders().then((providers) => {
      const map: Record<string, string> = {};
      for (const p of providers) map[p.id] = p.name;
      setProviderNames(map);
    }).catch(console.error);
  }, []);

  const totalRequests = stats.reduce((s, r) => s + r.request_count, 0);
  const totalInput = stats.reduce((s, r) => s + r.input_tokens, 0);
  const totalOutput = stats.reduce((s, r) => s + r.output_tokens, 0);
  const totalCacheRead = stats.reduce((s, r) => s + (r.cache_read_tokens ?? 0), 0);
  const totalCost = stats.reduce((s, r) => s + (r.cost ?? 0), 0);

  const dailyData = stats.reduce((acc: any[], row) => {
    const existing = acc.find((d) => d.date === row.date);
    if (existing) {
      existing.input_tokens += row.input_tokens;
      existing.output_tokens += row.output_tokens;
      existing.request_count += row.request_count;
      existing.cost += row.cost ?? 0;
    } else {
      acc.push({ date: row.date, input_tokens: row.input_tokens, output_tokens: row.output_tokens, request_count: row.request_count, cost: row.cost ?? 0 });
    }
    return acc;
  }, []).sort((a, b) => a.date.localeCompare(b.date));

  const aggregate = (groupKey: GroupBy) => {
    const map = new Map<string, { requests: number; input: number; output: number; cacheRead: number; cost: number }>();
    for (const row of stats) {
      const key = groupKey === "user" ? row.token_id : groupKey === "provider" ? row.provider_id : row.model;
      const existing = map.get(key) ?? { requests: 0, input: 0, output: 0, cacheRead: 0, cost: 0 };
      existing.requests += row.request_count;
      existing.input += row.input_tokens;
      existing.output += row.output_tokens;
      existing.cacheRead += row.cache_read_tokens ?? 0;
      existing.cost += row.cost ?? 0;
      map.set(key, existing);
    }
    return Array.from(map.entries())
      .map(([key, val]) => ({
        key,
        label: groupKey === "user" ? (keyNames[key] || key?.slice(0, 12))
          : groupKey === "provider" ? (providerNames[key] || `${key} (deleted)`)
          : key,
        ...val,
      }))
      .sort((a, b) => b.cost - a.cost);
  };

  const byUser = aggregate("user");
  const byProvider = aggregate("provider");
  const byModel = aggregate("model");

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Overview</h2>
        <select value={days} onChange={(e) => setDays(Number(e.target.value))} className="border rounded px-3 py-1 text-sm">
          <option value={7}>Last 7 days</option>
          <option value={14}>Last 14 days</option>
          <option value={30}>Last 30 days</option>
        </select>
      </div>

      <div className="grid grid-cols-5 gap-4 mb-6">
        <StatCard label="Requests" value={totalRequests.toLocaleString()} />
        <StatCard label="Input Tokens" value={totalInput.toLocaleString()} />
        <StatCard label="Output Tokens" value={totalOutput.toLocaleString()} />
        <StatCard label="Cache Read" value={totalCacheRead.toLocaleString()} />
        <StatCard label="Total Cost" value={formatCost(totalCost)} />
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <MiniChart title="Tokens" data={dailyData}>
          <Bar dataKey="input_tokens" name="Input" fill="#6366f1" stackId="tokens" />
          <Bar dataKey="output_tokens" name="Output" fill="#22c55e" stackId="tokens" />
        </MiniChart>
        <MiniChart title="Cost" data={dailyData} yFormatter={(v) => `$${v.toFixed(2)}`} tooltipFormatter={(v: number) => formatCost(v)}>
          <Bar dataKey="cost" name="Cost" fill="#f59e0b" />
        </MiniChart>
        <MiniChart title="Requests" data={dailyData}>
          <Bar dataKey="request_count" name="Requests" fill="#6366f1" />
        </MiniChart>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <BreakdownTable title="By User" data={byUser} />
        <BreakdownTable title="By Provider" data={byProvider} />
        <BreakdownTable title="By Model" data={byModel} />
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-white rounded-lg shadow p-4">
      <div className="text-sm text-gray-500">{label}</div>
      <div className="text-2xl font-bold mt-1">{value}</div>
    </div>
  );
}

function MiniChart({ title, data, children, yFormatter, tooltipFormatter }: {
  title: string;
  data: any[];
  children: React.ReactNode;
  yFormatter?: (v: number) => string;
  tooltipFormatter?: (v: number) => string;
}) {
  return (
    <div className="bg-white rounded-lg shadow p-4">
      <h3 className="font-semibold text-sm text-gray-700 mb-2">{title}</h3>
      <div style={{ height: 200 }}>
        <ResponsiveContainer>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" tick={{ fontSize: 10 }} tickFormatter={(v) => v.slice(5)} />
            <YAxis tick={{ fontSize: 10 }} tickFormatter={yFormatter} width={50} />
            <Tooltip formatter={tooltipFormatter} labelFormatter={(l) => l} />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            {children}
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function BreakdownTable({ title, data }: { title: string; data: { key: string; label: string; requests: number; input: number; output: number; cost: number }[] }) {
  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <h3 className="font-semibold text-sm text-gray-700 px-4 py-3 border-b">{title}</h3>
      <table className="w-full text-sm">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-3 py-2 text-left text-xs text-gray-500">Name</th>
            <th className="px-3 py-2 text-right text-xs text-gray-500">Requests</th>
            <th className="px-3 py-2 text-right text-xs text-gray-500">Tokens</th>
            <th className="px-3 py-2 text-right text-xs text-gray-500">Cost</th>
          </tr>
        </thead>
        <tbody>
          {data.map((row, i) => (
            <tr key={row.key} className="border-t">
              <td className="px-3 py-2 text-xs">
                <span className="inline-block w-2 h-2 rounded-full mr-1.5" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                {row.label}
              </td>
              <td className="px-3 py-2 text-right text-xs">{row.requests.toLocaleString()}</td>
              <td className="px-3 py-2 text-right text-xs">{(row.input + row.output).toLocaleString()}</td>
              <td className="px-3 py-2 text-right text-xs">{formatCost(row.cost)}</td>
            </tr>
          ))}
          {data.length === 0 && (
            <tr><td colSpan={4} className="px-4 py-4 text-center text-gray-400 text-xs">No data</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
