-- פריסת רשת עד 3 עמודות (grid_three) — כרטיס עיצוב נוסף אם חסר

insert into public.section_variants (section_key, name_he, style_overrides, is_default, enabled, sort_order)
select
  'testimonials_row',
  'רשת (3 עמודות)',
  '{"testimonialsLayout":"grid_three"}'::jsonb,
  false,
  true,
  (select coalesce(max(sort_order), 0) + 1 from public.section_variants where section_key = 'testimonials_row')
where not exists (
  select 1
  from public.section_variants sv
  where sv.section_key = 'testimonials_row'
    and sv.style_overrides->>'testimonialsLayout' = 'grid_three'
);
