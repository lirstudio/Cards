"use client";

import { useState, useTransition } from "react";
import { updatePageSettings } from "@/app/actions/pages";
import { ImageUploadField } from "@/components/editor/image-upload-field";
import { ThemeColorField } from "@/components/editor/theme-color-field";
import { settingsLabelClass, settingsSectionClass, settingsTextInputClass } from "@/components/ui/form-styles";
import { Modal, ModalBody, ModalFooter, ModalHeader, ModalPanel } from "@/components/ui/modal";
import { he } from "@/lib/i18n/he";
import type { PageTheme } from "@/types/landing";

type ThemeForm = {
  primary: string;
  background: string;
  heading: string;
  body: string;
  siteLogoUrl: string;
  noSectionAnimations: boolean;
};

export function PageSettingsDrawer({
  pageId,
  onClose,
  initialTitle,
  initialSlug,
  initialPublished,
  initialTheme,
  onSaved,
}: {
  pageId: string;
  onClose: () => void;
  initialTitle: string;
  initialSlug: string;
  initialPublished: boolean;
  initialTheme: ThemeForm;
  onSaved: () => void;
}) {
  const [title, setTitle] = useState(initialTitle);
  const [rawSlug, setRawSlug] = useState(initialSlug);
  const [published, setPublished] = useState(initialPublished);
  const [theme, setTheme] = useState<ThemeForm>(initialTheme);
  const [msg, setMsg] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function patchTheme(p: Partial<ThemeForm>) {
    setTheme((t) => ({ ...t, ...p }));
  }

  function save() {
    setMsg(null);
    const payload: PageTheme = {
      primary: theme.primary,
      background: theme.background,
      heading: theme.heading,
      body: theme.body,
    };
    if (theme.siteLogoUrl.trim()) {
      payload.siteLogoUrl = theme.siteLogoUrl.trim();
    }
    if (theme.noSectionAnimations) {
      payload.noSectionAnimations = true;
    }
    startTransition(async () => {
      const r = await updatePageSettings(pageId, {
        title,
        rawSlug,
        theme: payload,
        published,
      });
      if (r.ok) {
        onSaved();
        onClose();
      } else {
        setMsg(r.error ?? "שגיאה");
      }
    });
  }

  return (
    <Modal
      labelledBy="page-settings-title"
      backdropAriaLabel={he.closeSettings}
      onRequestClose={onClose}
    >
      <ModalPanel maxWidthClassName="max-w-xl" dir="rtl">
        <ModalHeader
          titleId="page-settings-title"
          title={he.pageSettings}
          onClose={onClose}
          closeAriaLabel={he.closeSettings}
        />
        <ModalBody className="px-4 py-5">
          <div className="space-y-6 text-sm">
            <div className={settingsSectionClass}>
              <p className="mb-3 text-xs font-medium uppercase tracking-wide text-[#464a4d]">
                {he.pageSettingsSectionDetails}
              </p>
              <div className="space-y-4">
                <label className="block">
                  <span className={settingsLabelClass}>{he.pageTitle}</span>
                  <input
                    className={settingsTextInputClass}
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                </label>
                <label className="block">
                  <span className={settingsLabelClass}>{he.slug}</span>
                  <input
                    dir="ltr"
                    className={`${settingsTextInputClass} font-mono text-xs`}
                    value={rawSlug}
                    onChange={(e) => setRawSlug(e.target.value)}
                  />
                  <p className="mt-2 rounded-lg bg-amber-50/90 px-2.5 py-2 text-xs leading-snug text-amber-900 ring-1 ring-amber-200/60">
                    {he.slugChangeWarning}
                  </p>
                </label>
                <label className="flex cursor-pointer items-start gap-3 py-2">
                  <input
                    type="checkbox"
                    checked={published}
                    onChange={(e) => setPublished(e.target.checked)}
                    className="mt-0.5 h-4 w-4 rounded border-[rgba(214,235,253,0.19)] text-[var(--lc-primary)] focus:ring-[var(--lc-primary)]"
                  />
                  <span className="text-[#a1a4a5]">{he.pagePublishedLabel}</span>
                </label>
                <label className="flex cursor-pointer items-start gap-3 py-2">
                  <input
                    type="checkbox"
                    checked={theme.noSectionAnimations}
                    onChange={(e) => patchTheme({ noSectionAnimations: e.target.checked })}
                    className="mt-0.5 h-4 w-4 rounded border-[rgba(214,235,253,0.19)] text-[var(--lc-primary)] focus:ring-[var(--lc-primary)]"
                  />
                  <span className="min-w-0 flex-1 text-[#a1a4a5]">
                    {he.pageSettingsNoAnimations}
                    <span className="mt-1 block text-xs font-normal text-[#464a4d]">
                      {he.pageSettingsNoAnimationsHint}
                    </span>
                  </span>
                </label>
              </div>
            </div>

            <div className={settingsSectionClass}>
              <p className="mb-3 text-xs font-medium uppercase tracking-wide text-[#464a4d]">
                {he.pageSettingsSectionColors}
              </p>
              <div className="grid gap-5 sm:grid-cols-2">
                <ThemeColorField
                  label={he.themePrimary}
                  value={theme.primary}
                  onChange={(v) => patchTheme({ primary: v })}
                />
                <ThemeColorField
                  label={he.themeBg}
                  value={theme.background}
                  onChange={(v) => patchTheme({ background: v })}
                />
                <ThemeColorField
                  label={he.themeHeading}
                  value={theme.heading}
                  onChange={(v) => patchTheme({ heading: v })}
                />
                <ThemeColorField
                  label={he.themeBody}
                  value={theme.body}
                  onChange={(v) => patchTheme({ body: v })}
                />
              </div>
            </div>

            <div className={settingsSectionClass}>
              <ImageUploadField
                pageId={pageId}
                label={he.siteLogoUrl}
                value={theme.siteLogoUrl}
                onChange={(url) => patchTheme({ siteLogoUrl: url })}
              />
              <p className="mt-2 text-xs leading-relaxed text-[#464a4d]">{he.siteLogoHint}</p>
            </div>
          </div>
          {msg ? <p className="mt-3 text-sm text-red-600">{msg}</p> : null}
        </ModalBody>
        <ModalFooter>
          <button
            type="button"
            disabled={pending}
            className="w-full rounded-xl bg-white py-3 text-sm font-medium text-black transition hover:bg-white/90 disabled:opacity-50"
            onClick={save}
          >
            {pending ? "…" : he.savePageSettings}
          </button>
        </ModalFooter>
      </ModalPanel>
    </Modal>
  );
}
