"use client";

import {
  DndContext,
  DragOverlay,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  closestCorners,
  useDroppable,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import Link from "next/link";
import { Fragment, type ReactNode, useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { persistPageEditorState, setPagePublished } from "@/app/actions/pages";
import {
  LEGACY_NAV_HERO_STATS_KEY,
  SECTION_KEYS,
  isEditableSectionKey,
  type SectionKey,
} from "@/lib/sections/schemas";

import { getDefaultContent } from "@/lib/sections/defaults";
import { sectionCatalog } from "@/lib/sections/catalog";
import type { PageNavSectionRow } from "@/lib/landing/page-nav";
import { he } from "@/lib/i18n/he";
import { FullscreenLandingPreview } from "@/components/editor/fullscreen-landing-preview";
import { SectionLivePreviewStage } from "@/components/editor/section-live-preview-stage";
import { SectionInspectorForm } from "@/components/editor/section-inspector-form";
import { SectionRenderer } from "@/components/landing/SectionRenderer";
import { PageSettingsDrawer } from "@/components/editor/page-settings-drawer";
import {
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  ModalPanel,
} from "@/components/ui/modal";
import { SectionTypePreview } from "@/components/editor/section-type-preview";
import type { PageTheme } from "@/types/landing";
import type { SectionDefinitionRow, SectionStyleOverrides } from "@/types/admin";

const EMBEDDED_HERO_PREVIEW_KEYS = new Set<string>([
  "hero_image_split",
  "hero_editorial_split",
  "hero_immersive_bg",
  "hero_showcase_float",
  LEGACY_NAV_HERO_STATS_KEY,
]);

const TEMP_SECTION_PREFIX = "temp-";

type SectionRow = {
  id: string;
  section_key: string;
  content: Record<string, unknown>;
  visible: boolean;
};

function clonePageSections(rows: SectionRow[]): SectionRow[] {
  return rows.map((r) => ({
    ...r,
    content: structuredClone(r.content),
  }));
}

/** סדר סקשנים, הוספות/מחיקות מקומיות או שינוי תוכן/גלוי לעומת baseline מהשרת */
function isPageDirty(current: SectionRow[], baseline: SectionRow[]): boolean {
  const orderA = current.map((s) => s.id).join("\0");
  const orderB = baseline.map((s) => s.id).join("\0");
  if (orderA !== orderB) return true;
  const byId = new Map(baseline.map((s) => [s.id, s]));
  for (const s of current) {
    const b = byId.get(s.id);
    if (!b) return true;
    if (b.visible !== s.visible) return true;
    if (JSON.stringify(b.content) !== JSON.stringify(s.content)) return true;
  }
  return false;
}

const INSERT_PREFIX = "insert:";

/** סטטוס מה־DB — מנקה רווחים */
function isPublishedStatus(status: string): boolean {
  return String(status).trim() === "published";
}

function IconDragHandle({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width={18}
      height={18}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden
    >
      <circle cx="9" cy="6" r="1.6" />
      <circle cx="15" cy="6" r="1.6" />
      <circle cx="9" cy="12" r="1.6" />
      <circle cx="15" cy="12" r="1.6" />
      <circle cx="9" cy="18" r="1.6" />
      <circle cx="15" cy="18" r="1.6" />
    </svg>
  );
}

function IconTrash({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width={18}
      height={18}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6h14zM10 11v6M14 11v6" />
    </svg>
  );
}

type PreviewViewport = "narrow" | "medium" | "wide";

function previewInnerWidthClass(v: PreviewViewport): string {
  switch (v) {
    case "narrow":
      return "w-full min-w-0 max-w-[390px] shrink-0";
    case "medium":
      return "w-full min-w-0 max-w-[768px] shrink-0";
    case "wide":
    default:
      return "w-full min-w-0 max-w-none";
  }
}

function PreviewViewportToolbar({
  value,
  onChange,
  onFullscreen,
  enableFullscreen = true,
}: {
  value: PreviewViewport;
  onChange: (v: PreviewViewport) => void;
  onFullscreen?: () => void;
  enableFullscreen?: boolean;
}) {
  const options: { id: PreviewViewport; label: string; icon: ReactNode }[] = [
    {
      id: "narrow",
      label: he.previewViewportNarrow,
      icon: (
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
          <rect x="8.5" y="3" width="7" height="18" rx="1.25" />
          <line x1="12" y1="17.5" x2="12" y2="17.5" strokeLinecap="round" />
        </svg>
      ),
    },
    {
      id: "medium",
      label: he.previewViewportMedium,
      icon: (
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
          <rect x="6" y="3.5" width="12" height="17" rx="1.25" />
          <line x1="12" y1="18" x2="12" y2="18" strokeLinecap="round" />
        </svg>
      ),
    },
    {
      id: "wide",
      label: he.previewViewportWide,
      icon: (
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
          <rect x="2.5" y="5" width="19" height="12" rx="1.25" />
          <path d="M9 21h6" strokeLinecap="round" />
        </svg>
      ),
    },
  ];

  return (
    <div
      className="flex shrink-0 flex-wrap items-center gap-0.5 rounded-lg border border-[rgba(214,235,253,0.19)] bg-white/5 p-0.5"
      role="group"
      aria-label={he.previewViewportAria}
    >
      {options.map((o) => (
        <button
          key={o.id}
          type="button"
          onClick={() => onChange(o.id)}
          title={o.label}
          aria-label={o.label}
          aria-pressed={value === o.id}
          className={`inline-flex h-8 min-w-8 items-center justify-center rounded-md px-2 transition ${
            value === o.id
              ? "bg-[var(--lc-primary)] text-white"
              : "text-[#a1a4a5] hover:bg-white/10 hover:text-[#f0f0f0]"
          }`}
        >
          {o.icon}
        </button>
      ))}
      {enableFullscreen && onFullscreen ? (
        <button
          type="button"
          onClick={onFullscreen}
          title={he.previewFullscreen}
          aria-label={he.previewFullscreen}
          className="ms-0.5 inline-flex h-8 min-w-8 items-center justify-center rounded-md border border-transparent px-2 text-[#a1a4a5] transition hover:border-[rgba(214,235,253,0.19)] hover:bg-white/10 hover:text-[#f0f0f0]"
        >
          <svg
            width="17"
            height="17"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.75"
            aria-hidden
          >
            <path
              d="M4 9V4h5M15 4h5v5M20 15v5h-5M9 20H4v-5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      ) : null}
    </div>
  );
}

function InsertZone({ index }: { index: number }) {
  const id = `${INSERT_PREFIX}${index}`;
  const { setNodeRef, isOver } = useDroppable({ id });
  return (
    <div
      ref={setNodeRef}
      aria-hidden
      className="relative mx-1 flex h-2 min-h-[6px] cursor-default items-center justify-center sm:h-2.5 sm:min-h-[8px]"
    >
      <div
        className={`pointer-events-none h-px w-full max-w-[calc(100%-8px)] rounded-full transition-colors duration-200 ${
          isOver ? "bg-[var(--lc-primary)]" : "bg-white/10"
        }`}
      />
    </div>
  );
}

function PaletteCard({
  sectionKey,
  onAdd,
  titleHe,
}: {
  sectionKey: SectionKey;
  onAdd: (key: SectionKey) => void;
  titleHe?: string;
}) {
  const meta = sectionCatalog[sectionKey];
  const title = titleHe ?? meta?.titleHe ?? sectionKey;
  return (
    <div className="relative rounded-xl border border-[rgba(214,235,253,0.19)] bg-white/5 p-2 pt-10 text-start transition hover:border-[var(--lc-primary)]">
      <button
        type="button"
        className="absolute end-2 top-2 z-10 flex h-9 w-9 items-center justify-center rounded-full border border-[var(--lc-primary)] bg-[var(--lc-primary)] text-lg font-semibold leading-none text-white hover:opacity-90"
        aria-label={he.addSectionAria}
        onClick={() => onAdd(sectionKey)}
      >
        +
      </button>
      <SectionTypePreview sectionKey={sectionKey} />
      <div className="mt-2 px-1">
        <div className="text-sm font-medium">{title}</div>
      </div>
    </div>
  );
}

function SortableRow({
  id,
  children,
}: {
  id: string;
  children: (handleProps: {
    attributes: ReturnType<typeof useSortable>["attributes"];
    listeners: ReturnType<typeof useSortable>["listeners"];
  }) => React.ReactNode;
}) {
  const { setNodeRef, transform, transition, attributes, listeners } = useSortable({ id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };
  return (
    <div ref={setNodeRef} style={style} className="overflow-visible">
      {children({ attributes, listeners })}
    </div>
  );
}

export function PageEditor({
  pageId,
  slug,
  status,
  showNewDraftHint = false,
  initialTitle,
  pageHeadline,
  initialTheme,
  sections: initialSections,
  sectionDefs,
  definitionStyleBySectionKey = {},
}: {
  pageId: string;
  slug: string;
  status: string;
  /** מוצג אחרי יצירת טיוטה חדשה מהדשבורד */
  showNewDraftHint?: boolean;
  initialTitle: string;
  /** כותרת להצגה מעל העורך (לרוב כותרת העמוד) */
  pageHeadline: string;
  initialTheme: {
    primary: string;
    background: string;
    heading: string;
    body: string;
    siteLogoUrl: string;
    noSectionAnimations: boolean;
  };
  sections: SectionRow[];
  sectionDefs?: SectionDefinitionRow[];
  definitionStyleBySectionKey?: Record<string, SectionStyleOverrides>;
}) {
  const router = useRouter();
  const [sections, setSections] = useState(initialSections);
  const [baselineSections, setBaselineSections] = useState(() => clonePageSections(initialSections));
  const [leaveTarget, setLeaveTarget] = useState<string | null>(null);
  const [leaveBusy, setLeaveBusy] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(initialSections[0]?.id ?? null);
  const [rightPanel, setRightPanel] = useState<"library" | "edit">("library");
  const [addSectionKey, setAddSectionKey] = useState<SectionKey | null>(null);
  const [addFormNonce, setAddFormNonce] = useState(0);
  const [addPreviewDraft, setAddPreviewDraft] = useState<Record<string, unknown>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [livePreviewViewport, setLivePreviewViewport] = useState<PreviewViewport>("wide");
  const [addModalPreviewViewport, setAddModalPreviewViewport] = useState<PreviewViewport>("wide");
  const [immersivePreviewOpen, setImmersivePreviewOpen] = useState(false);
  const [newDraftHintDismissed, setNewDraftHintDismissed] = useState(false);
  /** מסונכרן עם השרת; מתעדכן מיד אחרי פרסום/ביטול כדי שכפתור הצפייה יופיע בלי להמתין ל־refresh */
  const [isPublishedLive, setIsPublishedLive] = useState(() => isPublishedStatus(status));

  useEffect(() => {
    setIsPublishedLive(isPublishedStatus(status));
  }, [status]);

  const isDirty = useMemo(
    () => isPageDirty(sections, baselineSections),
    [sections, baselineSections],
  );

  const styleForSectionKey = useCallback(
    (sectionKey: string): SectionStyleOverrides | undefined =>
      definitionStyleBySectionKey[sectionKey],
    [definitionStyleBySectionKey],
  );

  useEffect(() => {
    if (!isDirty) return;
    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
    };
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [isDirty]);

  const persistSections = useCallback(async (): Promise<boolean> => {
    if (!isPageDirty(sections, baselineSections)) return true;

    const working = clonePageSections(sections);
    const rows = working.map((s) => ({
      id: s.id.startsWith(TEMP_SECTION_PREFIX) ? null : s.id,
      section_key: s.section_key,
      content: s.content,
      visible: s.visible,
    }));

    const r = await persistPageEditorState(pageId, rows);
    if (!r.ok) {
      window.alert(r.error ?? "שגיאה");
      return false;
    }

    const nextBaseline = clonePageSections(
      working.map((s, i) => ({ ...s, id: r.orderedSectionIds[i]! })),
    );
    setSections(nextBaseline);
    setBaselineSections(nextBaseline);
    router.refresh();
    return true;
  }, [sections, baselineSections, pageId, router]);

  function requestNavigate(href: string) {
    if (isDirty) setLeaveTarget(href);
    else router.push(href);
  }

  async function confirmSaveAndLeave() {
    setLeaveBusy(true);
    try {
      const ok = await persistSections();
      if (ok && leaveTarget) {
        router.push(leaveTarget);
        setLeaveTarget(null);
      }
    } finally {
      setLeaveBusy(false);
    }
  }

  function confirmLeaveWithoutSaving() {
    if (leaveTarget) {
      router.push(leaveTarget);
      setLeaveTarget(null);
    }
  }

  async function handleSavePage() {
    setIsSaving(true);
    try {
      await persistSections();
    } finally {
      setIsSaving(false);
    }
  }

  async function handlePublishToggle(publish: boolean) {
    setIsSaving(true);
    try {
      if (isDirty) {
        const ok = await persistSections();
        if (!ok) return;
      }
      const r = await setPagePublished(pageId, publish);
      if (r.ok) {
        setIsPublishedLive(publish);
        router.refresh();
      } else window.alert(r.error ?? "שגיאה");
    } finally {
      setIsSaving(false);
    }
  }

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const ids = useMemo(() => sections.map((s) => s.id), [sections]);
  const selected = sections.find((s) => s.id === selectedId) ?? null;

  const themeForRenderer: PageTheme = {
    primary: initialTheme.primary,
    background: initialTheme.background,
    heading: initialTheme.heading,
    body: initialTheme.body,
    ...(initialTheme.siteLogoUrl.trim()
      ? { siteLogoUrl: initialTheme.siteLogoUrl.trim() }
      : {}),
    ...(initialTheme.noSectionAnimations ? { noSectionAnimations: true } : {}),
  };

  const pageNavSections: PageNavSectionRow[] = useMemo(
    () =>
      sections.map((s) => ({
        sectionKey: s.section_key,
        sectionId: s.id,
        visible: s.visible,
      })),
    [sections],
  );

  const handleDraftChange = useCallback((draft: Record<string, unknown>) => {
    if (!selectedId) return;
    setSections((prev) =>
      prev.map((s) => (s.id === selectedId ? { ...s, content: draft } : s)),
    );
  }, [selectedId]);

  function onDragStart(e: DragStartEvent) {
    setActiveId(String(e.active.id));
  }

  async function onDragEnd(e: DragEndEvent) {
    const { active, over } = e;
    setActiveId(null);
    if (!over) return;

    const aid = String(active.id);
    const oid = String(over.id);

    if (oid.startsWith(INSERT_PREFIX)) {
      const k = parseInt(oid.slice(INSERT_PREFIX.length), 10);
      const oldIdx = sections.findIndex((s) => s.id === aid);
      if (oldIdx < 0 || Number.isNaN(k)) return;
      const next = [...sections];
      const [removed] = next.splice(oldIdx, 1);
      const newIdx = k > oldIdx ? k - 1 : k;
      next.splice(newIdx, 0, removed);
      setSections(next);
      return;
    }

    if (ids.includes(aid) && ids.includes(oid) && aid !== oid) {
      const oldIndex = ids.indexOf(aid);
      const newIndex = ids.indexOf(oid);
      if (oldIndex < 0 || newIndex < 0) return;
      const next = [...sections];
      const [removed] = next.splice(oldIndex, 1);
      next.splice(newIndex, 0, removed);
      setSections(next);
    }
  }

  const defsMap = useMemo(() => {
    const m = new Map<string, SectionDefinitionRow>();
    for (const d of sectionDefs ?? []) m.set(d.key, d);
    return m;
  }, [sectionDefs]);

  const paletteKeys = useMemo(() => {
    if (sectionDefs && sectionDefs.length > 0) {
      return sectionDefs
        .filter((d) => d.enabled && SECTION_KEYS.includes(d.key as SectionKey))
        .sort((a, b) => a.sort_order - b.sort_order)
        .map((d) => d.key as SectionKey);
    }
    const order: SectionKey[] = [
      "hero",
      "content",
      "conversion",
      "footer",
      "gallery",
      "faq",
    ].flatMap((cat) => SECTION_KEYS.filter((k) => sectionCatalog[k].category === cat));
    return order;
  }, [sectionDefs]);

  const dragOverlay =
    activeId && ids.includes(activeId) ? (() => {
      const sec = sections.find((s) => s.id === activeId);
      const sk = sec?.section_key ?? "";
      return (
        <div className="rounded-xl border border-[rgba(214,235,253,0.19)] bg-white/5 p-3 shadow-lg">
          {defsMap.get(sk)?.title_he ?? sectionCatalog[sk as SectionKey]?.titleHe ?? sk}
        </div>
      );
    })() : null;

  function openAddSection(key: SectionKey) {
    setAddPreviewDraft(getDefaultContent(key));
    setAddSectionKey(key);
    setAddFormNonce((n) => n + 1);
  }

  return (
    <>
      {leaveTarget ? (
        <Modal
          labelledBy="leave-edit-title"
          backdropAriaLabel={he.unsavedStayEditing}
          onRequestClose={() => setLeaveTarget(null)}
          zClassName="z-[80]"
        >
          <ModalPanel maxWidthClassName="max-w-md" dir="rtl">
            <ModalHeader
              titleId="leave-edit-title"
              title={he.unsavedChangesTitle}
              onClose={() => setLeaveTarget(null)}
              closeAriaLabel={he.cancel}
            />
            <ModalBody className="px-4 py-4">
              <p className="text-sm leading-relaxed text-[#a1a4a5]">{he.unsavedChangesBody}</p>
            </ModalBody>
            <ModalFooter className="flex flex-wrap justify-end gap-2">
              <button
                type="button"
                className="rounded-lg border border-[rgba(214,235,253,0.19)] bg-white/5 px-3 py-2 text-sm hover:bg-white/10"
                onClick={() => setLeaveTarget(null)}
              >
                {he.unsavedStayEditing}
              </button>
              <button
                type="button"
                disabled={leaveBusy}
                className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800 hover:bg-red-100 disabled:opacity-50"
                onClick={confirmLeaveWithoutSaving}
              >
                {he.unsavedLeaveWithoutSaving}
              </button>
              <button
                type="button"
                disabled={leaveBusy}
                className="rounded-lg bg-[var(--lc-primary)] px-3 py-2 text-sm font-medium text-white hover:opacity-95 disabled:opacity-50"
                onClick={() => void confirmSaveAndLeave()}
              >
                {he.unsavedSaveAndLeave}
              </button>
            </ModalFooter>
          </ModalPanel>
        </Modal>
      ) : null}

      <div className="mt-6 space-y-6">
        {showNewDraftHint && !newDraftHintDismissed ? (
          <div
            className="flex flex-wrap items-start justify-between gap-3 rounded-xl border border-blue-200 bg-blue-50/90 px-4 py-3 text-sm text-[#a1a4a5]"
            role="status"
          >
            <p className="min-w-0 flex-1 leading-relaxed">{he.newDraftEditorHint}</p>
            <button
              type="button"
              className="shrink-0 rounded-lg bg-white/5 px-3 py-1.5 text-sm font-medium text-[#a1a4a5] ring-1 ring-[rgba(214,235,253,0.19)] hover:bg-white/10"
              onClick={() => setNewDraftHintDismissed(true)}
            >
              {he.newDraftEditorHintDismiss}
            </button>
          </div>
        ) : null}
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0">
            <button
              type="button"
              className="text-sm text-[var(--lc-primary)] hover:underline"
              onClick={() => requestNavigate("/dashboard")}
            >
              ← {he.back}
            </button>
            <h1 className="mt-3 text-2xl font-bold">{pageHeadline}</h1>
            <p className="mt-1 text-sm text-[#a1a4a5]">{he.reorderHint}</p>
          </div>
          <div className="flex flex-wrap items-center gap-2" dir="rtl">
            <button
              type="button"
              disabled={!isDirty || isSaving}
              className="rounded-full border border-[rgba(214,235,253,0.19)] bg-white/5 px-4 py-2 text-sm font-medium hover:bg-white/10 disabled:opacity-50"
              onClick={() => void handleSavePage()}
            >
              {isSaving ? he.savingPageChanges : he.savePageChanges}
            </button>
            {isPublishedLive ? (
              <button
                type="button"
                disabled={isSaving}
                className="rounded-full border border-amber-200 bg-amber-50 px-4 py-2 text-sm font-medium text-amber-950 hover:bg-amber-100/90 disabled:opacity-50"
                onClick={() => void handlePublishToggle(false)}
              >
                {he.unpublishPage}
              </button>
            ) : (
              <button
                type="button"
                disabled={isSaving}
                className="rounded-full bg-[var(--lc-primary)] px-4 py-2 text-sm font-medium text-white hover:opacity-95 disabled:opacity-50"
                onClick={() => void handlePublishToggle(true)}
              >
                {he.publishPage}
              </button>
            )}
            {isPublishedLive ? (
              <Link
                href={`/${slug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-full border border-[rgba(214,235,253,0.19)] bg-white/5 px-4 py-2 text-sm font-medium hover:bg-white/10"
              >
                {he.openPage}
              </Link>
            ) : null}
            <button
              type="button"
              className="rounded-full border border-[rgba(214,235,253,0.19)] bg-white/5 px-4 py-2 text-sm font-medium hover:bg-white/10"
              onClick={() => setSettingsOpen(true)}
            >
              {he.pageSettings}
            </button>
          </div>
        </div>
        {isDirty ? (
          <p
            className="rounded-lg bg-amber-50 px-3 py-2 text-xs font-medium text-amber-950 ring-1 ring-amber-200/70"
            dir="rtl"
          >
            {he.unsavedBanner}
          </p>
        ) : null}

        {settingsOpen ? (
        <PageSettingsDrawer
          pageId={pageId}
          onClose={() => setSettingsOpen(false)}
          initialTitle={initialTitle}
          initialSlug={slug}
          initialPublished={isPublishedLive}
          initialTheme={initialTheme}
          onSaved={() => {
            router.refresh();
          }}
        />
      ) : null}

      {addSectionKey ? (
        <Modal
          labelledBy="add-section-dialog-title"
          backdropAriaLabel={he.cancel}
          onRequestClose={() => setAddSectionKey(null)}
        >
          <ModalPanel dir="rtl" maxWidthClassName="max-w-6xl">
            <ModalHeader
              dense
              titleId="add-section-dialog-title"
              title={
                <>
                  {he.addSectionDialogTitle}:{" "}
                  {defsMap.get(addSectionKey)?.title_he ??
                    sectionCatalog[addSectionKey]?.titleHe ??
                    addSectionKey}
                </>
              }
              onClose={() => setAddSectionKey(null)}
              closeAriaLabel={he.cancel}
            />
            <ModalBody className="px-3 pb-3 pt-0 sm:px-4">
              {/*
                flex + items-start: מונע יישור אנכי של עמודת התצוגה המקדימה כשעמודת הטופס גבוהה.
                order: במובייל תצוגה מקדימה למעלה; ב־lg סדר דומה לגריד RTL (טופס ימין, תצוגה שמאל).
                בחירת עיצוב — רק בעמודת הטופס (ימין ב־RTL), לא ברוחב המלא של המודאל.
              */}
              <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:gap-4">
                <div className="order-2 min-w-0 w-full flex-1 lg:order-1">
                  <SectionInspectorForm
                    key={`add-${addSectionKey}-${addFormNonce}`}
                    embedded
                    pageId={pageId}
                    sectionKey={addSectionKey}
                    content={getDefaultContent(addSectionKey)}
                    pageNavSections={
                      addSectionKey === "site_header_nav" ? pageNavSections : undefined
                    }
                    onDraftChange={setAddPreviewDraft}
                    onAdd={async (draft) => {
                      const tempId = `${TEMP_SECTION_PREFIX}${crypto.randomUUID()}`;
                      const row: SectionRow = {
                        id: tempId,
                        section_key: addSectionKey,
                        content: draft,
                        visible: true,
                      };
                      setSections((prev) => [...prev, row]);
                      setAddSectionKey(null);
                      setSelectedId(tempId);
                      setRightPanel("edit");
                      return { ok: true as const };
                    }}
                  />
                </div>
                <div className="order-1 min-w-0 flex-1 self-start lg:order-2">
                  <div className="mb-2 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <h3 className="text-sm font-semibold text-[#a1a4a5]">{he.addSectionLivePreview}</h3>
                    <PreviewViewportToolbar
                      value={addModalPreviewViewport}
                      onChange={setAddModalPreviewViewport}
                      enableFullscreen={false}
                    />
                  </div>
                  <div
                    className="max-h-[min(72vh,780px)] min-h-0 overflow-y-auto overflow-x-auto rounded-xl border border-[rgba(214,235,253,0.19)] shadow-inner"
                    style={{ backgroundColor: initialTheme.background }}
                  >
                    <div
                      id="lc-page-top"
                      className={`lc-page-root mx-auto ${previewInnerWidthClass(addModalPreviewViewport)}`}
                    >
                      <SectionLivePreviewStage minHeightClass="min-h-[min(72vh,780px)]">
                        <SectionRenderer
                          sectionKey={addSectionKey}
                          content={addPreviewDraft}
                          visible
                          theme={themeForRenderer}
                          landingPageId={pageId}
                          sectionId={`add-preview-${addSectionKey}`}
                          editorPreview
                          embedded={EMBEDDED_HERO_PREVIEW_KEYS.has(addSectionKey)}
                          variantStyleOverrides={styleForSectionKey(addSectionKey)}
                          pageNavSections={pageNavSections}
                        />
                      </SectionLivePreviewStage>
                    </div>
                  </div>
                </div>
              </div>
            </ModalBody>
          </ModalPanel>
        </Modal>
      ) : null}

      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={onDragStart}
        onDragEnd={onDragEnd}
      >
        <div
          dir="ltr"
          className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(300px,400px)] lg:items-start"
        >
          <div className="min-w-0">
            <div className="mb-2 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <h3 className="text-sm font-semibold">{he.livePreview}</h3>
              <div className="flex flex-wrap items-center gap-2">
                <PreviewViewportToolbar
                  value={livePreviewViewport}
                  onChange={setLivePreviewViewport}
                  onFullscreen={
                    sections.length > 0 ? () => setImmersivePreviewOpen(true) : undefined
                  }
                />
                <p className="text-xs text-[#464a4d]">{he.reorderHint}</p>
              </div>
            </div>
            <div
              className="max-h-[min(85vh,1200px)] min-h-0 overflow-y-auto overflow-x-auto rounded-2xl border border-[rgba(214,235,253,0.19)] shadow-inner"
              style={{ backgroundColor: initialTheme.background }}
            >
              <div
                id="lc-page-top"
                className={`lc-page-root mx-auto ${previewInnerWidthClass(livePreviewViewport)}`}
              >
                <SortableContext items={ids} strategy={verticalListSortingStrategy}>
                  {sections.length === 0 ? (
                    <div
                      role="status"
                      aria-live="polite"
                      className="border-b border-dashed border-[rgba(214,235,253,0.19)] px-6 py-10 text-center"
                    >
                      <p className="text-lg font-semibold text-[#a1a4a5]">{he.previewEmptyTitle}</p>
                      <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-[#a1a4a5]">
                        {he.previewEmptySubtitle}
                      </p>
                    </div>
                  ) : null}
                  <ul className="min-h-[120px]">
                    <InsertZone index={0} />
                    {sections.map((section, i) => (
                      <Fragment key={section.id}>
                        <li className="group/section relative py-0">
                          <SortableRow id={section.id}>
                            {({ attributes, listeners }) => (
                              <div
                                className={`relative ${selectedId === section.id ? "ring-2 ring-[var(--lc-primary)] ring-inset" : ""}`}
                              >
                                <div className="pointer-events-none absolute end-2 top-2 z-10 flex gap-0.5 opacity-0 transition-opacity duration-150 group-hover/section:pointer-events-auto group-hover/section:opacity-100 has-[:focus-visible]:pointer-events-auto has-[:focus-visible]:opacity-100">
                                  <button
                                    type="button"
                                    className="pointer-events-auto inline-flex h-8 w-8 shrink-0 cursor-grab touch-manipulation items-center justify-center rounded-md bg-white/85 text-[#a1a4a5] ring-1 ring-[rgba(214,235,253,0.19)] backdrop-blur-sm hover:bg-white/10 hover:text-[#f0f0f0] active:cursor-grabbing focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--lc-primary)]"
                                    {...attributes}
                                    {...listeners}
                                    onClick={(ev) => ev.stopPropagation()}
                                    aria-label={he.dragHandle}
                                  >
                                    <IconDragHandle />
                                  </button>
                                  <button
                                    type="button"
                                    className="pointer-events-auto inline-flex h-8 w-8 shrink-0 touch-manipulation items-center justify-center rounded-md bg-white/85 text-red-600 ring-1 ring-[rgba(214,235,253,0.19)] backdrop-blur-sm hover:bg-red-50 hover:text-red-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-500"
                                    onClick={(ev) => {
                                      ev.stopPropagation();
                                      setSections((s) => s.filter((x) => x.id !== section.id));
                                      if (selectedId === section.id) {
                                        setSelectedId(null);
                                        setRightPanel("library");
                                      }
                                    }}
                                    aria-label={he.removeSection}
                                  >
                                    <IconTrash />
                                  </button>
                                </div>
                                <div
                                  role="button"
                                  tabIndex={0}
                                  className="cursor-pointer outline-none"
                                  onClick={() => {
                                    setSelectedId(section.id);
                                    setRightPanel("edit");
                                  }}
                                  onKeyDown={(e) => {
                                    if (e.key === "Enter" || e.key === " ") {
                                      e.preventDefault();
                                      setSelectedId(section.id);
                                      setRightPanel("edit");
                                    }
                                  }}
                                >
                                  <SectionRenderer
                                    sectionKey={section.section_key}
                                    content={section.content}
                                    visible={section.visible}
                                    theme={themeForRenderer}
                                    landingPageId={pageId}
                                    sectionId={section.id}
                                    editorPreview
                                    embedded={EMBEDDED_HERO_PREVIEW_KEYS.has(section.section_key)}
                                    variantStyleOverrides={styleForSectionKey(section.section_key)}
                                    pageNavSections={pageNavSections}
                                  />
                                </div>
                              </div>
                            )}
                          </SortableRow>
                        </li>
                        <InsertZone index={i + 1} />
                      </Fragment>
                    ))}
                  </ul>
                </SortableContext>
              </div>
            </div>
          </div>

          <aside className="min-h-[min(85vh,1200px)] lg:sticky lg:top-4 lg:self-start" dir="rtl">
            {rightPanel === "library" ? (
              <div className="flex h-full flex-col rounded-2xl border border-[rgba(214,235,253,0.19)] bg-white/5 p-3">
                <h3 className="mb-2 text-sm font-semibold">{he.sectionLibrary}</h3>
                <p className="mb-3 text-xs text-[#464a4d]">{he.libraryHint}</p>
                <div className="flex max-h-[min(78vh,1100px)] flex-col gap-3 overflow-y-auto pe-1">
                  {paletteKeys.map((k) => {
                    const dbDef = defsMap.get(k);
                    return (
                      <PaletteCard
                        key={k}
                        sectionKey={k}
                        onAdd={openAddSection}
                        titleHe={dbDef?.title_he}
                      />
                    );
                  })}
                </div>
              </div>
            ) : selected && isEditableSectionKey(selected.section_key) ? (
              <div className="rounded-2xl border border-[rgba(214,235,253,0.19)] bg-white/5 p-3">
                <button
                  type="button"
                  className="mb-3 text-sm text-[var(--lc-primary)] underline"
                  onClick={() => setRightPanel("library")}
                >
                  ← {he.backToLibrary}
                </button>
                <SectionInspectorForm
                  pageId={pageId}
                  sectionId={selected.id}
                  sectionKey={
                    selected.section_key as SectionKey | typeof LEGACY_NAV_HERO_STATS_KEY
                  }
                  content={selected.content}
                  deferPersistence
                  onDraftChange={handleDraftChange}
                  pageNavSections={
                    selected.section_key === "site_header_nav" ? pageNavSections : undefined
                  }
                />
              </div>
            ) : (
              <p className="text-sm text-[#464a4d]">{he.selectSectionPrompt}</p>
            )}
          </aside>
        </div>
        <DragOverlay>{dragOverlay}</DragOverlay>
      </DndContext>
      </div>
      <FullscreenLandingPreview
        open={immersivePreviewOpen}
        onClose={() => setImmersivePreviewOpen(false)}
        pageId={pageId}
        theme={themeForRenderer}
        pageBackground={initialTheme.background}
        rows={sections}
        getDefinitionStyleForSectionKey={styleForSectionKey}
        pageNavSections={pageNavSections}
      />
    </>
  );
}
