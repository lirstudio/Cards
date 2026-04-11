-- שלושה וריאנטי הירו נוספים בספריית הסקשנים (קטגוריית hero)

insert into public.section_definitions (key, title_he, description_he, category_slug, enabled, sort_order)
values
  (
    'hero_editorial_split',
    'הירו — מגזין (מדיה רחבה)',
    'שורת הדגשה, כותרות ותמונה רחבה במסגרת פרימיום — ללא קימור התמונה של הירו הקלאסי.',
    'hero',
    true,
    20
  ),
  (
    'hero_immersive_bg',
    'הירו — רקע מלא',
    'תמונת רקע מלאה עם שכבת עומק, טקסט ממורכז ושני כפתורי פעולה.',
    'hero',
    true,
    21
  ),
  (
    'hero_showcase_float',
    'הירו — במה ומוצר מרחף',
    'כותרת דומיננטית, תגית אופציונלית ותמונה עם אפקט צף ומוקאפ.',
    'hero',
    true,
    22
  )
on conflict (key) do nothing;
