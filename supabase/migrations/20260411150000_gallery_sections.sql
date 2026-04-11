-- קטגוריית גלרייה ושלושה סקשני גלריה נוספים; העברת gallery_row לאותה קטגוריה כשקיימת gallery

insert into public.section_categories (slug, name_he, sort_order) values
  ('gallery', 'גלרייה', 4)
on conflict (slug) do nothing;

insert into public.section_definitions (key, title_he, description_he, category_slug, enabled, sort_order) values
  (
    'gallery_grid_even',
    'גלריית רשת',
    'רשת תמונות אחידה —2–3 עמודות לפי רוחב המסך.',
    'gallery',
    true,
    103
  ),
  (
    'gallery_spotlight',
    'גלריית מוקד',
    'תמונה גדולה לצד רשת קטנה — מדגישה פריט ראשי.',
    'gallery',
    true,
    104
  ),
  (
    'gallery_bento',
    'גלריית בנטו',
    'פריסה אסימטרית (בנטו) לכמה תמונות בולטות.',
    'gallery',
    true,
    105
  )
on conflict (key) do nothing;

update public.section_definitions
set category_slug = 'gallery'
where key = 'gallery_row'
  and exists (select 1 from public.section_categories c where c.slug = 'gallery');

update public.section_definitions
set
  title_he = 'גלריית תמונות (שורה נגללת)',
  description_he = 'שורת תמונות מעוגלות עם גלילה אופקית.'
where key = 'gallery_row'
  and (title_he = 'גלריית תמונות' or description_he = 'שורת תמונות מעוגלות.');
