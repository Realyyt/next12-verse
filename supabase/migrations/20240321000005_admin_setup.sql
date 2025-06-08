-- Enable UUID extension if not already enabled
create extension if not exists "uuid-ossp";

-- Create event_status enum type if it doesn't exist
do $$ begin
    if not exists (select 1 from pg_type where typname = 'event_status') then
        create type event_status as enum ('active', 'cancelled', 'completed');
    end if;
end $$;

-- Drop and recreate storage bucket for event images
drop policy if exists "Public Access" on storage.objects;
drop policy if exists "Authenticated users can upload event images" on storage.objects;
drop policy if exists "Users can update their own event images" on storage.objects;
drop policy if exists "Users can delete their own event images" on storage.objects;

delete from storage.buckets where id = 'events';
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('events', 'events', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp']);

-- Create storage policies for events bucket
create policy "Events Public Access"
on storage.objects for select
using ( bucket_id = 'events' );

create policy "Authenticated users can upload event images"
on storage.objects for insert
with check (
  bucket_id = 'events'
  and auth.role() = 'authenticated'
);

create policy "Users can update their own event images"
on storage.objects for update
using (
  bucket_id = 'events'
  and auth.role() = 'authenticated'
);

create policy "Users can delete their own event images"
on storage.objects for delete
using (
  bucket_id = 'events'
  and auth.role() = 'authenticated'
);

-- Create admin user with proper password hashing
do $$
declare
  admin_id uuid;
begin
  -- Check if admin user already exists
  select id into admin_id from auth.users where email = 'labs@next12.org';
  
  if admin_id is null then
    -- Create new admin user
    insert into auth.users (
      instance_id,
      id,
      aud,
      role,
      email,
      encrypted_password,
      email_confirmed_at,
      recovery_sent_at,
      last_sign_in_at,
      raw_app_meta_data,
      raw_user_meta_data,
      created_at,
      updated_at,
      confirmation_token,
      email_change,
      email_change_token_new,
      recovery_token
    ) values (
      '00000000-0000-0000-0000-000000000000',
      uuid_generate_v4(),
      'authenticated',
      'authenticated',
      'labs@next12.org',
      crypt('Next12#$#', gen_salt('bf')),
      now(),
      now(),
      now(),
      '{"provider":"email","providers":["email"]}',
      jsonb_build_object(
        'full_name', 'Next12 Admin',
        'username', 'Next12Admin',
        'is_admin', true
      ),
      now(),
      now(),
      '',
      '',
      '',
      ''
    );
  else
    -- Update existing admin user
    update auth.users set
      encrypted_password = crypt('Next12#$#', gen_salt('bf')),
      email_confirmed_at = now(),
      raw_user_meta_data = jsonb_build_object(
        'full_name', 'Next12 Admin',
        'username', 'Next12Admin',
        'is_admin', true
      ),
      updated_at = now()
    where id = admin_id;
  end if;
end $$;

-- Create admin profile
do $$
declare
  admin_id uuid;
begin
  -- Get admin user id
  select id into admin_id from auth.users where email = 'labs@next12.org';
  
  -- Insert or update admin profile
  insert into public.profiles (
    id,
    name,
    username,
    is_admin,
    is_verified,
    created_at,
    updated_at
  ) values (
    admin_id,
    'Next12 Admin',
    'Next12Admin',
    true,
    true,
    now(),
    now()
  ) on conflict (id) do update set
    is_admin = true,
    is_verified = true,
    updated_at = now();
end $$;

-- Add required columns first
-- Add banned field to profiles
alter table public.profiles
add column if not exists is_banned boolean default false;

-- Add admin notes field to profiles
alter table public.profiles
add column if not exists admin_notes text;

-- Create registration_status enum if it doesn't exist
do $$ begin
    if not exists (select 1 from pg_type where typname = 'registration_status') then
        create type registration_status as enum ('pending', 'approved', 'rejected', 'cancelled');
    end if;
end $$;

-- Add admin notes to event registrations
alter table public.event_registrations
add column if not exists admin_notes text;

-- Add admin approval timestamp
alter table public.event_registrations
add column if not exists approved_at timestamp with time zone,
add column if not exists approved_by uuid references public.profiles(id);

-- Ensure events table has event_status column
do $$ begin
    alter table public.events
    add column if not exists status event_status default 'active';
exception
    when duplicate_column then null;
end $$;

-- Drop all existing policies
drop policy if exists "Admins can view all event registrations" on public.event_registrations;
drop policy if exists "Admins can update event registrations" on public.event_registrations;
drop policy if exists "Admins can delete event registrations" on public.event_registrations;
drop policy if exists "Admins can view all users" on public.profiles;
drop policy if exists "Admins can update any user" on public.profiles;
drop policy if exists "Admins can create events" on public.events;
drop policy if exists "Admins can update events" on public.events;
drop policy if exists "Admins can delete events" on public.events;
drop policy if exists "Users can view events" on public.events;
drop policy if exists "Users can register for events" on public.event_registrations;
drop policy if exists "Users can view their own registrations" on public.event_registrations;
drop policy if exists "Users can cancel their own registrations" on public.event_registrations;
drop policy if exists "Admins can manage all registrations" on public.event_registrations;

-- Add event-specific policies
create policy "Users can view events"
  on public.events for select
  using (true);  -- Anyone can view events

create policy "Admins can create events"
  on public.events for insert
  with check (
    exists (
      select 1 from auth.users
      where auth.users.id = auth.uid()
      and auth.users.raw_user_meta_data->>'is_admin' = 'true'
    )
  );

create policy "Admins can update events"
  on public.events for update
  using (
    exists (
      select 1 from auth.users
      where auth.users.id = auth.uid()
      and auth.users.raw_user_meta_data->>'is_admin' = 'true'
    )
  );

create policy "Admins can delete events"
  on public.events for delete
  using (
    exists (
      select 1 from auth.users
      where auth.users.id = auth.uid()
      and auth.users.raw_user_meta_data->>'is_admin' = 'true'
    )
  );

-- Add event registration policies
create policy "Users can register for events"
  on public.event_registrations for insert
  with check (
    auth.role() = 'authenticated'
    and not exists (
      select 1 from public.profiles
      where id = auth.uid()
      and is_banned = true
    )
  );

create policy "Users can view their own registrations"
  on public.event_registrations for select
  using (
    auth.uid() = user_id
    or exists (
      select 1 from auth.users
      where auth.users.id = auth.uid()
      and auth.users.raw_user_meta_data->>'is_admin' = 'true'
    )
  );

create policy "Users can cancel their own registrations"
  on public.event_registrations for update
  using (
    auth.uid() = user_id
    and status = 'pending'
  );

create policy "Admins can manage all registrations"
  on public.event_registrations for all
  using (
    exists (
      select 1 from auth.users
      where auth.users.id = auth.uid()
      and auth.users.raw_user_meta_data->>'is_admin' = 'true'
    )
  );

-- Add user management policies
create policy "Admins can view all users"
  on public.profiles for select
  using (
    exists (
      select 1 from auth.users
      where auth.users.id = auth.uid()
      and auth.users.raw_user_meta_data->>'is_admin' = 'true'
    )
  );

create policy "Admins can update any user"
  on public.profiles for update
  using (
    exists (
      select 1 from auth.users
      where auth.users.id = auth.uid()
      and auth.users.raw_user_meta_data->>'is_admin' = 'true'
    )
  ); 