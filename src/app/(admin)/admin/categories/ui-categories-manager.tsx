"use client";

import { useState, useTransition } from "react";
import {
  DndContext,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  closestCenter,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  upsertCategory,
  deleteCategory,
  updateCategoryOrder,
} from "@/app/actions/admin";
import { he } from "@/lib/i18n/he";
import type { SectionCategoryRow } from "@/types/admin";

/** מזהה טכני ייחודי במסד — נגזר משם התצוגה (כולל עברית). */
function makeUniqueCategorySlug(nameHe: string, takenSlugs: Set<string>): string {
  const raw = nameHe
    .trim()
    .normalize("NFC")
    .replace(/\s+/g, "-")
    .replace(/[^\p{L}\p{N}-]/gu, "")
    .replace(/-{2,}/g, "-")
    .replace(/^-|-$/g, "");
  const base = raw.slice(0, 96) || `cat-${Date.now()}`;
  let candidate = base;
  let i = 2;
  while (takenSlugs.has(candidate)) {
    const suffix = `-${i}`;
    candidate = `${base.slice(0, Math.max(1, 96 - suffix.length))}${suffix}`;
    i += 1;
  }
  return candidate;
}

function SortableCategoryRow({
  cat,
  onDelete,
  deleting,
}: {
  cat: SectionCategoryRow;
  onDelete: (slug: string) => void;
  deleting: boolean;
}) {
  const { setNodeRef, transform, transition, attributes, listeners } =
    useSortable({ id: cat.slug });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-3 rounded-lg border border-[rgba(214,235,253,0.19)] bg-white/5 px-4 py-3"
    >
      <button
        type="button"
        className="cursor-grab rounded border border-[rgba(214,235,253,0.19)] px-2 py-0.5 text-xs"
        {...attributes}
        {...listeners}
      >
        ⋮⋮
      </button>
      <div className="min-w-0 flex-1">
        <span className="font-medium text-[#f0f0f0]">{cat.name_he}</span>
      </div>
      <button
        type="button"
        disabled={deleting}
        onClick={() => onDelete(cat.slug)}
        className="rounded-lg border border-[#ff2047]/30 bg-[#ff2047]/10 px-3 py-1 text-xs font-medium text-[#ff2047] transition hover:bg-[#ff2047]/15 disabled:opacity-50"
      >
        {he.adminDeleteCategory}
      </button>
    </div>
  );
}

export function CategoriesManager({
  initialCategories,
}: {
  initialCategories: SectionCategoryRow[];
}) {
  const [categories, setCategories] = useState(initialCategories);
  const [newName, setNewName] = useState("");
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  function handleDragEnd(e: DragEndEvent) {
    const { active, over } = e;
    if (!over || active.id === over.id) return;

    const oldIdx = categories.findIndex((c) => c.slug === active.id);
    const newIdx = categories.findIndex((c) => c.slug === over.id);
    if (oldIdx < 0 || newIdx < 0) return;

    const next = [...categories];
    const [removed] = next.splice(oldIdx, 1);
    next.splice(newIdx, 0, removed);
    setCategories(next);

    startTransition(async () => {
      await updateCategoryOrder(next.map((c) => c.slug));
    });
  }

  function handleAdd() {
    const name = newName.trim();
    if (!name) return;

    const taken = new Set(categories.map((c) => c.slug));
    const slug = makeUniqueCategorySlug(name, taken);

    startTransition(async () => {
      const res = await upsertCategory({
        slug,
        name_he: name,
        sort_order: categories.length,
        isNew: true,
      });
      if (res.ok) {
        setCategories((prev) => [
          ...prev,
          { slug, name_he: name, sort_order: prev.length, created_at: new Date().toISOString() },
        ]);
        setNewName("");
        setError("");
      } else {
        setError(res.error ?? he.adminError);
      }
    });
  }

  function handleDelete(slug: string) {
    startTransition(async () => {
      const res = await deleteCategory(slug);
      if (res.ok) {
        setCategories((prev) => prev.filter((c) => c.slug !== slug));
        setError("");
      } else {
        setError(res.error ?? he.adminError);
      }
    });
  }

  return (
    <div className="space-y-4">
      {error && (
        <div className="rounded-lg border border-[#ff2047]/30 bg-[#ff2047]/10 px-4 py-2 text-sm text-[#ff2047]">
          {error}
        </div>
      )}

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={categories.map((c) => c.slug)}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-2">
            {categories.map((cat) => (
              <SortableCategoryRow
                key={cat.slug}
                cat={cat}
                onDelete={handleDelete}
                deleting={pending}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      <div className="flex flex-col gap-2 rounded-xl border border-[rgba(214,235,253,0.14)] bg-white/5 p-3 sm:flex-row sm:items-stretch sm:gap-2">
        <input
          type="text"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder={he.adminCategoryNewPlaceholder}
          aria-label={he.adminCategoryName}
          className="min-h-[2.5rem] min-w-0 flex-1 rounded-lg border border-[rgba(214,235,253,0.19)] bg-[#0a0a0a] px-3 py-2 text-sm text-[#f0f0f0] placeholder:text-[#464a4d]"
        />
        <button
          type="button"
          disabled={pending || !newName.trim()}
          onClick={handleAdd}
          className="shrink-0 rounded-lg bg-[var(--lc-primary)] px-4 py-2 text-sm font-medium text-white transition hover:opacity-90 disabled:opacity-50"
        >
          {he.adminAddCategory}
        </button>
      </div>
    </div>
  );
}
