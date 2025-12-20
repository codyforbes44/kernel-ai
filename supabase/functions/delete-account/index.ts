import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    console.log('Delete account request received')
    
    // Get authorization header
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      console.error('No authorization header')
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Create Supabase client with user's token
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!

    // Client for getting user from token
    const supabaseUser = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } }
    })

    // Admin client for deletion operations
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)

    // Get the user
    const { data: { user }, error: userError } = await supabaseUser.auth.getUser()
    
    if (userError || !user) {
      console.error('Failed to get user:', userError)
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const userId = user.id
    console.log('Deleting account for user:', userId)

    // Delete all user data in order (respecting foreign key constraints)
    const deletionOrder = [
      // Builder-related
      { table: 'file_versions', query: async () => {
        // Get file IDs first
        const { data: files } = await supabaseAdmin
          .from('project_files')
          .select('id')
          .in('project_id', 
            (await supabaseAdmin.from('builder_projects').select('id').eq('user_id', userId)).data?.map(p => p.id) || []
          )
        if (files?.length) {
          await supabaseAdmin.from('file_versions').delete().in('file_id', files.map(f => f.id))
        }
      }},
      { table: 'github_commits', query: async () => {
        const { data: repos } = await supabaseAdmin
          .from('project_repos')
          .select('id')
          .in('project_id',
            (await supabaseAdmin.from('builder_projects').select('id').eq('user_id', userId)).data?.map(p => p.id) || []
          )
        if (repos?.length) {
          await supabaseAdmin.from('github_commits').delete().in('project_repo_id', repos.map(r => r.id))
        }
      }},
      { table: 'project_repos', column: 'project_id', subquery: true },
      { table: 'project_analysis', column: 'project_id', subquery: true },
      { table: 'project_files', column: 'project_id', subquery: true },
      { table: 'error_logs', column: 'project_id', subquery: true },
      { table: 'builder_messages', query: async () => {
        const { data: convos } = await supabaseAdmin
          .from('builder_conversations')
          .select('id')
          .eq('user_id', userId)
        if (convos?.length) {
          await supabaseAdmin.from('builder_messages').delete().in('conversation_id', convos.map(c => c.id))
        }
      }},
      { table: 'builder_conversations', column: 'user_id' },
      { table: 'deployments', column: 'user_id' },
      { table: 'custom_domains', column: 'user_id' },
      { table: 'design_systems', column: 'user_id' },
      { table: 'component_installations', column: 'user_id' },
      { table: 'component_likes', column: 'user_id' },
      { table: 'builder_projects', column: 'user_id' },
      { table: 'github_connections', column: 'user_id' },
      
      // Chat-related
      { table: 'messages', column: 'user_id' },
      { table: 'conversations', column: 'user_id' },
      
      // Other
      { table: 'prompt_templates', column: 'user_id' },
      { table: 'shared_templates', column: 'shared_by_user_id' },
      { table: 'usage_analytics', column: 'user_id' },
      { table: 'login_alerts', column: 'user_id' },
      { table: 'user_login_locations', column: 'user_id' },
      { table: 'user_roles', column: 'user_id' },
      { table: 'projects', column: 'user_id' },
      { table: 'workspaces', column: 'user_id' },
      { table: 'profiles', column: 'id' },
    ]

    for (const item of deletionOrder) {
      try {
        if (item.query) {
          await item.query()
          console.log(`Deleted from ${item.table} using custom query`)
        } else if (item.subquery) {
          // Delete where project_id is in user's projects
          const { data: projects } = await supabaseAdmin
            .from('builder_projects')
            .select('id')
            .eq('user_id', userId)
          
          if (projects?.length) {
            await supabaseAdmin
              .from(item.table)
              .delete()
              .in(item.column!, projects.map(p => p.id))
          }
          console.log(`Deleted from ${item.table} via project subquery`)
        } else {
          const { error } = await supabaseAdmin
            .from(item.table)
            .delete()
            .eq(item.column!, userId)
          
          if (error) {
            console.error(`Error deleting from ${item.table}:`, error.message)
          } else {
            console.log(`Deleted from ${item.table}`)
          }
        }
      } catch (err) {
        console.error(`Error deleting from ${item.table}:`, err)
        // Continue with other deletions
      }
    }

    // Delete storage objects
    try {
      const { data: buckets } = await supabaseAdmin.storage.listBuckets()
      for (const bucket of buckets || []) {
        const { data: files } = await supabaseAdmin.storage
          .from(bucket.name)
          .list(userId)
        
        if (files?.length) {
          const filePaths = files.map(f => `${userId}/${f.name}`)
          await supabaseAdmin.storage.from(bucket.name).remove(filePaths)
          console.log(`Deleted ${files.length} files from bucket ${bucket.name}`)
        }
      }
    } catch (err) {
      console.error('Error deleting storage files:', err)
    }

    // Delete the auth user
    const { error: deleteUserError } = await supabaseAdmin.auth.admin.deleteUser(userId)
    
    if (deleteUserError) {
      console.error('Error deleting auth user:', deleteUserError)
      return new Response(
        JSON.stringify({ error: 'Failed to delete user account' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log('Account deleted successfully')

    return new Response(
      JSON.stringify({ success: true, message: 'Account deleted successfully' }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Unexpected error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
