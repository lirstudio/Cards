-- Admin panel: role, system settings, section catalog in DB, variants

-- 1. Admin role on profiles
alter table public.profiles
  add column role text not null default 'user'
  check (role in ('user', 'admin'));

-- 2. System settings key-value store
create table public.system_settings (
  key text primary key,
  value jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

create trigger system_settings_updated_at before update on public.system_settings
  for each row execute function public.set_updated_at();

-- 3. Section categories (admin-managed)
create table public.section_categories (
  slug text primary key,
  name_he text not null,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

-- 4. Section definitions (catalog metadata in DB)
create table public.section_definitions (
  key text primary key,
  title_he text not null,
  description_he text not null,
  category_slug text not null references public.section_categories (slug) on update cascade,
  enabled boolean not null default true,
  sort_order int not null default 0,
  preview_image_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger section_definitions_updated_at before update on public.section_definitions
  for each row execute function public.set_updated_at();

-- 5. Section variants (style overrides per section type)
create table public.section_variants (
  id uuid primary key default gen_random_uuid(),
  section_key text not null references public.section_definitions (key) on delete cascade on update cascade,
  name_he text not null,
  style_overrides jsonb not null default '{}'::jsonb,
  is_default boolean not null default false,
  enabled boolean not null default true,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger section_variants_updated_at before update on public.section_variants
  for each row execute function public.set_updated_at();

-- 6. Link page_sections to a variant
alter table public.page_sections
  add column variant_id uuid references public.section_variants (id) on delete set null;

-- ===== RLS =====

-- Helper: is caller an admin?
create or replace function public.is_admin()
returns boolean as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$ language sql security definer stable;

-- system_settings
alter table public.system_settings enable row level security;

create policy "ss_select_admin" on public.system_settings
  for select to authenticated using (public.is_admin());
create policy "ss_insert_admin" on public.system_settings
  for insert to authenticated with check (public.is_admin());
create policy "ss_update_admin" on public.system_settings
  for update to authenticated using (public.is_admin());
create policy "ss_delete_admin" on public.system_settings
  for delete to authenticated using (public.is_admin());

-- section_categories
alter table public.section_categories enable row level security;

create policy "sc_select_all" on public.section_categories
  for select using (true);
create policy "sc_insert_admin" on public.section_categories
  for insert to authenticated with check (public.is_admin());
create policy "sc_update_admin" on public.section_categories
  for update to authenticated using (public.is_admin());
create policy "sc_delete_admin" on public.section_categories
  for delete to authenticated using (public.is_admin());

-- section_definitions
alter table public.section_definitions enable row level security;

create policy "sd_select_enabled" on public.section_definitions
  for select using (enabled = true);
create policy "sd_select_admin" on public.section_definitions
  for select to authenticated using (public.is_admin());
create policy "sd_insert_admin" on public.section_definitions
  for insert to authenticated with check (public.is_admin());
create policy "sd_update_admin" on public.section_definitions
  for update to authenticated using (public.is_admin());
create policy "sd_delete_admin" on public.section_definitions
  for delete to authenticated using (public.is_admin());

-- section_variants
alter table public.section_variants enable row level security;

create policy "sv_select_enabled" on public.section_variants
  for select using (enabled = true);
create policy "sv_select_admin" on public.section_variants
  for select to authenticated using (public.is_admin());
create policy "sv_insert_admin" on public.section_variants
  for insert to authenticated with check (public.is_admin());
create policy "sv_update_admin" on public.section_variants
  for update to authenticated using (public.is_admin());
create policy "sv_delete_admin" on public.section_variants
  for delete to authenticated using (public.is_admin());

-- Admin can read all profiles (for user management)
create policy "profiles_select_admin" on public.profiles
  for select to authenticated using (public.is_admin());
create policy "profiles_update_admin" on public.profiles
  for update to authenticated using (public.is_admin());

-- Admin can read all landing_pages & page_sections
create policy "lp_select_admin" on public.landing_pages
  for select to authenticated using (public.is_admin());
create policy "ps_select_admin" on public.page_sections
  for select to authenticated using (public.is_admin());
create policy "fs_select_admin" on public.form_submissions
  for select to authenticated using (public.is_admin());
create policy "subs_select_admin" on public.user_subscriptions
  for select to authenticated using (public.is_admin());

-- ===== Seed data =====

-- Categories
insert into public.section_categories (slug, name_he, sort_order) values
  ('hero', 'הירו', 0),
  ('content', 'תוכן', 1),
  ('conversion', 'המרה', 2)
on conflict (slug) do nothing;

-- Section definitions (from existing catalog.ts)
insert into public.section_definitions (key, title_he, description_he, category_slug, enabled, sort_order) values
  ('nav_hero_stats',       'כותרת, ניווט והירו',       'לוגו, תפריט, כפתור צד, כותרת ראשית, תמונה ושורת סטטיסטיקות.',   'hero',       true, 0),
  ('about_bio_qa',         'אודות (תמונה + טקסטים)',   'שלושה כותרות ופסקאות לצד תמונת פורטרט.',                           'content',    true, 1),
  ('split_three_qa_image', 'מי אנחנו + תמונה',         'שלוש שאלות ותשובות לצד תמונה רחבה.',                              'content',    true, 2),
  ('testimonials_row',     'המלצות',                    'כרטיסי המלצות בגלילה אופקית.',                                    'content',    true, 3),
  ('center_richtext_cta',  'טקסט מרכזי + כפתור',       'כותרת, פסקאות ו־CTA — למשל על הסדנה.',                            'content',    true, 4),
  ('checklist_with_image', 'רשימת מה כלול + תמונה',    'כותרת, פריטים עם וי כחול ותמונה.',                                'content',    true, 5),
  ('pricing_banner',       'באנר מחיר',                 'כותרת מחיר, טקסט הסבר וכפתור.',                                   'conversion', true, 6),
  ('services_grid',        'רשת שירותים',               'תגית, כותרת וארבעה כרטיסים (כולל מודגש).',                        'content',    true, 7),
  ('gallery_row',          'גלריית תמונות',             'שורת תמונות מעוגלות.',                                            'content',    true, 8),
  ('how_it_works_blue',    'איך זה עובד',               'רקע כחול, שלושה שלבים בכרטיסים לבנים.',                           'conversion', true, 9),
  ('faq_accordion',        'שאלות נפוצות',              'אקורדיון שאלות ותשובות.',                                         'conversion', true, 10),
  ('contact_split_footer', 'צור קשר וטופס',             'טופס הרשמה, רשתות, מייל, טלפון ופוטר.',                           'conversion', true, 11)
on conflict (key) do nothing;

-- System settings seed
insert into public.system_settings (key, value) values
  ('site_name',            '"Cards"'::jsonb),
  ('registration_enabled', 'true'::jsonb),
  ('default_plan_slug',    '"free"'::jsonb),
  ('default_theme',        '{"primary":"#0b43b4","background":"#f8f9fa","heading":"#000000","body":"#4b5563"}'::jsonb)
on conflict (key) do nothing;
