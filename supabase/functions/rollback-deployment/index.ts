import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface RollbackRequest {
  deploymentId: string;
}

function isValidUUID(str: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(str);
}

function validateRollbackRequest(body: unknown): { valid: true; data: RollbackRequest } | { valid: false; error: string } {
  if (typeof body !== "object" || body === null) {
    return { valid: false, error: "Invalid request body" };
  }

  const { deploymentId } = body as Record<string, unknown>;

  if (typeof deploymentId !== "string" || !isValidUUID(deploymentId)) {
    return { valid: false, error: "deploymentId must be a valid UUID" };
  }

  return { valid: true, data: { deploymentId } };
}

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
    ico: 'image/x-icon',
    woff: 'font/woff',
    woff2: 'font/woff2',
    ttf: 'font/ttf',
  };
  return mimeTypes[ext || ''] || 'application/octet-stream';
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

    const rawBody = await req.json();
    const validation = validateRollbackRequest(rawBody);
    
    if (!validation.valid) {
      console.log("[rollback] Validation error:", validation.error);
      return new Response(
        JSON.stringify({ error: validation.error }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { deploymentId } = validation.data;

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
    const supabaseUser = createClient(supabaseUrl, Deno.env.get('SUPABASE_ANON_KEY')!, {
      global: { headers: { Authorization: authHeader } }
    });

    const startTime = Date.now();
    console.log(`[rollback] Starting rollback to deployment ${deploymentId}`);

    // Get user
    const { data: { user }, error: userError } = await supabaseUser.auth.getUser();
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Fetch the target deployment to rollback to
    const { data: targetDeployment, error: targetError } = await supabaseUser
      .from('deployments')
      .select('*')
      .eq('id', deploymentId)
      .single();

    if (targetError || !targetDeployment) {
      console.error('[rollback] Target deployment not found:', targetError);
      return new Response(
        JSON.stringify({ error: 'Deployment not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (targetDeployment.status !== 'deployed') {
      return new Response(
        JSON.stringify({ error: 'Can only rollback to successfully deployed versions' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const projectId = targetDeployment.project_id;
    const environment = targetDeployment.environment;
    const sourceVersion = targetDeployment.version;

    console.log(`[rollback] Rolling back to v${sourceVersion} for project ${projectId}`);

    // Get next version number
    const { data: lastDeployment } = await supabaseUser
      .from('deployments')
      .select('version')
      .eq('project_id', projectId)
      .eq('environment', environment)
      .order('version', { ascending: false })
      .limit(1)
      .single();

    const newVersion = (lastDeployment?.version || 0) + 1;

    // Create new deployment record for the rollback
    const { data: newDeployment, error: deploymentError } = await supabaseUser
      .from('deployments')
      .insert({
        project_id: projectId,
        user_id: user.id,
        version: newVersion,
        status: 'building',
        environment,
        subdomain: targetDeployment.subdomain,
        commit_message: `Rollback to v${sourceVersion}`,
        file_count: targetDeployment.file_count,
        started_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (deploymentError) {
      console.error('[rollback] Failed to create deployment record:', deploymentError);
      throw deploymentError;
    }

    console.log(`[rollback] Created deployment ${newDeployment.id}, version ${newVersion}`);

    try {
      // List files from the source deployment
      const sourcePath = `${projectId}/${environment}/v${sourceVersion}`;
      const targetPath = `${projectId}/${environment}/v${newVersion}`;

      console.log(`[rollback] Copying files from ${sourcePath} to ${targetPath}`);

      const { data: sourceFiles, error: listError } = await supabaseAdmin.storage
        .from('deployments')
        .list(sourcePath);

      if (listError) {
        console.error('[rollback] Failed to list source files:', listError);
        throw new Error(`Failed to list source files: ${listError.message}`);
      }

      if (!sourceFiles || sourceFiles.length === 0) {
        throw new Error('No files found in source deployment');
      }

      let buildLog = `Rollback started at ${new Date().toISOString()}\n`;
      buildLog += `Rolling back to: v${sourceVersion}\n`;
      buildLog += `New version: ${newVersion}\n`;
      buildLog += `Environment: ${environment}\n`;
      buildLog += `Source files: ${sourceFiles.length}\n\n`;

      let totalSize = 0;
      let copiedCount = 0;

      // Copy each file from source to target
      for (const file of sourceFiles) {
        if (file.name === '.emptyFolderPlaceholder') continue;

        const sourceFilePath = `${sourcePath}/${file.name}`;
        const targetFilePath = `${targetPath}/${file.name}`;

        // Download the file
        const { data: fileData, error: downloadError } = await supabaseAdmin.storage
          .from('deployments')
          .download(sourceFilePath);

        if (downloadError) {
          buildLog += `Error downloading ${file.name}: ${downloadError.message}\n`;
          console.error(`[rollback] Download error for ${file.name}:`, downloadError);
          continue;
        }

        if (!fileData) {
          buildLog += `No data for ${file.name}\n`;
          continue;
        }

        const fileSize = fileData.size;
        totalSize += fileSize;

        // Upload to the new version path
        const { error: uploadError } = await supabaseAdmin.storage
          .from('deployments')
          .upload(targetFilePath, fileData, {
            contentType: getMimeType(file.name),
            upsert: true,
          });

        if (uploadError) {
          buildLog += `Error uploading ${file.name}: ${uploadError.message}\n`;
          console.error(`[rollback] Upload error for ${file.name}:`, uploadError);
        } else {
          buildLog += `Copied: ${file.name} (${fileSize} bytes)\n`;
          copiedCount++;
        }
      }

      // Get public URL for the new deployment
      const { data: publicUrl } = supabaseAdmin.storage
        .from('deployments')
        .getPublicUrl(`${targetPath}/index.html`);

      const buildDuration = Date.now() - startTime;
      buildLog += `\nRollback completed in ${buildDuration}ms\n`;
      buildLog += `Files copied: ${copiedCount}/${sourceFiles.length}\n`;
      buildLog += `Total size: ${totalSize} bytes\n`;
      buildLog += `Deploy URL: ${publicUrl.publicUrl}\n`;

      // Update deployment record
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
        .eq('id', newDeployment.id);

      if (updateError) {
        console.error('[rollback] Failed to update deployment:', updateError);
      }

      console.log(`[rollback] Rollback completed in ${buildDuration}ms`);

      return new Response(
        JSON.stringify({
          success: true,
          deployment: {
            id: newDeployment.id,
            version: newVersion,
            environment,
            status: 'deployed',
            deploy_url: publicUrl.publicUrl,
            subdomain: newDeployment.subdomain,
            build_duration_ms: buildDuration,
            bundle_size_bytes: totalSize,
            rolled_back_from: sourceVersion,
          },
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } catch (buildError) {
      console.error('[rollback] Build error:', buildError);

      await supabaseUser
        .from('deployments')
        .update({
          status: 'failed',
          build_log: `Rollback failed: ${buildError instanceof Error ? buildError.message : 'Unknown error'}`,
          completed_at: new Date().toISOString(),
        })
        .eq('id', newDeployment.id);

      throw buildError;
    }
  } catch (error) {
    console.error('[rollback] Error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Rollback failed' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
