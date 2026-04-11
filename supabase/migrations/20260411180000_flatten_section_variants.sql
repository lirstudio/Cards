-- Flatten section_variants into distinct section_definitions; drop variant_id and section_variants.

alter table public.section_definitions
  add column if not exists style_overrides jsonb not null default '{}'::jsonb;

-- New catalog rows: testimonials layouts + checklist text-only (metadata from former variants / catalog).
with base as (
  select category_slug, enabled, sort_order
  from public.section_definitions
  where key = 'testimonials_row'
)
insert into public.section_definitions (
  key, title_he, description_he, category_slug, enabled, sort_order, style_overrides
)
select v.key, v.title_he, v.description_he, b.category_slug, b.enabled, b.sort_order + v.n, '{}'::jsonb
from base b
cross join (
  values
    (
      'testimonials_marquee'::text,
      'המלצות — כרטיסים נגללים'::text,
      'כרטיסי המלצות במרקיי אופקי — ברירת מחדל.'::text,
      0::int
    ),
    (
      'testimonials_photo_cards',
      'המלצות — כרטיסי תמונה',
      'המלצות עם דגש על תמונות המחברים.',
      1
    ),
    (
      'testimonials_star_cards',
      'המלצות — כרטיסי כוכבים',
      'דירוג כוכבים בולט ליד כל המלצה.',
      2
    ),
    (
      'testimonials_quote_side',
      'המלצות — ציטוט ותמונה',
      'ציטוט גדול לצד תמונת מחבר.',
      3
    ),
    (
      'testimonials_cinematic',
      'המלצות — קולנועי',
      'שקופיות רחבות בסגנון קולנועי.',
      4
    )
) as v(key, title_he, description_he, n)
on conflict (key) do nothing;

insert into public.section_definitions (
  key, title_he, description_he, category_slug, enabled, sort_order, style_overrides
)
select
  'checklist_text_only',
  'רשימה (טקסט בלבד)',
  'כותרת ופריטים עם וי כחול — ללא תמונה, רשימה ממורכזת.',
  category_slug,
  enabled,
  sort_order + 1,
  '{}'::jsonb
from public.section_definitions
where key = 'checklist_with_image'
on conflict (key) do nothing;

-- Copy styles from variants onto new definitions (strip layout discriminator keys).
with mapped as (
  select
    id,
    (style_overrides::jsonb) as o,
    case
      when coalesce((style_overrides::jsonb)->>'testimonialsLayout', 'marquee') in (
        'grid', 'grid_three', 'featured_carousel', 'vertical_stack'
      ) then 'testimonials_marquee'
      when coalesce((style_overrides::jsonb)->>'testimonialsLayout', 'marquee') = 'photo_cards'
        then 'testimonials_photo_cards'
      when (style_overrides::jsonb)->>'testimonialsLayout' = 'star_cards' then 'testimonials_star_cards'
      when (style_overrides::jsonb)->>'testimonialsLayout' = 'quote_side' then 'testimonials_quote_side'
      when (style_overrides::jsonb)->>'testimonialsLayout' = 'cinematic' then 'testimonials_cinematic'
      else 'testimonials_marquee'
    end as mapped_key
  from public.section_variants
  where section_key = 'testimonials_row'
),
picked as (
  select distinct on (mapped_key)
    mapped_key,
    (o - 'testimonialsLayout') as so
  from mapped
  order by mapped_key, id
)
update public.section_definitions d
set style_overrides = picked.so
from picked
where d.key = picked.mapped_key;

with mapped as (
  select
    id,
    (style_overrides::jsonb) as o,
    case
      when coalesce((style_overrides::jsonb)->>'checklistLayout', 'with_image') = 'text_only'
        then 'checklist_text_only'
      else 'checklist_with_image'
    end as mapped_key
  from public.section_variants
  where section_key = 'checklist_with_image'
),
picked as (
  select distinct on (mapped_key)
    mapped_key,
    (o - 'checklistLayout') as so
  from mapped
  order by mapped_key, id
)
update public.section_definitions d
set style_overrides = picked.so
from picked
where d.key = picked.mapped_key;

-- Remap page_sections: testimonials_row -> layout-specific key.
update public.page_sections ps
set section_key = case
  when ps.variant_id is null then 'testimonials_marquee'
  when coalesce((v.style_overrides::jsonb)->>'testimonialsLayout', 'marquee') in (
    'grid', 'grid_three', 'featured_carousel', 'vertical_stack'
  ) then 'testimonials_marquee'
  when coalesce((v.style_overrides::jsonb)->>'testimonialsLayout', 'marquee') = 'photo_cards'
    then 'testimonials_photo_cards'
  when (v.style_overrides::jsonb)->>'testimonialsLayout' = 'star_cards' then 'testimonials_star_cards'
  when (v.style_overrides::jsonb)->>'testimonialsLayout' = 'quote_side' then 'testimonials_quote_side'
  when (v.style_overrides::jsonb)->>'testimonialsLayout' = 'cinematic' then 'testimonials_cinematic'
  else 'testimonials_marquee'
end
from public.section_variants v
where ps.section_key = 'testimonials_row'
  and ps.variant_id = v.id;

update public.page_sections
set section_key = 'testimonials_marquee'
where section_key = 'testimonials_row';

-- Remap checklist text-only instances.
update public.page_sections ps
set section_key = 'checklist_text_only'
from public.section_variants v
where ps.section_key = 'checklist_with_image'
  and ps.variant_id = v.id
  and (v.style_overrides::jsonb)->>'checklistLayout' = 'text_only';

delete from public.section_variants;

delete from public.section_definitions where key = 'testimonials_row';

-- Template defaults: single testimonials slot becomes marquee layout key.
update public.templates t
set default_section_keys = coalesce(
  (
    select jsonb_agg(
      case
        when elem = to_jsonb('testimonials_row'::text) then to_jsonb('testimonials_marquee'::text)
        else elem
      end
    )
    from jsonb_array_elements(t.default_section_keys) as elem
  ),
  '[]'::jsonb
);

alter table public.page_sections drop column if exists variant_id;

drop policy if exists "sv_select_enabled" on public.section_variants;
drop policy if exists "sv_select_admin" on public.section_variants;
drop policy if exists "sv_insert_admin" on public.section_variants;
drop policy if exists "sv_update_admin" on public.section_variants;
drop policy if exists "sv_delete_admin" on public.section_variants;

drop trigger if exists section_variants_updated_at on public.section_variants;

drop table if exists public.section_variants;
