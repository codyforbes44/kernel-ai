import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface DeployRequest {
  projectId: string;
  environment: 'preview' | 'production';
  commitMessage?: string;
}

interface ProjectFile {
  path: string;
  content: string | null;
  type: 'file' | 'folder';
}

// Input validation helpers
function isValidUUID(str: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(str);
}

function sanitizeString(str: string, maxLength: number): string {
  return str.slice(0, maxLength).replace(/[<>]/g, "");
}

function validateDeployRequest(body: unknown): { valid: true; data: DeployRequest } | { valid: false; error: string } {
  if (typeof body !== "object" || body === null) {
    return { valid: false, error: "Invalid request body" };
  }

  const { projectId, environment, commitMessage } = body as Record<string, unknown>;

  // Validate projectId (required, must be UUID)
  if (typeof projectId !== "string" || !isValidUUID(projectId)) {
    return { valid: false, error: "projectId must be a valid UUID" };
  }

  // Validate environment (required, must be 'preview' or 'production')
  if (environment !== "preview" && environment !== "production") {
    return { valid: false, error: "environment must be 'preview' or 'production'" };
  }

  // Validate commitMessage (optional, max 500 chars)
  if (commitMessage !== undefined && commitMessage !== null) {
    if (typeof commitMessage !== "string") {
      return { valid: false, error: "commitMessage must be a string" };
    }
    if (commitMessage.length > 500) {
      return { valid: false, error: "commitMessage must be 500 characters or less" };
    }
  }

  return {
    valid: true,
    data: {
      projectId,
      environment,
      commitMessage: typeof commitMessage === "string" ? sanitizeString(commitMessage, 500) : undefined,
    },
  };
}

// Generate an optimized HTML bundle
function generateBundle(files: ProjectFile[], projectName: string): string {
  // Find key files
  const appFile = files.find(f => f.path.includes('App.tsx') || f.path.includes('App.jsx'));
  const cssFiles = files.filter(f => f.path.endsWith('.css'));

  // Combine CSS
  const combinedCSS = cssFiles
    .filter(f => f.content)
    .map(f => f.content)
    .join('\n');

  // Extract the main component content (simplified for demo)
  const appContent = appFile?.content || '';
  
  // Escape the project name for safe HTML insertion
  const safeProjectName = projectName.replace(/[<>&"']/g, (c) => ({
    '<': '&lt;',
    '>': '&gt;',
    '&': '&amp;',
    '"': '&quot;',
    "'": '&#39;',
  }[c] || c));
  
  // Simple JSX to HTML conversion for preview
  const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${safeProjectName}</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <script src="https://unpkg.com/react@18/umd/react.production.min.js" crossorigin></script>
  <script src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js" crossorigin></script>
  <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
  <style>
${combinedCSS}
  </style>
</head>
<body>
  <div id="root"></div>
  <script type="text/babel" data-presets="react,typescript">
${appContent}

// Mount the app
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
  </script>
</body>
</html>`;

  return htmlContent;
}

// Generate a static preview with inline React
function generateStaticPreview(files: ProjectFile[], projectName: string): Map<string, string> {
  const outputFiles = new Map<string, string>();
  
  // Escape the project name for safe HTML insertion
  const safeProjectName = projectName.replace(/[<>&"']/g, (c) => ({
    '<': '&lt;',
    '>': '&gt;',
    '&': '&amp;',
    '"': '&quot;',
    "'": '&#39;',
  }[c] || c));
  
  // Find all component files
  const componentFiles = files.filter(f => 
    f.type === 'file' && 
    f.content && 
    (f.path.endsWith('.tsx') || f.path.endsWith('.jsx') || f.path.endsWith('.ts') || f.path.endsWith('.js'))
  );
  
  // Find CSS files
  const cssFiles = files.filter(f => f.type === 'file' && f.content && f.path.endsWith('.css'));
  
  // Combine all CSS
  const combinedCSS = cssFiles.map(f => f.content).join('\n\n');
  
  // Build component code - strip imports and exports for inline use
  let componentCode = '';
  for (const file of componentFiles) {
    if (!file.content) continue;
    
    let code = file.content;
    
    // Remove import statements (they'll be loaded via CDN)
    code = code.replace(/^import\s+.*?['"];?\s*$/gm, '');
    
    // Convert export default to const assignment
    code = code.replace(/export\s+default\s+function\s+(\w+)/g, 'function $1');
    code = code.replace(/export\s+default\s+/g, '');
    code = code.replace(/export\s+/g, '');
    
    componentCode += `\n// ${file.path}\n${code}\n`;
  }

  // Generate the main HTML file
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${safeProjectName}</title>
  <meta name="description" content="Built with the AI-powered builder">
  
  <!-- React & Babel for runtime compilation -->
  <script src="https://unpkg.com/react@18/umd/react.production.min.js" crossorigin></script>
  <script src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js" crossorigin></script>
  <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
  
  <!-- Tailwind CSS -->
  <script src="https://cdn.tailwindcss.com"></script>
  
  <!-- Lucide Icons -->
  <script src="https://unpkg.com/lucide@latest/dist/umd/lucide.min.js"></script>
  
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: system-ui, -apple-system, sans-serif; }
${combinedCSS}
  </style>
</head>
<body>
  <div id="root"></div>
  
  <script type="text/babel" data-presets="react,typescript">
    const { useState, useEffect, useCallback, useMemo, useRef } = React;
    
${componentCode}

    // Mount the application
    const container = document.getElementById('root');
    const root = ReactDOM.createRoot(container);
    
    // Try to render App component
    try {
      if (typeof App !== 'undefined') {
        root.render(React.createElement(App));
      } else {
        root.render(
          React.createElement('div', { 
            style: { 
              padding: '40px', 
              textAlign: 'center',
              fontFamily: 'system-ui' 
            } 
          }, 
            React.createElement('h1', null, '${safeProjectName}'),
            React.createElement('p', { style: { color: '#666', marginTop: '10px' } }, 'No App component found')
          )
        );
      }
    } catch (error) {
      console.error('Render error:', error);
      root.render(
        React.createElement('div', { 
          style: { 
            padding: '40px', 
            textAlign: 'center',
            color: '#dc2626'
          } 
        }, 
          React.createElement('h1', null, 'Build Error'),
          React.createElement('pre', { 
            style: { 
              marginTop: '20px', 
              padding: '20px', 
              background: '#fef2f2',
              borderRadius: '8px',
              textAlign: 'left',
              overflow: 'auto'
            } 
          }, error.message)
        )
      );
    }
  </script>
</body>
</html>`;

  outputFiles.set('index.html', html);
  
  // Copy static assets
  const assetFiles = files.filter(f => 
    f.type === 'file' && 
    f.content &&
    (f.path.endsWith('.png') || f.path.endsWith('.jpg') || f.path.endsWith('.svg') || f.path.endsWith('.ico'))
  );
  
  for (const asset of assetFiles) {
    if (asset.content) {
      outputFiles.set(asset.path.replace('/src/', '/').replace('/public/', '/'), asset.content);
    }
  }
  
  return outputFiles;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate input
    const rawBody = await req.json();
    const validation = validateDeployRequest(rawBody);
    
    if (!validation.valid) {
      console.log("[deploy] Validation error:", validation.error);
      return new Response(
        JSON.stringify({ error: validation.error }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { projectId, environment, commitMessage } = validation.data;

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    // Create admin client for storage operations
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
    
    // Create user client for RLS operations
    const supabaseUser = createClient(supabaseUrl, Deno.env.get('SUPABASE_ANON_KEY')!, {
      global: { headers: { Authorization: authHeader } }
    });

    const startTime = Date.now();
    console.log(`[deploy] Starting ${environment} deployment for project ${projectId}`);

    // Get user from auth header
    const { data: { user }, error: userError } = await supabaseUser.auth.getUser();
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Fetch project
    const { data: project, error: projectError } = await supabaseUser
      .from('builder_projects')
      .select('*')
      .eq('id', projectId)
      .single();

    if (projectError || !project) {
      return new Response(
        JSON.stringify({ error: 'Project not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Fetch project files
    const { data: files, error: filesError } = await supabaseUser
      .from('project_files')
      .select('*')
      .eq('project_id', projectId);

    if (filesError) {
      throw filesError;
    }

    // Get next version number
    const { data: lastDeployment } = await supabaseUser
      .from('deployments')
      .select('version')
      .eq('project_id', projectId)
      .eq('environment', environment)
      .order('version', { ascending: false })
      .limit(1)
      .single();

    const version = (lastDeployment?.version || 0) + 1;

    // Generate subdomain
    const { data: subdomain } = await supabaseAdmin.rpc('generate_subdomain', {
      project_name: project.name,
      project_id: projectId
    });

    // Create deployment record
    const { data: deployment, error: deploymentError } = await supabaseUser
      .from('deployments')
      .insert({
        project_id: projectId,
        user_id: user.id,
        version,
        status: 'building',
        environment,
        subdomain: subdomain || `project-${projectId.slice(0, 8)}`,
        commit_message: commitMessage,
        file_count: files?.length || 0,
        started_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (deploymentError) {
      throw deploymentError;
    }

    console.log(`[deploy] Created deployment ${deployment.id}, version ${version}`);

    try {
      // Helper to stream build log updates
      let buildLog = '';
      const appendLog = async (message: string) => {
        buildLog += message + '\n';
        console.log(`[deploy] ${message}`);
        // Stream update to database for realtime subscribers
        await supabaseAdmin
          .from('deployments')
          .update({ build_log: buildLog })
          .eq('id', deployment.id);
      };

      await appendLog(`[${new Date().toISOString()}] Build started`);
      await appendLog(`Project: ${project.name}`);
      await appendLog(`Environment: ${environment}`);
      await appendLog(`Version: ${version}`);
      await appendLog(`Files to process: ${files?.length || 0}`);
      await appendLog('');

      // Generate the bundle
      await appendLog('Generating static bundle...');
      const outputFiles = generateStaticPreview(
        files as ProjectFile[],
        project.name
      );
      await appendLog(`Generated ${outputFiles.size} output files`);

      // Upload files to storage
      const deployPath = `${projectId}/${environment}/v${version}`;
      let totalSize = 0;
      let uploadedCount = 0;

      await appendLog('');
      await appendLog('Uploading to storage...');

      for (const [filename, content] of outputFiles) {
        const filePath = `${deployPath}/${filename}`;
        const blob = new Blob([content], { type: getMimeType(filename) });
        totalSize += blob.size;

        const { error: uploadError } = await supabaseAdmin.storage
          .from('deployments')
          .upload(filePath, blob, {
            contentType: getMimeType(filename),
            upsert: true,
          });

        if (uploadError) {
          await appendLog(`✗ Error uploading ${filename}: ${uploadError.message}`);
          console.error(`[deploy] Upload error for ${filename}:`, uploadError);
        } else {
          uploadedCount++;
          await appendLog(`✓ Uploaded: ${filename} (${blob.size} bytes)`);
        }
      }

      // Get public URL for the deployment
      await appendLog('');
      await appendLog('Finalizing deployment...');
      
      const { data: publicUrl } = supabaseAdmin.storage
        .from('deployments')
        .getPublicUrl(`${deployPath}/index.html`);

      const buildDuration = Date.now() - startTime;
      await appendLog('');
      await appendLog('═══════════════════════════════════════');
      await appendLog(`Build completed in ${buildDuration}ms`);
      await appendLog(`Files uploaded: ${uploadedCount}/${outputFiles.size}`);
      await appendLog(`Total bundle size: ${formatBytes(totalSize)}`);
      await appendLog(`Deploy URL: ${publicUrl.publicUrl}`);
      await appendLog('═══════════════════════════════════════');

      // Update deployment record with final status
      const { error: updateError } = await supabaseUser
        .from('deployments')
        .update({
          status: 'deployed',
          deploy_url: publicUrl.publicUrl,
          build_log: buildLog,
          build_duration_ms: buildDuration,
          bundle_size_bytes: totalSize,
          completed_at: new Date().toISOString(),
        })
        .eq('id', deployment.id);

      if (updateError) {
        console.error('[deploy] Failed to update deployment:', updateError);
      }

      console.log(`[deploy] Deployment ${deployment.id} completed in ${buildDuration}ms`);

      return new Response(
        JSON.stringify({
          success: true,
          deployment: {
            id: deployment.id,
            version,
            environment,
            status: 'deployed',
            deploy_url: publicUrl.publicUrl,
            subdomain: deployment.subdomain,
            build_duration_ms: buildDuration,
            bundle_size_bytes: totalSize,
          },
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } catch (buildError) {
      console.error('[deploy] Build error:', buildError);

      // Update deployment as failed
      await supabaseUser
        .from('deployments')
        .update({
          status: 'failed',
          build_log: `Build failed: ${buildError instanceof Error ? buildError.message : 'Unknown error'}`,
          completed_at: new Date().toISOString(),
        })
        .eq('id', deployment.id);

      throw buildError;
    }
  } catch (error) {
    console.error('[deploy] Error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Deployment failed' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

function getMimeType(filename: string): string {
  const ext = filename.split('.').pop()?.toLowerCase();
  const mimeTypes: Record<string, string> = {
    html: 'text/html',
    css: 'text/css',
    js: 'application/javascript',
    json: 'application/json',
    png: 'image/png',
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    gif: 'image/gif',
    svg: 'image/svg+xml',
    webp: 'image/webp',
    woff: 'font/woff',
    woff2: 'font/woff2',
    ico: 'image/x-icon',
  };
  return mimeTypes[ext || ''] || 'application/octet-stream';
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
