"use client";

import { useState, useTransition } from "react";
import { updateSystemSetting } from "@/app/actions/admin";
import { he } from "@/lib/i18n/he";
import type { SystemSettingRow } from "@/types/admin";

const SETTING_LABELS: Record<string, string> = {
  site_name: "שם האתר",
  registration_enabled: "הרשמה פתוחה",
  default_plan_slug: "תוכנית ברירת מחדל",
  default_theme: "ערכת צבעים ברירת מחדל",
};

function SettingRow({
  setting,
  onSave,
  saving,
}: {
  setting: SystemSettingRow;
  onSave: (key: string, value: unknown) => void;
  saving: boolean;
}) {
  const [raw, setRaw] = useState(() =>
    typeof setting.value === "string"
      ? setting.value
      : JSON.stringify(setting.value, null, 2),
  );
  const [dirty, setDirty] = useState(false);

  function handleChange(val: string) {
    setRaw(val);
    setDirty(true);
  }

  function handleSave() {
    let parsed: unknown;
    try {
      parsed = JSON.parse(raw);
    } catch {
      parsed = raw;
    }
    onSave(setting.key, parsed);
    setDirty(false);
  }

  const label = SETTING_LABELS[setting.key] ?? setting.key;
  const isBoolean = typeof setting.value === "boolean";
  const isSimpleString = typeof setting.value === "string";
  const isComplex = !isBoolean && !isSimpleString;

  return (
    <div className="flex items-start gap-4 rounded-lg border border-neutral-200 bg-white p-4">
      <div className="w-40 shrink-0">
        <div className="text-sm font-medium">{label}</div>
        <code className="text-[10px] text-neutral-400">{setting.key}</code>
      </div>
      <div className="flex-1">
        {isBoolean ? (
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={raw === "true"}
              onChange={(e) => {
                handleChange(String(e.target.checked));
              }}
              className="rounded"
            />
            {raw === "true" ? "פעיל" : "מושבת"}
          </label>
        ) : isComplex ? (
          <textarea
            value={raw}
            onChange={(e) => handleChange(e.target.value)}
            rows={4}
            dir="ltr"
            className="block w-full font-mono text-xs"
          />
        ) : (
          <input
            type="text"
            value={raw}
            onChange={(e) => handleChange(e.target.value)}
            className="block w-full text-sm"
          />
        )}
      </div>
      <button
        type="button"
        disabled={saving || !dirty}
        onClick={handleSave}
        className="shrink-0 rounded-lg bg-blue-600 px-3 py-2 text-xs font-medium text-white transition hover:bg-blue-700 disabled:opacity-40"
      >
        {he.adminSave}
      </button>
    </div>
  );
}

export function SystemSettingsEditor({
  initialSettings,
}: {
  initialSettings: SystemSettingRow[];
}) {
  const [settings, setSettings] = useState(initialSettings);
  const [msg, setMsg] = useState("");
  const [pending, startTransition] = useTransition();

  function handleSave(key: string, value: unknown) {
    startTransition(async () => {
      const res = await updateSystemSetting(key, value);
      if (res.ok) {
        setSettings((prev) =>
          prev.map((s) =>
            s.key === key ? { ...s, value, updated_at: new Date().toISOString() } : s,
          ),
        );
        setMsg(he.adminSaved);
        setTimeout(() => setMsg(""), 2000);
      } else {
        setMsg(res.error ?? he.adminError);
      }
    });
  }

  return (
    <div className="space-y-3">
      {msg && (
        <div className="rounded-lg border border-blue-200 bg-blue-50 px-4 py-2 text-sm text-blue-700">
          {msg}
        </div>
      )}
      {settings.map((s) => (
        <SettingRow key={s.key} setting={s} onSave={handleSave} saving={pending} />
      ))}
    </div>
  );
}
