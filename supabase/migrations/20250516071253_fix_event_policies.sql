-- Drop existing event policies
DROP POLICY IF EXISTS "Users can view events" ON public.events;
DROP POLICY IF EXISTS "Admins can create events" ON public.events;
DROP POLICY IF EXISTS "Admins can update events" ON public.events;
DROP POLICY IF EXISTS "Admins can delete events" ON public.events;
DROP POLICY IF EXISTS "Events are viewable by everyone" ON public.events;
DROP POLICY IF EXISTS "Users can create events" ON public.events;
DROP POLICY IF EXISTS "Users can update their own events" ON public.events;
DROP POLICY IF EXISTS "Users can delete their own events" ON public.events;

-- Create new event policies
CREATE POLICY "Events are viewable by everyone"
    ON public.events FOR SELECT
    USING (true);

-- Only admins can create events
CREATE POLICY "Admins can create events"
    ON public.events FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid()
            AND is_admin = true
        )
    );

-- Only admins can update events
CREATE POLICY "Admins can update events"
    ON public.events FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid()
            AND is_admin = true
        )
    );

-- Only admins can delete events
CREATE POLICY "Admins can delete events"
    ON public.events FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid()
            AND is_admin = true
        )
    );

-- Event registration policies
DROP POLICY IF EXISTS "Users can register for events" ON public.event_registrations;
DROP POLICY IF EXISTS "Users can view their own registrations" ON public.event_registrations;
DROP POLICY IF EXISTS "Users can cancel their own registrations" ON public.event_registrations;
DROP POLICY IF EXISTS "Admins can manage all registrations" ON public.event_registrations;

-- Allow authenticated users to register for events
CREATE POLICY "Users can register for events"
    ON public.event_registrations FOR INSERT
    WITH CHECK (
        auth.role() = 'authenticated'
        AND NOT EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid()
            AND is_banned = true
        )
    );

-- Users can view their own registrations
CREATE POLICY "Users can view their own registrations"
    ON public.event_registrations FOR SELECT
    USING (
        auth.uid() = user_id
        OR EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid()
            AND is_admin = true
        )
    );

-- Users can cancel their own registrations
CREATE POLICY "Users can cancel their own registrations"
    ON public.event_registrations FOR UPDATE
    USING (
        auth.uid() = user_id
        AND status = 'pending'
    );

-- Admins can manage all registrations
CREATE POLICY "Admins can manage all registrations"
    ON public.event_registrations FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid()
            AND is_admin = true
        )
    ); 