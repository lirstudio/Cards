-- Promote liran+cards@lirstudio.co.il to admin (profiles.role)
update public.profiles p
set role = 'admin'
from auth.users u
where p.id = u.id
  and lower(u.email::text) = lower('liran+cards@lirstudio.co.il');
