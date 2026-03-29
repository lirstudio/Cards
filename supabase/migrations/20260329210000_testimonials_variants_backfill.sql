-- תיקון: המיגרציה הקודמת זרעה כרטיסים רק כשלא היה אף וריאנט.
-- אם כבר היה כרטיס ברירת־מחדל (למשל style_overrides ריק), הכרטיסים הנוספים לא נוספו.
-- כאן מוסיפים כל פריסת testimonialsLayout רק אם חסרה.

update public.section_definitions
set
  description_he = 'כרטיסי המלצות — בחרו בכרטיס עיצוב: גלילה, רשת, מודגש עם שורה או רשימה אנכית.'
where key = 'testimonials_row';

insert into public.section_variants (section_key, name_he, style_overrides, is_default, enabled, sort_order)
select
  'testimonials_row',
  'רשת (2 עמודות)',
  '{"testimonialsLayout":"grid"}'::jsonb,
  false,
  true,
  (select coalesce(max(sort_order), 0) + 1 from public.section_variants where section_key = 'testimonials_row')
where not exists (
  select 1
  from public.section_variants sv
  where sv.section_key = 'testimonials_row'
    and sv.style_overrides->>'testimonialsLayout' = 'grid'
);

insert into public.section_variants (section_key, name_he, style_overrides, is_default, enabled, sort_order)
select
  'testimonials_row',
  'מודגש + שורת כרטיסים',
  '{"testimonialsLayout":"featured_carousel"}'::jsonb,
  false,
  true,
  (select coalesce(max(sort_order), 0) + 1 from public.section_variants where section_key = 'testimonials_row')
where not exists (
  select 1
  from public.section_variants sv
  where sv.section_key = 'testimonials_row'
    and sv.style_overrides->>'testimonialsLayout' = 'featured_carousel'
);

insert into public.section_variants (section_key, name_he, style_overrides, is_default, enabled, sort_order)
select
  'testimonials_row',
  'רשימה אנכית',
  '{"testimonialsLayout":"vertical_stack"}'::jsonb,
  false,
  true,
  (select coalesce(max(sort_order), 0) + 1 from public.section_variants where section_key = 'testimonials_row')
where not exists (
  select 1
  from public.section_variants sv
  where sv.section_key = 'testimonials_row'
    and sv.style_overrides->>'testimonialsLayout' = 'vertical_stack'
);
