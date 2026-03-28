"use client";

import { useEffect, useState } from "react";
import { settingsHexInputClass, settingsLabelClass } from "@/components/ui/form-styles";

type ThemeColorFieldProps = {
  label: string;
  value: string;
  onChange: (hex: string) => void;
};

export function ThemeColorField({ label, value, onChange }: ThemeColorFieldProps) {
  const [text, setText] = useState(value);

  useEffect(() => {
    setText(value);
  }, [value]);

  const pickerSafe = /^#[0-9A-Fa-f]{6}$/i.test(value) ? value : "#000000";

  return (
    <div className="space-y-1.5">
      <span className={settingsLabelClass}>{label}</span>
      <div className="flex items-center gap-3">
        <div
          className="relative h-12 w-12 shrink-0 overflow-hidden rounded-xl border border-neutral-200 shadow-md ring-1 ring-black/[0.08]"
          style={{ backgroundColor: pickerSafe }}
        >
          <input
            type="color"
            value={pickerSafe}
            onChange={(e) => onChange(e.target.value.toLowerCase())}
            className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
            aria-label={label}
          />
        </div>
        <input
          dir="ltr"
          type="text"
          value={text}
          onChange={(e) => {
            let v = e.target.value;
            if (v.length > 0 && !v.startsWith("#") && /^[0-9A-Fa-f]+$/.test(v)) v = `#${v}`;
            setText(v);
            if (/^#[0-9A-Fa-f]{6}$/i.test(v)) onChange(v.toLowerCase());
          }}
          onBlur={() => {
            if (/^#[0-9A-Fa-f]{6}$/i.test(text)) {
              onChange(text.toLowerCase());
              setText(text.toLowerCase());
            } else {
              setText(value);
            }
          }}
          className={settingsHexInputClass}
          maxLength={7}
          spellCheck={false}
          placeholder="#000000"
        />
      </div>
    </div>
  );
}
