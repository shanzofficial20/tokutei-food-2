-- Tokutei Food 2 Web MVP Schema
-- Jalankan di Supabase SQL Editor

create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text unique,
  role text not null default 'free' check (role in ('free', 'premium', 'admin')),
  premium_until timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.questions (
  id bigserial primary key,
  chapter text not null,
  question text not null,
  option_1 text not null,
  option_2 text not null,
  option_3 text not null,
  option_4 text not null,
  correct_answer int not null check (correct_answer between 1 and 4),
  explanation text,
  is_free boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.attempts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  mode text not null default 'simulasi',
  score int not null,
  total_questions int not null,
  created_at timestamptz not null default now()
);

create table if not exists public.attempt_answers (
  id uuid primary key default gen_random_uuid(),
  attempt_id uuid not null references public.attempts(id) on delete cascade,
  question_id bigint not null references public.questions(id) on delete cascade,
  selected_answer int,
  correct_answer int not null,
  is_correct boolean not null
);

alter table public.profiles enable row level security;
alter table public.questions enable row level security;
alter table public.attempts enable row level security;
alter table public.attempt_answers enable row level security;

drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own"
on public.profiles for select
to authenticated
using (auth.uid() = id);

drop policy if exists "attempts_select_own" on public.attempts;
create policy "attempts_select_own"
on public.attempts for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "attempt_answers_select_own" on public.attempt_answers;
create policy "attempt_answers_select_own"
on public.attempt_answers for select
to authenticated
using (
  exists (
    select 1 from public.attempts a
    where a.id = attempt_answers.attempt_id
    and a.user_id = auth.uid()
  )
);

-- Client biasa tidak perlu select langsung ke questions.
-- Route server memakai SERVICE_ROLE_KEY untuk mengambil soal.
drop policy if exists "questions_no_direct_client_select" on public.questions;
create policy "questions_no_direct_client_select"
on public.questions for select
to authenticated
using (false);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, role)
  values (new.id, new.email, 'free')
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();

insert into public.questions
(chapter, question, option_1, option_2, option_3, option_4, correct_answer, explanation, is_free)
values
('第3章 品質管理', 'QCDの組み合わせとして正しいものはどれですか。', 'Quantity・Clean・Danger', 'Quality・Cleaning・Design', 'Quality・Cost・Delivery', 'Question・Cost・Data', 3, 'QCDはQuality・Cost・Deliveryのことです。', true),
('第3章 品質管理', 'SDCAサイクルの目的として最も適切なものはどれですか。', '作業を毎回変えること', '標準を守り、安定した管理状態を維持すること', '記録を残さないこと', 'CCPをなくすこと', 2, 'SDCAは標準を守り、安定した管理状態を維持するための考え方です。', true),
('第2章 食品衛生', '食品衛生の基本として最も適切なものはどれですか。', '手洗いを省略する', '異物混入を防止する', '温度管理をしない', '記録を残さない', 2, '食品衛生では異物混入防止、手洗い、温度管理、記録が重要です。', false),
('第5章 労働安全', '労働災害を防ぐために最も重要な行動はどれですか。', '急いで作業する', '保護具を使わない', '決められた手順を守る', '異常を報告しない', 3, '安全作業では標準手順と報告が重要です。', false)
on conflict do nothing;
