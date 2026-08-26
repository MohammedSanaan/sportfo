-- Bugfix: generate_series(date, date, interval) returns `timestamp`, not
-- `date` -- the function's RETURNS TABLE (day date, ...) declaration was
-- mismatched, causing every call to fail with "structure of query does not
-- match function result type" (discovered via live testing: the Registration
-- Trend chart always rendered empty because the RPC silently errored and
-- the page fell back to an empty array). Explicit ::date cast fixes it.
create or replace function public.admin_registration_trend(p_from date, p_to date)
returns table (day date, registrations bigint)
language plpgsql
security definer
stable
set search_path = ''
as $$
begin
  if not public.is_current_user_admin() then
    raise exception 'Not authorized';
  end if;

  if p_to < p_from or p_to - p_from > 366 then
    raise exception 'Invalid trend range';
  end if;

  return query
  select gs.day::date, count(r.id)
  from generate_series(p_from, p_to, interval '1 day') as gs(day)
  left join public.registrations r
    on (r.registered_at at time zone 'Asia/Kolkata')::date = gs.day::date
  group by gs.day
  order by gs.day;
end;
$$;

grant execute on function public.admin_registration_trend(date, date) to authenticated;
