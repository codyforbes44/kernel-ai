import { supabase } from '@/integrations/supabase/client';

// Generate a random 8-character share code
function generateShareCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Excluding similar chars (0,O,1,I)
  let code = '';
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

export interface SharedTemplate {
  id: string;
  share_code: string;
  template_name: string;
  template_description: string | null;
  template_content: string;
  template_category: string;
  template_variables: string[];
  shared_by_user_id: string;
  created_at: string;
  expires_at: string | null;
}

export const templateSharingService = {
  // Share a template and get a share code
  async shareTemplate(
    userId: string,
    template: {
      name: string;
      description: string | null;
      content: string;
      category: string;
      variables: string[];
    }
  ): Promise<{ shareCode: string; error: Error | null }> {
    const shareCode = generateShareCode();

    const { error } = await supabase
      .from('shared_templates')
      .insert({
        share_code: shareCode,
        template_name: template.name,
        template_description: template.description,
        template_content: template.content,
        template_category: template.category,
        template_variables: template.variables,
        shared_by_user_id: userId,
      });

    if (error) {
      console.error('Error sharing template:', error);
      return { shareCode: '', error: new Error(error.message) };
    }

    return { shareCode, error: null };
  },

  // Get a shared template by code
  async getByShareCode(shareCode: string): Promise<{ template: SharedTemplate | null; error: Error | null }> {
    const { data, error } = await supabase
      .from('shared_templates')
      .select('*')
      .eq('share_code', shareCode.toUpperCase())
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return { template: null, error: new Error('Template not found') };
      }
      console.error('Error fetching shared template:', error);
      return { template: null, error: new Error(error.message) };
    }

    // Check if expired
    if (data.expires_at && new Date(data.expires_at) < new Date()) {
      return { template: null, error: new Error('This share link has expired') };
    }

    return { template: data as SharedTemplate, error: null };
  },

  // Delete a shared template
  async deleteShare(shareCode: string): Promise<{ error: Error | null }> {
    const { error } = await supabase
      .from('shared_templates')
      .delete()
      .eq('share_code', shareCode);

    if (error) {
      console.error('Error deleting share:', error);
      return { error: new Error(error.message) };
    }

    return { error: null };
  },

  // Get all shares by user
  async getUserShares(userId: string): Promise<{ shares: SharedTemplate[]; error: Error | null }> {
    const { data, error } = await supabase
      .from('shared_templates')
      .select('*')
      .eq('shared_by_user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching user shares:', error);
      return { shares: [], error: new Error(error.message) };
    }

    return { shares: (data || []) as SharedTemplate[], error: null };
  },
};
