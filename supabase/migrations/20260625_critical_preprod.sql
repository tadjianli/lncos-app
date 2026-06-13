-- Critical pre-production: atomic stock decrement + fulfillment tracking

alter table public.orders
  add column if not exists stock_adjusted boolean not null default false;

alter table public.orders
  add column if not exists confirmation_email_sent_at timestamptz;

alter table public.orders
  add column if not exists shipped_email_sent_at timestamptz;

create or replace function public.decrement_order_items_stock(items jsonb)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  item jsonb;
  pid text;
  vname text;
  qty int;
begin
  if items is null or jsonb_array_length(items) = 0 then
    return;
  end if;

  for item in select * from jsonb_array_elements(items)
  loop
    pid := item->>'product_id';
    vname := nullif(trim(item->>'variant'), '');
    qty := (item->>'qty')::int;

    if pid is null or qty is null or qty <= 0 then
      raise exception 'invalid_stock_item';
    end if;

    if vname is not null then
      update public.product_variants pv
      set stock = stock - qty
      where pv.product_id = pid and pv.name = vname and pv.stock >= qty;
      if not found then
        raise exception 'stock_insufficient_variant';
      end if;
    else
      update public.products p
      set stock = stock - qty
      where p.id = pid and p.stock >= qty;
      if not found then
        raise exception 'stock_insufficient_product';
      end if;
    end if;
  end loop;
end;
$$;

revoke all on function public.decrement_order_items_stock(jsonb) from public;
grant execute on function public.decrement_order_items_stock(jsonb) to service_role;
