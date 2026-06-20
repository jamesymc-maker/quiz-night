create extension if not exists "pgcrypto";

create table quizzes (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  created_at timestamptz default now()
);

create table players (
  id uuid primary key default gen_random_uuid(),
  quiz_id uuid not null references quizzes(id) on delete cascade,
  name text not null,
  specialist_topic text,
  level text not null default 'adult',
  order_index int not null default 0,
  created_at timestamptz default now()
);

create table rounds (
  id uuid primary key default gen_random_uuid(),
  quiz_id uuid not null references quizzes(id) on delete cascade,
  order_index int not null,
  title text not null,
  topic text not null,
  level text not null default 'adult',
  type text not null default 'general',
  player_id uuid references players(id) on delete cascade,
  timer_seconds int,
  created_at timestamptz default now()
);

create table questions (
  id uuid primary key default gen_random_uuid(),
  round_id uuid not null references rounds(id) on delete cascade,
  order_index int not null,
  question_text text not null,
  options jsonb not null,
  correct_index int not null,
  explanation text,
  points int not null default 1,
  created_at timestamptz default now()
);

create table sessions (
  id uuid primary key default gen_random_uuid(),
  quiz_id uuid not null references quizzes(id) on delete cascade,
  state jsonb not null,
  status text not null default 'in_progress',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table quizzes enable row level security;
alter table players enable row level security;
alter table rounds enable row level security;
alter table questions enable row level security;
alter table sessions enable row level security;

create policy "anon read quizzes" on quizzes for select using (true);
create policy "anon read players" on players for select using (true);
create policy "anon read rounds" on rounds for select using (true);
create policy "anon read questions" on questions for select using (true);
create policy "anon read sessions" on sessions for select using (true);
