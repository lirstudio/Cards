-- Page views tracking for user dashboard analytics

create table public.page_views (
  id uuid primary key default gen_random_uuid(),
  landing_page_id uuid not null references public.landing_pages (id) on delete cascade,
  created_at timestamptz not null default now()
);

create index page_views_page_idx on public.page_views (landing_page_id);
create index page_views_created_idx on public.page_views (created_at);

alter table public.page_views enable row level security;

-- Anyone (anon or authenticated) can record a view on a published page
create policy "pv_insert_published" on public.page_views
  for insert to anon, authenticated
  with check (
    exists (
      select 1 from public.landing_pages lp
      where lp.id = page_views.landing_page_id
        and lp.status = 'published'
    )
  );

-- Page owner can read their own view counts
create policy "pv_select_owner" on public.page_views
  for select to authenticated
  using (
    exists (
      select 1 from public.landing_pages lp
      where lp.id = page_views.landing_page_id
        and lp.user_id = auth.uid()
    )
  );

-- Admin can read all
create policy "pv_select_admin" on public.page_views
  for select to authenticated
  using (public.is_admin());
