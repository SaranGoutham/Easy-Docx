# Supabase Migration

Go to Supabase and run the following SQL Query

```
create table document_briefings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null,
  file_name text not null,
  summary text,
  created_at timestamptz not null default now()
);

alter table document_briefings enable row level security;

create policy "Users can insert own briefings"
  on document_briefings
  for insert with check (auth.uid() = user_id);

create policy "Users can view own briefings"
  on document_briefings
  for select using (auth.uid() = user_id);

```

then run this

```
-- Create the history table if it doesn’t already exist
create table if not exists document_briefings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null,
  file_name text not null,
  summary text,
  created_at timestamptz not null default now()
);

-- Enable RLS so we can scope access to the current auth.uid()
alter table document_briefings enable row level security;

-- Install row-level policies in an idempotent way
create or replace function public.enable_briefing_policies()
returns void
language plpgsql
security definer
as $$
begin
  if not exists (
    select 1
    from pg_policies
    where policyname = 'Users insert own briefings'
      and tablename = 'document_briefings'
  ) then
    create policy "Users insert own briefings"
      on document_briefings
      for insert
      with check (auth.uid() = user_id);
  end if;

  if not exists (
    select 1
    from pg_policies
    where policyname = 'Users view own briefings'
      and tablename = 'document_briefings'
  ) then
    create policy "Users view own briefings"
      on document_briefings
      for select
      using (auth.uid() = user_id);
  end if;
end;
$$;

select public.enable_briefing_policies();

```
