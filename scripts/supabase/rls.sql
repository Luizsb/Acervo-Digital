-- Políticas para o front no Vercel falar com o Postgres via Data API.
-- Express/EC2 não depende disto.

-- O papel vem só de app_metadata: user_metadata é editável pelo próprio usuário
-- via supabase.auth.updateUser e não pode conceder privilégio.
create or replace function public.is_acervo_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(auth.jwt() -> 'app_metadata' ->> 'role', '') = 'admin';
$$;

-- Postgres concede EXECUTE a PUBLIC por padrão; o Security Advisor reclama de DEFINER aberto.
revoke execute on function public.is_acervo_admin() from public;
revoke execute on function public.is_acervo_admin() from anon;
grant execute on function public.is_acervo_admin() to authenticated;

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

revoke execute on function public.record_oda_view(integer, text) from public;
revoke execute on function public.record_oda_view(integer, text) from anon;
grant execute on function public.record_oda_view(integer, text) to authenticated;
grant select on public.odas to authenticated;
grant select on public.bncc to authenticated;
grant all on public.auth_favorites to authenticated;
grant select on public.auth_view_events to authenticated;

-- Tabela interna do Prisma: não deve aparecer na Data API sem RLS.
do $$
begin
  if to_regclass('public._prisma_migrations') is not null then
    execute 'alter table public._prisma_migrations enable row level security';
    execute 'revoke all on table public._prisma_migrations from anon, authenticated';
  end if;
end $$;

-- Histórico da última importação no painel admin (Vercel lê via Data API).
create table if not exists public.import_events (
  id serial primary key,
  synced_at timestamptz not null,
  codigo text not null,
  titulo text not null,
  kind text not null,
  imagem text,
  status text
);

create index if not exists import_events_synced_at_idx on public.import_events (synced_at);
create index if not exists import_events_kind_idx on public.import_events (kind);

alter table public.import_events enable row level security;

drop policy if exists import_events_admin_select on public.import_events;
create policy import_events_admin_select on public.import_events
  for select to authenticated
  using (public.is_acervo_admin());

grant select on table public.import_events to authenticated;

-- Ping do GitHub Actions (keep-supabase-awake.yml). SELECT público, sem dado do catálogo.
create table if not exists public.keep_alive (
  id integer primary key,
  poked_at timestamptz not null default now()
);

insert into public.keep_alive (id) values (1)
on conflict (id) do nothing;

alter table public.keep_alive enable row level security;

drop policy if exists keep_alive_select on public.keep_alive;
create policy keep_alive_select on public.keep_alive
  for select to anon, authenticated
  using (true);

grant select on table public.keep_alive to anon, authenticated;

-- Trilha de auditoria. A tabela audit_events vem da migração do Prisma (rode
-- `npm run prisma:migrate` antes deste script). Nenhum papel da Data API lê ou escreve.
do $$
begin
  if to_regclass('public.audit_events') is not null then
    execute 'alter table public.audit_events enable row level security';
    execute 'revoke all on table public.audit_events from anon, authenticated';
  end if;
end $$;

-- Login e mudança de papel no Auth do Supabase. Falha na auditoria vira warning:
-- um erro aqui não pode impedir o login.
create or replace function public.audit_auth_user_change()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  begin
    if new.last_sign_in_at is distinct from old.last_sign_in_at then
      insert into public.audit_events (action, actor, origin, details)
      values (
        'auth.login',
        new.email,
        'supabase',
        jsonb_build_object('papel', coalesce(new.raw_app_meta_data ->> 'role', 'user'))
      );
    end if;
    if (new.raw_app_meta_data ->> 'role') is distinct from (old.raw_app_meta_data ->> 'role') then
      insert into public.audit_events (action, actor, target, origin, details)
      values (
        'auth.role_changed',
        session_user,
        new.email,
        'supabase',
        jsonb_build_object(
          'de', old.raw_app_meta_data ->> 'role',
          'para', new.raw_app_meta_data ->> 'role'
        )
      );
    end if;
  exception when others then
    raise warning 'audit_auth_user_change: %', sqlerrm;
  end;
  return new;
end;
$$;

revoke execute on function public.audit_auth_user_change() from public;
revoke execute on function public.audit_auth_user_change() from anon;
revoke execute on function public.audit_auth_user_change() from authenticated;

drop trigger if exists auth_user_change_audit on auth.users;
create trigger auth_user_change_audit
  after update on auth.users
  for each row execute function public.audit_auth_user_change();
