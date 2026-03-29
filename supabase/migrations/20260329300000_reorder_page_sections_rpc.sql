-- Atomic reorder of page_sections.sort_order (single statement, RLS via SECURITY INVOKER)

create or replace function public.reorder_page_sections(
  p_page_id uuid,
  p_ordered_ids uuid[]
)
returns void
language plpgsql
security invoker
set search_path = public
as $$
declare
  uid uuid;
  expected int;
  got int;
begin
  uid := auth.uid();
  if uid is null then
    raise exception 'not authenticated';
  end if;

  if not exists (
    select 1
    from public.landing_pages lp
    where lp.id = p_page_id
      and lp.user_id = uid
  ) then
    raise exception 'forbidden';
  end if;

  select count(*)::int into expected
  from public.page_sections
  where landing_page_id = p_page_id;

  got := coalesce(array_length(p_ordered_ids, 1), 0);

  if expected <> got then
    raise exception 'reorder: section count mismatch (db %, payload %)', expected, got;
  end if;

  if exists (
    select 1
    from public.page_sections ps
    where ps.landing_page_id = p_page_id
      and not (ps.id = any (p_ordered_ids))
  ) then
    raise exception 'reorder: payload ids do not match page sections';
  end if;

  update public.page_sections ps
  set sort_order = (u.ord - 1)::int
  from (
    select id, ord
    from unnest(p_ordered_ids) with ordinality as u(id, ord)
  ) u
  where ps.id = u.id
    and ps.landing_page_id = p_page_id;
end;
$$;

grant execute on function public.reorder_page_sections(uuid, uuid[]) to authenticated;
