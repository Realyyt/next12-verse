-- Add likes_count and comments_count to posts table
alter table public.posts
add column if not exists likes_count integer default 0,
add column if not exists comments_count integer default 0;

-- Drop existing post_likes table if it exists
drop table if exists public.post_likes;

-- Create likes table with proper foreign key relationships
create table public.post_likes (
    id uuid primary key default uuid_generate_v4(),
    post_id uuid not null,
    user_id uuid not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    constraint unique_post_like unique (post_id, user_id),
    constraint fk_post_likes_post foreign key (post_id) references public.posts(id) on delete cascade,
    constraint fk_post_likes_user foreign key (user_id) references public.profiles(id) on delete cascade
);

-- Create indexes for better performance
create index if not exists idx_post_likes_post_id on public.post_likes(post_id);
create index if not exists idx_post_likes_user_id on public.post_likes(user_id);

-- Enable Row Level Security for post_likes
alter table public.post_likes enable row level security;

-- Create RLS policies for post_likes
create policy "Post likes are viewable by everyone"
    on public.post_likes for select
    using (true);

create policy "Users can create their own likes"
    on public.post_likes for insert
    with check (auth.uid() = user_id);

create policy "Users can delete their own likes"
    on public.post_likes for delete
    using (auth.uid() = user_id);

-- Create function to update likes count
create or replace function public.handle_post_like()
returns trigger as $$
begin
    if (TG_OP = 'INSERT') then
        update public.posts
        set likes_count = likes_count + 1
        where id = NEW.post_id;
    elsif (TG_OP = 'DELETE') then
        update public.posts
        set likes_count = likes_count - 1
        where id = OLD.post_id;
    end if;
    return null;
end;
$$ language plpgsql;

-- Create trigger for likes count
create trigger handle_post_like_count
    after insert or delete on public.post_likes
    for each row
    execute function public.handle_post_like();

-- Create function to update comments count
create or replace function public.handle_comment_count()
returns trigger as $$
begin
    if (TG_OP = 'INSERT') then
        update public.posts
        set comments_count = comments_count + 1
        where id = NEW.post_id;
    elsif (TG_OP = 'DELETE') then
        update public.posts
        set comments_count = comments_count - 1
        where id = OLD.post_id;
    end if;
    return null;
end;
$$ language plpgsql;

-- Create trigger for comments count
create trigger handle_comment_count
    after insert or delete on public.comments
    for each row
    execute function public.handle_comment_count(); 