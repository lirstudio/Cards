-- המלצות: תיאור מעודכן; זריעת כרטיסי עיצוב לפריסות שונות אם אין עדיין וריאנטים לסקשן

update public.section_definitions
set
  description_he = 'כרטיסי המלצות — בחרו בכרטיס עיצוב: גלילה, רשת, מודגש עם שורה או רשימה אנכית.'
where key = 'testimonials_row';

insert into public.section_variants (section_key, name_he, style_overrides, is_default, enabled, sort_order)
select v.section_key, v.name_he, v.style_overrides, v.is_default, v.enabled, v.sort_order
from (
  values
    (
      'testimonials_row'::text,
      'גלילה אופקית'::text,
      '{"testimonialsLayout":"marquee"}'::jsonb,
      true,
      true,
      0
    ),
    (
      'testimonials_row',
      'רשת (2 עמודות)',
      '{"testimonialsLayout":"grid"}'::jsonb,
      false,
      true,
      1
    ),
    (
      'testimonials_row',
      'מודגש + שורת כרטיסים',
      '{"testimonialsLayout":"featured_carousel"}'::jsonb,
      false,
      true,
      2
    ),
    (
      'testimonials_row',
      'רשימה אנכית',
      '{"testimonialsLayout":"vertical_stack"}'::jsonb,
      false,
      true,
      3
    )
) as v(section_key, name_he, style_overrides, is_default, enabled, sort_order)
where not exists (
  select 1
  from public.section_variants sv
  where sv.section_key = 'testimonials_row'
);
