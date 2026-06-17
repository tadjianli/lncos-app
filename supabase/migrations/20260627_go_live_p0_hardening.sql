-- P0: promo max_uses — increment atomique avec garde
create or replace function public.increment_promo_uses(promo_code_arg text)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  rows_affected integer;
begin
  update public.promotions
  set current_uses = current_uses + 1
  where code = upper(trim(promo_code_arg))
    and is_active = true
    and (max_uses is null or current_uses < max_uses);

  get diagnostics rows_affected = row_count;
  return rows_affected > 0;
end;
$$;

revoke all on function public.increment_promo_uses(text) from public;
revoke all on function public.increment_promo_uses(text) from anon;
revoke all on function public.increment_promo_uses(text) from authenticated;
grant execute on function public.increment_promo_uses(text) to service_role;
