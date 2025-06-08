-- Enable necessary extensions
create extension if not exists "uuid-ossp";

-- Create custom types
create type connection_status as enum ('pending', 'accepted', 'rejected');
create type event_status as enum ('draft', 'published', 'cancelled', 'completed');
create type registration_status as enum ('pending', 'confirmed', 'cancelled');

-- Create profiles table
create table if not exists public.profiles (
    id uuid primary key references auth.users on delete cascade,
    name text not null,
    username text not null unique,
    avatar text,
    cover_photo text,
    bio text,
    location text,
    is_verified boolean default false,
    is_admin boolean default false,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create posts table
create table if not exists public.posts (
    id uuid primary key default uuid_generate_v4(),
    user_id uuid not null references public.profiles(id) on delete cascade,
    content text,
    image_url text,
    likes_count integer default 0,
    comments_count integer default 0,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create post_likes table
create table if not exists public.post_likes (
    id uuid primary key default uuid_generate_v4(),
    post_id uuid not null references public.posts(id) on delete cascade,
    user_id uuid not null references public.profiles(id) on delete cascade,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    constraint unique_post_like unique (post_id, user_id)
);

-- Create comments table with support for nested comments
create table if not exists public.comments (
    id uuid primary key default uuid_generate_v4(),
    post_id uuid not null references public.posts(id) on delete cascade,
    user_id uuid not null references public.profiles(id) on delete cascade,
    parent_id uuid references public.comments(id) on delete cascade,
    content text not null,
    likes_count integer default 0,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create comment_likes table
create table if not exists public.comment_likes (
    id uuid primary key default uuid_generate_v4(),
    comment_id uuid not null references public.comments(id) on delete cascade,
    user_id uuid not null references public.profiles(id) on delete cascade,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    constraint unique_comment_like unique (comment_id, user_id)
);

-- Create post_shares table
create table if not exists public.post_shares (
    id uuid primary key default uuid_generate_v4(),
    post_id uuid not null references public.posts(id) on delete cascade,
    user_id uuid not null references public.profiles(id) on delete cascade,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create connections table
create table public.connections (
    id uuid primary key default uuid_generate_v4(),
    user_id uuid not null references public.profiles(id) on delete cascade,
    friend_id uuid not null references public.profiles(id) on delete cascade,
    status connection_status default 'pending'::connection_status not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
    constraint unique_connection unique (user_id, friend_id)
);

-- Create messages table
create table public.messages (
    id uuid primary key default uuid_generate_v4(),
    sender_id uuid not null references public.profiles(id) on delete cascade,
    receiver_id uuid not null references public.profiles(id) on delete cascade,
    content text not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create events table
create table public.events (
    id uuid primary key default uuid_generate_v4(),
    title text not null,
    description text,
    date date not null,
    time time not null,
    location text not null,
    max_attendees integer,
    image_url text,
    created_by uuid not null references public.profiles(id) on delete cascade,
    status event_status default 'draft'::event_status not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create event_registrations table
create table public.event_registrations (
    id uuid primary key default uuid_generate_v4(),
    event_id uuid not null references public.events(id) on delete cascade,
    user_id uuid not null references public.profiles(id) on delete cascade,
    first_name text not null,
    last_name text not null,
    email text not null,
    phone text,
    dietary_restrictions text,
    additional_notes text,
    status registration_status default 'pending'::registration_status not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
    constraint unique_registration unique (event_id, user_id)
);

-- Create indexes for better performance
create index if not exists idx_posts_user_id on public.posts(user_id);
create index if not exists idx_post_likes_post_id on public.post_likes(post_id);
create index if not exists idx_post_likes_user_id on public.post_likes(user_id);
create index if not exists idx_comments_post_id on public.comments(post_id);
create index if not exists idx_comments_user_id on public.comments(user_id);
create index if not exists idx_comments_parent_id on public.comments(parent_id);
create index if not exists idx_comment_likes_comment_id on public.comment_likes(comment_id);
create index if not exists idx_comment_likes_user_id on public.comment_likes(user_id);
create index if not exists idx_post_shares_post_id on public.post_shares(post_id);
create index if not exists idx_post_shares_user_id on public.post_shares(user_id);
create index idx_connections_user_id on public.connections(user_id);
create index idx_connections_friend_id on public.connections(friend_id);
create index idx_messages_sender_id on public.messages(sender_id);
create index idx_messages_receiver_id on public.messages(receiver_id);
create index idx_events_created_by on public.events(created_by);
create index idx_event_registrations_event_id on public.event_registrations(event_id);
create index idx_event_registrations_user_id on public.event_registrations(user_id);

-- Enable Row Level Security
alter table public.profiles enable row level security;
alter table public.posts enable row level security;
alter table public.post_likes enable row level security;
alter table public.comments enable row level security;
alter table public.comment_likes enable row level security;
alter table public.post_shares enable row level security;
alter table public.connections enable row level security;
alter table public.messages enable row level security;
alter table public.events enable row level security;
alter table public.event_registrations enable row level security;

-- Create RLS Policies

-- Profiles policies
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
CREATE POLICY "Public profiles are viewable by everyone"
    ON public.profiles FOR SELECT
    USING (true);

DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile"
    ON public.profiles FOR UPDATE
    USING (auth.uid() = id);

-- Posts policies
DROP POLICY IF EXISTS "Posts are viewable by everyone" ON public.posts;
CREATE POLICY "Posts are viewable by everyone"
    ON public.posts FOR SELECT
    USING (true);

DROP POLICY IF EXISTS "Users can create their own posts" ON public.posts;
CREATE POLICY "Users can create their own posts"
    ON public.posts FOR INSERT
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own posts" ON public.posts;
CREATE POLICY "Users can update their own posts"
    ON public.posts FOR UPDATE
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own posts" ON public.posts;
CREATE POLICY "Users can delete their own posts"
    ON public.posts FOR DELETE
    USING (auth.uid() = user_id);

-- Post likes policies
DROP POLICY IF EXISTS "Post likes are viewable by everyone" ON public.post_likes;
CREATE POLICY "Post likes are viewable by everyone"
    ON public.post_likes FOR SELECT
    USING (true);

DROP POLICY IF EXISTS "Users can like posts" ON public.post_likes;
CREATE POLICY "Users can like posts"
    ON public.post_likes FOR INSERT
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can unlike their own likes" ON public.post_likes;
CREATE POLICY "Users can unlike their own likes"
    ON public.post_likes FOR DELETE
    USING (auth.uid() = user_id);

-- Comments policies
DROP POLICY IF EXISTS "Comments are viewable by everyone" ON public.comments;
CREATE POLICY "Comments are viewable by everyone"
    ON public.comments FOR SELECT
    USING (true);

DROP POLICY IF EXISTS "Users can create comments" ON public.comments;
CREATE POLICY "Users can create comments"
    ON public.comments FOR INSERT
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own comments" ON public.comments;
CREATE POLICY "Users can update their own comments"
    ON public.comments FOR UPDATE
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own comments" ON public.comments;
CREATE POLICY "Users can delete their own comments"
    ON public.comments FOR DELETE
    USING (auth.uid() = user_id);

-- Comment likes policies
DROP POLICY IF EXISTS "Comment likes are viewable by everyone" ON public.comment_likes;
CREATE POLICY "Comment likes are viewable by everyone"
    ON public.comment_likes FOR SELECT
    USING (true);

DROP POLICY IF EXISTS "Users can like comments" ON public.comment_likes;
CREATE POLICY "Users can like comments"
    ON public.comment_likes FOR INSERT
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can unlike their own comment likes" ON public.comment_likes;
CREATE POLICY "Users can unlike their own comment likes"
    ON public.comment_likes FOR DELETE
    USING (auth.uid() = user_id);

-- Post shares policies
DROP POLICY IF EXISTS "Post shares are viewable by everyone" ON public.post_shares;
CREATE POLICY "Post shares are viewable by everyone"
    ON public.post_shares FOR SELECT
    USING (true);

DROP POLICY IF EXISTS "Users can share posts" ON public.post_shares;
CREATE POLICY "Users can share posts"
    ON public.post_shares FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Connections policies
create policy "Users can view their own connections"
    on public.connections for select
    using (auth.uid() = user_id or auth.uid() = friend_id);

create policy "Users can create connections"
    on public.connections for insert
    with check (auth.uid() = user_id);

create policy "Users can update their own connections"
    on public.connections for update
    using (auth.uid() = user_id or auth.uid() = friend_id);

-- Messages policies
create policy "Users can view their own messages"
    on public.messages for select
    using (auth.uid() = sender_id or auth.uid() = receiver_id);

create policy "Users can send messages"
    on public.messages for insert
    with check (auth.uid() = sender_id);

-- Events policies
create policy "Events are viewable by everyone"
    on public.events for select
    using (true);

create policy "Users can create events"
    on public.events for insert
    with check (auth.uid() = created_by);

create policy "Users can update their own events"
    on public.events for update
    using (auth.uid() = created_by);

create policy "Users can delete their own events"
    on public.events for delete
    using (auth.uid() = created_by);

-- Event registrations policies
create policy "Users can view their own registrations"
    on public.event_registrations for select
    using (auth.uid() = user_id);

create policy "Event creators can view all registrations for their events"
    on public.event_registrations for select
    using (
        exists (
            select 1 from public.events
            where events.id = event_registrations.event_id
            and events.created_by = auth.uid()
        )
    );

create policy "Users can create their own registrations"
    on public.event_registrations for insert
    with check (auth.uid() = user_id);

create policy "Users can update their own registrations"
    on public.event_registrations for update
    using (auth.uid() = user_id);

-- Create functions for counting likes and comments
create or replace function public.get_post_likes_count(post_id uuid)
returns integer as $$
begin
    return (select count(*) from public.post_likes where post_id = $1);
end;
$$ language plpgsql security definer;

create or replace function public.get_post_comments_count(post_id uuid)
returns integer as $$
begin
    return (select count(*) from public.comments where post_id = $1);
end;
$$ language plpgsql security definer;

create or replace function public.get_comment_likes_count(comment_id uuid)
returns integer as $$
begin
    return (select count(*) from public.comment_likes where comment_id = $1);
end;
$$ language plpgsql security definer;

-- Create triggers for updating counts
create or replace function public.handle_post_like_count()
returns trigger as $$
begin
    if (TG_OP = 'INSERT') then
        update public.posts set likes_count = likes_count + 1 where id = NEW.post_id;
    elsif (TG_OP = 'DELETE') then
        update public.posts set likes_count = likes_count - 1 where id = OLD.post_id;
    end if;
    return null;
end;
$$ language plpgsql security definer;

create or replace function public.handle_comment_like_count()
returns trigger as $$
begin
    if (TG_OP = 'INSERT') then
        update public.comments set likes_count = likes_count + 1 where id = NEW.comment_id;
    elsif (TG_OP = 'DELETE') then
        update public.comments set likes_count = likes_count - 1 where id = OLD.comment_id;
    end if;
    return null;
end;
$$ language plpgsql security definer;

-- Create triggers
drop trigger if exists handle_post_like_count on public.post_likes;
create trigger handle_post_like_count
    after insert or delete on public.post_likes
    for each row
    execute function public.handle_post_like_count();

drop trigger if exists handle_comment_like_count on public.comment_likes;
create trigger handle_comment_like_count
    after insert or delete on public.comment_likes
    for each row
    execute function public.handle_comment_like_count();

-- Create or replace RLS policies
DO $$ 
BEGIN
    -- Post shares policies
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'post_shares' AND policyname = 'Post shares are viewable by everyone') THEN
        CREATE POLICY "Post shares are viewable by everyone"
            ON public.post_shares FOR SELECT
            USING (true);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'post_shares' AND policyname = 'Users can share posts') THEN
        CREATE POLICY "Users can share posts"
            ON public.post_shares FOR INSERT
            WITH CHECK (auth.uid() = user_id);
    END IF;

    -- Comment likes policies
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'comment_likes' AND policyname = 'Comment likes are viewable by everyone') THEN
        CREATE POLICY "Comment likes are viewable by everyone"
            ON public.comment_likes FOR SELECT
            USING (true);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'comment_likes' AND policyname = 'Users can like comments') THEN
        CREATE POLICY "Users can like comments"
            ON public.comment_likes FOR INSERT
            WITH CHECK (auth.uid() = user_id);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'comment_likes' AND policyname = 'Users can unlike their own comment likes') THEN
        CREATE POLICY "Users can unlike their own comment likes"
            ON public.comment_likes FOR DELETE
            USING (auth.uid() = user_id);
    END IF;
END $$; 