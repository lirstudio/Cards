-- Aggregated page view counts for the dashboard (avoids fetching every page_views row; RLS limits rows to owner).

create or replace function public.get_my_landing_page_view_counts()
returns table (landing_page_id uuid, view_count bigint)
language sql
security invoker
stable
set search_path = public
as $$
  select pv.landing_page_id, count(*)::bigint as view_count
  from public.page_views pv
  group by pv.landing_page_id;
$$;

comment on function public.get_my_landing_page_view_counts() is
  'Per-landing-page view totals for the authenticated user (RLS on page_views filters to owned pages).';

grant execute on function public.get_my_landing_page_view_counts() to authenticated;
