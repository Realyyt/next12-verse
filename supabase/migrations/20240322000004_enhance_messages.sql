-- Create message_type enum
create type message_type as enum ('text', 'image', 'file', 'call');

-- Create call_status enum
create type call_status as enum ('missed', 'answered', 'rejected');

-- Add new columns to messages table
alter table public.messages
add column if not exists type message_type default 'text',
add column if not exists media_url text,
add column if not exists file_name text,
add column if not exists file_size integer,
add column if not exists file_type text,
add column if not exists call_duration integer,
add column if not exists call_status call_status;

-- Create storage bucket for chat media
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('chat-media', 'chat-media', true, 10485760, ARRAY[
  'image/jpeg', 'image/png', 'image/gif', 'image/webp',
  'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'text/plain', 'application/zip', 'application/x-rar-compressed'
])
on conflict (id) do update set
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Set up storage policies for chat media bucket
create policy "Chat Media Public Access"
on storage.objects for select
using ( bucket_id = 'chat-media' );

create policy "Authenticated users can upload chat media"
on storage.objects for insert
with check (
  bucket_id = 'chat-media'
  and auth.role() = 'authenticated'
);

create policy "Users can update their own chat media"
on storage.objects for update
using (
  bucket_id = 'chat-media'
  and auth.uid() = owner
);

create policy "Users can delete their own chat media"
on storage.objects for delete
using (
  bucket_id = 'chat-media'
  and auth.uid() = owner
); 