-- LN COS — Résultats clients Avant / Après

create table if not exists public.before_after_results (
  id                     uuid primary key default gen_random_uuid(),
  product_id             text not null references public.products(id) on delete cascade,
  review_id              uuid references public.product_reviews(id) on delete set null,
  before_image_url       text not null,
  after_image_url        text not null,
  description            text not null default '',
  result_duration        text not null default '2_weeks'
                           check (result_duration in ('1_day', '1_week', '2_weeks', '1_month', '2_months', 'custom')),
  result_duration_custom text,
  featured               boolean not null default false,
  pinned                 boolean not null default false,
  created_at             timestamptz not null default now(),
  updated_at             timestamptz not null default now()
);

create index if not exists idx_before_after_product on public.before_after_results (product_id, pinned desc, featured desc);
create index if not exists idx_before_after_review on public.before_after_results (review_id);
create index if not exists idx_before_after_featured on public.before_after_results (featured) where featured = true;

create trigger trg_before_after_results_updated_at
  before update on public.before_after_results
  for each row execute procedure public.set_updated_at();

alter table public.before_after_results enable row level security;

drop policy if exists "Public read before after results" on public.before_after_results;
create policy "Public read before after results"
  on public.before_after_results for select
  using (
    public.is_admin()
    or (
      before_image_url <> ''
      and after_image_url <> ''
      and (
        review_id is null
        or exists (
          select 1 from public.product_reviews pr
          where pr.id = review_id and pr.status = 'published'
        )
      )
    )
  );

drop policy if exists "Admins manage before after results" on public.before_after_results;
create policy "Admins manage before after results"
  on public.before_after_results for all
  using (public.is_admin())
  with check (public.is_admin());

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'before-after-images',
  'before-after-images',
  true,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Public read before after storage" on storage.objects;
drop policy if exists "Admin upload before after" on storage.objects;
drop policy if exists "Admin update before after storage" on storage.objects;
drop policy if exists "Admin delete before after storage" on storage.objects;

create policy "Public read before after storage"
  on storage.objects for select
  using (bucket_id = 'before-after-images');

create policy "Admin upload before after"
  on storage.objects for insert
  with check (bucket_id = 'before-after-images' and public.is_admin());

create policy "Admin update before after storage"
  on storage.objects for update
  using (bucket_id = 'before-after-images' and public.is_admin());

create policy "Admin delete before after storage"
  on storage.objects for delete
  using (bucket_id = 'before-after-images' and public.is_admin());

alter publication supabase_realtime add table public.before_after_results;
