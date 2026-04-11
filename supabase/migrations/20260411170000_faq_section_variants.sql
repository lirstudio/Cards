-- וריאנטי שאלות נפוצות + קטגוריית faq

insert into public.section_categories (slug, name_he, sort_order) values
  ('faq', 'שאלות נפוצות', 5)
on conflict (slug) do nothing;

insert into public.section_definitions (key, title_he, description_he, category_slug, enabled, sort_order) values
  (
    'faq_two_column',
    'שאלות נפוצות (שתי עמודות)',
    'רשת דו-עמודתית — כל התשובות גלויות.',
    'faq',
    true,
    106
  ),
  (
    'faq_cards',
    'שאלות נפוצות (כרטיסים)',
    'כרטיסים בודדים לכל שאלה — רשת נקייה.',
    'faq',
    true,
    107
  ),
  (
    'faq_expanded',
    'שאלות נפוצות (רשימה פתוחה)',
    'רשימה אנכית עם הפרדות — ללא אקורדיון.',
    'faq',
    true,
    108
  )
on conflict (key) do nothing;

update public.section_definitions
set category_slug = 'faq'
where key = 'faq_accordion'
  and exists (select 1 from public.section_categories c where c.slug = 'faq');

update public.section_definitions
set
  title_he = 'שאלות נפוצות (אקורדיון)',
  description_he = 'שאלות ותשובות — נפתחות בלחיצה.'
where key = 'faq_accordion'
  and (title_he = 'שאלות נפוצות' or description_he = 'אקורדיון שאלות ותשובות.');
