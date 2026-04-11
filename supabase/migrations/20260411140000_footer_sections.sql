-- קטגוריית פוטר ושלושה סקשני פוטר לדפי נחיתה

insert into public.section_categories (slug, name_he, sort_order) values
  ('footer', 'פוטר', 3)
on conflict (slug) do nothing;

insert into public.section_definitions (key, title_he, description_he, category_slug, enabled, sort_order) values
  (
    'footer_minimal',
    'פוטר מינימליסטי',
    'מותג, שורת קישורים וזכויות יוצרים — קומפקטי.',
    'footer',
    true,
    100
  ),
  (
    'footer_columns',
    'פוטר רב-עמודות',
    'אודות, קישורים, יצירת קשר ורשתות חברתיות.',
    'footer',
    true,
    101
  ),
  (
    'footer_newsletter',
    'פוטר עם ניוזלטר',
    'מסר מותג, הרשמה לאימייל ורשתות חברתיות.',
    'footer',
    true,
    102
  )
on conflict (key) do nothing;
