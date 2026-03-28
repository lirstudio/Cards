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
      className="flex items-center gap-3 rounded-lg border border-neutral-200 bg-white px-4 py-3"
    >
      <button
        type="button"
        className="cursor-grab rounded border border-neutral-300 px-2 py-0.5 text-xs"
        {...attributes}
        {...listeners}
      >
        ⋮⋮
      </button>
      <div className="flex-1">
        <span className="font-medium">{cat.name_he}</span>
        <span className="ms-2 text-xs text-neutral-400" dir="ltr">
          ({cat.slug})
        </span>
      </div>
      <button
        type="button"
        disabled={deleting}
        onClick={() => onDelete(cat.slug)}
        className="rounded-lg border border-red-200 px-3 py-1 text-xs font-medium text-red-600 transition hover:bg-red-50 disabled:opacity-50"
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
  const [newSlug, setNewSlug] = useState("");
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
    const slug = newSlug.trim().toLowerCase().replace(/[^a-z0-9_-]/g, "");
    const name = newName.trim();
    if (!slug || !name) return;

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
        setNewSlug("");
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
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">
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

      <div className="flex items-end gap-3 rounded-xl border border-dashed border-neutral-300 bg-neutral-50 p-4">
        <div className="flex-1 space-y-1">
          <label className="text-xs font-medium text-neutral-600">
            {he.adminCategorySlug}
          </label>
          <input
            type="text"
            value={newSlug}
            onChange={(e) => setNewSlug(e.target.value)}
            placeholder="e.g. interactive"
            dir="ltr"
            className="block w-full text-sm"
          />
        </div>
        <div className="flex-1 space-y-1">
          <label className="text-xs font-medium text-neutral-600">
            {he.adminCategoryName}
          </label>
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="אינטראקטיבי"
            className="block w-full text-sm"
          />
        </div>
        <button
          type="button"
          disabled={pending || !newSlug.trim() || !newName.trim()}
          onClick={handleAdd}
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700 disabled:opacity-50"
        >
          {he.adminAddCategory}
        </button>
      </div>
    </div>
  );
}
