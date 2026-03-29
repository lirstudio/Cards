-- סקשן checklist: כותרת "רשימה", תיאור מעודכן; זריעת שני וריאנטים (עם תמונה / רשימה בלבד) אם אין עדיין וריאנטים לסקשן

update public.section_definitions
set
  title_he = 'רשימה',
  description_he = 'כותרת ופריטי רשימה עם סימון וי. בחרו וריאנט: עם תמונה או רשימה בלבד.'
where key = 'checklist_with_image';

insert into public.section_variants (section_key, name_he, style_overrides, is_default, enabled, sort_order)
select v.section_key, v.name_he, v.style_overrides, v.is_default, v.enabled, v.sort_order
from (
  values
    (
      'checklist_with_image'::text,
      'עם תמונה'::text,
      '{"checklistLayout":"with_image"}'::jsonb,
      true,
      true,
      0
    ),
    (
      'checklist_with_image',
      'רשימה בלבד',
      '{"checklistLayout":"text_only"}'::jsonb,
      false,
      true,
      1
    )
) as v(section_key, name_he, style_overrides, is_default, enabled, sort_order)
where not exists (
  select 1
  from public.section_variants sv
  where sv.section_key = 'checklist_with_image'
);
