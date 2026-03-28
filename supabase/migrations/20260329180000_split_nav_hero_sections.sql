-- פיצול סקשן מוזג nav_hero_stats לתפריט, הירו ושורת סטטיסטיקות

update public.section_definitions
set sort_order = sort_order + 2
where key <> 'nav_hero_stats'
  and sort_order >= 1;

update public.section_definitions
set
  enabled = false,
  title_he = 'ישן: ניווט + הירו + סטטיסטיקה (מוזג)',
  description_he = 'הוחלף בשלושה סקשנים: תפריט עליון, הירו, שורת מספרים. עמודים עם המפתח הישן נשארים תקינים.'
where key = 'nav_hero_stats';

insert into public.section_definitions (key, title_he, description_he, category_slug, enabled, sort_order)
values
  (
    'site_header_nav',
    'תפריט עליון',
    'לוגו, סרגל עליון, קישורי ניווט וכפתור בראש העמוד.',
    'hero',
    true,
    0
  ),
  (
    'hero_image_split',
    'הירו (תמונה וטקסט)',
    'כותרת ראשית, טקסט משנה, תמונה וכפתור פעולה — ללא תפריט.',
    'hero',
    true,
    1
  ),
  (
    'stats_highlight_row',
    'שורת מספרים',
    'סטטיסטיקות בולטות בשורה אחת.',
    'hero',
    true,
    2
  )
on conflict (key) do update set
  title_he = excluded.title_he,
  description_he = excluded.description_he,
  category_slug = excluded.category_slug,
  enabled = excluded.enabled,
  sort_order = excluded.sort_order;

delete from public.section_variants where section_key = 'nav_hero_stats';

update public.templates
set default_section_keys = '[
  "site_header_nav",
  "hero_image_split",
  "stats_highlight_row",
  "about_bio_qa",
  "split_three_qa_image",
  "testimonials_row",
  "center_richtext_cta",
  "checklist_with_image",
  "pricing_banner",
  "services_grid",
  "gallery_row",
  "how_it_works_blue",
  "faq_accordion",
  "contact_split_footer"
]'::jsonb
where slug = 'sbn-workshop';
