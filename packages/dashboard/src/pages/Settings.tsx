import { useEffect, useState } from "react";
import { api } from "../lib/api";

interface SettingsData {
  defaultCurrency: string;
}

const STORAGE_KEY = "tokenparty_settings";

function loadSettings(): SettingsData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return { defaultCurrency: "USD" };
}

function saveSettings(data: SettingsData) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function getSettings(): SettingsData {
  return loadSettings();
}

export default function Settings() {
  const [settings, setSettings] = useState<SettingsData>(loadSettings);
  const [saved, setSaved] = useState(false);

  const update = (patch: Partial<SettingsData>) => {
    const next = { ...settings, ...patch };
    setSettings(next);
    saveSettings(next);
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Settings</h2>

      <div className="bg-white rounded-lg shadow p-6 max-w-lg space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Default Currency</label>
          <p className="text-xs text-gray-500 mb-2">Used as the default display currency for costs. Each provider can override this with its own currency setting.</p>
          <select
            value={settings.defaultCurrency}
            onChange={(e) => update({ defaultCurrency: e.target.value })}
            className="w-48 border rounded px-3 py-2 text-sm"
          >
            <option value="USD">$ USD</option>
            <option value="CNY">¥ CNY</option>
          </select>
        </div>

        {saved && (
          <div className="text-sm text-green-600">Settings saved</div>
        )}
      </div>
    </div>
  );
}
