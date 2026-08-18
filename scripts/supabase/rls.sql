-- Políticas para o front no Vercel falar com o Postgres via Data API.
-- Express/EC2 não depende disto.

create or replace function public.is_acervo_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(auth.jwt() -> 'user_metadata' ->> 'role', '') = 'admin'
      or coalesce(auth.jwt() -> 'app_metadata' ->> 'role', '') = 'admin';
$$;

alter table public.odas enable row level security;
alter table public.bncc enable row level security;
alter table public.user_favorites enable row level security;
alter table public.oda_view_events enable row level security;
alter table public.users enable row level security;

drop policy if exists odas_select_authenticated on public.odas;
create policy odas_select_authenticated on public.odas
  for select to authenticated
  using (
    public.is_acervo_admin()
    or (
      ativo = true
      and lower(trim(coalesce(status, ''))) = 'funcionando'
      and link_repositorio is not null
      and length(trim(link_repositorio)) > 0
    )
  );

drop policy if exists bncc_select_authenticated on public.bncc;
create policy bncc_select_authenticated on public.bncc
  for select to authenticated
  using (true);

create table if not exists public.auth_favorites (
  user_id uuid not null references auth.users (id) on delete cascade,
  project_id integer not null references public.odas (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, project_id)
);

alter table public.auth_favorites enable row level security;

drop policy if exists auth_favorites_own on public.auth_favorites;
create policy auth_favorites_own on public.auth_favorites
  for all to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create table if not exists public.auth_view_events (
  user_id uuid not null references auth.users (id) on delete cascade,
  oda_id integer not null references public.odas (id) on delete cascade,
  kind text not null,
  viewed_on date not null,
  created_at timestamptz not null default now(),
  primary key (user_id, oda_id, kind, viewed_on)
);

alter table public.auth_view_events enable row level security;

drop policy if exists auth_view_events_own on public.auth_view_events;
create policy auth_view_events_own on public.auth_view_events
  for select to authenticated
  using (user_id = auth.uid() or public.is_acervo_admin());

create or replace function public.record_oda_view(p_oda_id integer, p_kind text)
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  viewed date := (timezone('America/Sao_Paulo', now()))::date;
  inserted boolean := false;
  page_count integer;
  open_count integer;
begin
  if auth.uid() is null then
    raise exception 'not authenticated';
  end if;
  if p_kind not in ('page', 'open') then
    raise exception 'invalid kind';
  end if;
  if not exists (
    select 1 from public.odas
    where id = p_oda_id
      and (
        public.is_acervo_admin()
        or (
          ativo = true
          and lower(trim(coalesce(status, ''))) = 'funcionando'
          and link_repositorio is not null
          and length(trim(link_repositorio)) > 0
        )
      )
  ) then
    raise exception 'oda not found';
  end if;

  begin
    insert into public.auth_view_events (user_id, oda_id, kind, viewed_on)
    values (auth.uid(), p_oda_id, p_kind, viewed);
    inserted := true;
  exception
    when unique_violation then
      inserted := false;
  end;

  if inserted then
    if p_kind = 'page' then
      update public.odas set page_view_count = page_view_count + 1 where id = p_oda_id;
    else
      update public.odas set open_view_count = open_view_count + 1 where id = p_oda_id;
    end if;
  end if;

  select page_view_count, open_view_count into page_count, open_count
  from public.odas where id = p_oda_id;

  return json_build_object(
    'counted', inserted,
    'pageViewCount', page_count,
    'openViewCount', open_count
  );
end;
$$;

grant execute on function public.record_oda_view(integer, text) to authenticated;
grant select on public.odas to authenticated;
grant select on public.bncc to authenticated;
grant all on public.auth_favorites to authenticated;
grant select on public.auth_view_events to authenticated;
