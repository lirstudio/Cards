-- Cards / lir.cards — initial schema, RLS, storage, seed

-- Extensions
create extension if not exists "pgcrypto";

-- Profiles
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text,
  stripe_customer_id text unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Subscription plans (includes free tier; Stripe price ids optional)
create table public.subscription_plans (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name_he text not null,
  billing_interval text not null check (billing_interval in ('month', 'year', 'none')),
  max_pages int not null default 1,
  allowed_template_tier int not null default 1,
  stripe_price_id text,
  created_at timestamptz not null default now()
);

create table public.user_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  plan_id uuid not null references public.subscription_plans (id),
  status text not null default 'active' check (status in ('active', 'canceled', 'past_due', 'trialing')),
  stripe_subscription_id text unique,
  current_period_end timestamptz,
  created_at timestamptz not null default now(),
  unique (user_id)
);

-- Templates catalog
create table public.templates (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name_he text not null,
  tier int not null default 1,
  preview_image_url text,
  default_section_keys jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);

create table public.landing_pages (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  template_id uuid references public.templates (id) on delete set null,
  slug text not null unique,
  title text not null default '',
  status text not null default 'draft' check (status in ('draft', 'published')),
  published_at timestamptz,
  theme jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index landing_pages_user_id_idx on public.landing_pages (user_id);
create index landing_pages_status_idx on public.landing_pages (status);

create table public.page_sections (
  id uuid primary key default gen_random_uuid(),
  landing_page_id uuid not null references public.landing_pages (id) on delete cascade,
  section_key text not null,
  sort_order int not null default 0,
  content jsonb not null default '{}'::jsonb,
  visible boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index page_sections_page_idx on public.page_sections (landing_page_id, sort_order);

create table public.form_submissions (
  id uuid primary key default gen_random_uuid(),
  landing_page_id uuid not null references public.landing_pages (id) on delete cascade,
  section_id uuid references public.page_sections (id) on delete set null,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index form_submissions_page_idx on public.form_submissions (landing_page_id);

-- updated_at trigger
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger profiles_updated_at before update on public.profiles
  for each row execute function public.set_updated_at();
create trigger landing_pages_updated_at before update on public.landing_pages
  for each row execute function public.set_updated_at();
create trigger page_sections_updated_at before update on public.page_sections
  for each row execute function public.set_updated_at();

-- Seed plans & template (must exist before auth trigger uses free plan)
insert into public.subscription_plans (slug, name_he, billing_interval, max_pages, allowed_template_tier, stripe_price_id)
values
  ('free', 'חינם', 'none', 5, 2, null),
  ('pro_monthly', 'מקצועי חודשי', 'month', 25, 2, null),
  ('pro_yearly', 'מקצועי שנתי', 'year', 25, 2, null)
on conflict (slug) do nothing;

insert into public.templates (slug, name_he, tier, default_section_keys)
values (
  'sbn-workshop',
  'סדנה פיננסית (SBN)',
  1,
  '[
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
)
on conflict (slug) do nothing;

-- New user → profile + free subscription
create or replace function public.handle_new_user()
returns trigger as $$
declare
  free_plan_id uuid;
begin
  insert into public.profiles (id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1)));

  select id into free_plan_id from public.subscription_plans where slug = 'free' limit 1;
  if free_plan_id is not null then
    insert into public.user_subscriptions (user_id, plan_id, status)
    values (new.id, free_plan_id, 'active');
  end if;

  return new;
end;
$$ language plpgsql security definer set search_path = public;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- RLS
alter table public.profiles enable row level security;
alter table public.subscription_plans enable row level security;
alter table public.user_subscriptions enable row level security;
alter table public.templates enable row level security;
alter table public.landing_pages enable row level security;
alter table public.page_sections enable row level security;
alter table public.form_submissions enable row level security;

-- Profiles: own row
create policy "profiles_select_own" on public.profiles for select using (auth.uid() = id);
create policy "profiles_update_own" on public.profiles for update using (auth.uid() = id);

-- Plans: readable by authenticated
create policy "plans_select_all" on public.subscription_plans for select
  to authenticated using (true);

-- Subscriptions: own
create policy "subs_select_own" on public.user_subscriptions for select using (auth.uid() = user_id);
create policy "subs_update_own" on public.user_subscriptions for update using (auth.uid() = user_id);

-- Templates: public read (anon + authenticated) for catalog & published renders
create policy "templates_select" on public.templates for select using (true);

-- Landing pages
create policy "lp_select_owner" on public.landing_pages for select
  using (auth.uid() = user_id);
create policy "lp_select_published" on public.landing_pages for select
  using (status = 'published');
create policy "lp_insert_own" on public.landing_pages for insert
  with check (auth.uid() = user_id);
create policy "lp_update_own" on public.landing_pages for update
  using (auth.uid() = user_id);
create policy "lp_delete_own" on public.landing_pages for delete
  using (auth.uid() = user_id);

-- Page sections: owner OR published parent
create policy "ps_select" on public.page_sections for select using (
  exists (
    select 1 from public.landing_pages lp
    where lp.id = page_sections.landing_page_id
      and (lp.user_id = auth.uid() or lp.status = 'published')
  )
);
create policy "ps_insert" on public.page_sections for insert
  with check (
    exists (
      select 1 from public.landing_pages lp
      where lp.id = landing_page_id and lp.user_id = auth.uid()
    )
  );
create policy "ps_update" on public.page_sections for update
  using (
    exists (
      select 1 from public.landing_pages lp
      where lp.id = landing_page_id and lp.user_id = auth.uid()
    )
  );
create policy "ps_delete" on public.page_sections for delete
  using (
    exists (
      select 1 from public.landing_pages lp
      where lp.id = landing_page_id and lp.user_id = auth.uid()
    )
  );

-- Form submissions
create policy "fs_insert_published" on public.form_submissions for insert
  to anon, authenticated
  with check (
    exists (
      select 1 from public.landing_pages lp
      where lp.id = form_submissions.landing_page_id
        and lp.status = 'published'
    )
  );
create policy "fs_select_owner" on public.form_submissions for select
  to authenticated
  using (
    exists (
      select 1 from public.landing_pages lp
      where lp.id = form_submissions.landing_page_id
        and lp.user_id = auth.uid()
    )
  );

-- Storage
insert into storage.buckets (id, name, public)
values ('landing-media', 'landing-media', true)
on conflict (id) do nothing;

create policy "media_select_public" on storage.objects for select
  using (bucket_id = 'landing-media');
create policy "media_insert_own_folder" on storage.objects for insert to authenticated
  with check (
    bucket_id = 'landing-media'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
create policy "media_update_own" on storage.objects for update to authenticated
  using (bucket_id = 'landing-media' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "media_delete_own" on storage.objects for delete to authenticated
  using (bucket_id = 'landing-media' and (storage.foldername(name))[1] = auth.uid()::text);
