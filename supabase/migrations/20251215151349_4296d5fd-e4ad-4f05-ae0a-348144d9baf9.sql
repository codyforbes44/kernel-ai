-- Allow admins to view all profiles
CREATE POLICY "Admins can view all profiles"
ON public.profiles
FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

-- Allow admins to view all conversations
CREATE POLICY "Admins can view all conversations"
ON public.conversations
FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

-- Allow admins to view all messages
CREATE POLICY "Admins can view all messages"
ON public.messages
FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

-- Allow admins to view all workspaces
CREATE POLICY "Admins can view all workspaces"
ON public.workspaces
FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

-- Allow admins to view all projects
CREATE POLICY "Admins can view all projects"
ON public.projects
FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));