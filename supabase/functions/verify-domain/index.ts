import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface VerifyDomainRequest {
  domainId: string;
}

function isValidUUID(str: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(str);
}

// Query DNS TXT records using DNS-over-HTTPS (Cloudflare)
async function queryDnsTxt(domain: string): Promise<string[]> {
  const txtRecords: string[] = [];
  
  try {
    // Use Cloudflare's DNS-over-HTTPS API
    const response = await fetch(
      `https://cloudflare-dns.com/dns-query?name=_lovable.${domain}&type=TXT`,
      {
        headers: {
          'Accept': 'application/dns-json',
        },
      }
    );

    if (!response.ok) {
      console.log(`[verify-domain] DNS query failed with status ${response.status}`);
      return txtRecords;
    }

    const data = await response.json();
    console.log(`[verify-domain] DNS response for _lovable.${domain}:`, JSON.stringify(data));

    if (data.Answer && Array.isArray(data.Answer)) {
      for (const record of data.Answer) {
        if (record.type === 16) { // TXT record type
          // TXT data is usually quoted, remove quotes
          const txtData = record.data?.replace(/^"|"$/g, '') || '';
          txtRecords.push(txtData);
        }
      }
    }
  } catch (error) {
    console.error(`[verify-domain] DNS query error:`, error);
  }

  return txtRecords;
}

// Check A record points to Lovable's IP
async function checkARecord(domain: string): Promise<boolean> {
  try {
    const response = await fetch(
      `https://cloudflare-dns.com/dns-query?name=${domain}&type=A`,
      {
        headers: {
          'Accept': 'application/dns-json',
        },
      }
    );

    if (!response.ok) {
      return false;
    }

    const data = await response.json();
    console.log(`[verify-domain] A record response for ${domain}:`, JSON.stringify(data));

    if (data.Answer && Array.isArray(data.Answer)) {
      for (const record of data.Answer) {
        if (record.type === 1 && record.data === '185.158.133.1') {
          return true;
        }
      }
    }
  } catch (error) {
    console.error(`[verify-domain] A record check error:`, error);
  }

  return false;
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

    const body = await req.json();
    const { domainId } = body as VerifyDomainRequest;

    if (!domainId || !isValidUUID(domainId)) {
      return new Response(
        JSON.stringify({ error: 'domainId must be a valid UUID' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
    const supabaseUser = createClient(supabaseUrl, Deno.env.get('SUPABASE_ANON_KEY')!, {
      global: { headers: { Authorization: authHeader } }
    });

    // Get user
    const { data: { user }, error: userError } = await supabaseUser.auth.getUser();
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Fetch the domain
    const { data: domain, error: domainError } = await supabaseUser
      .from('custom_domains')
      .select('*')
      .eq('id', domainId)
      .single();

    if (domainError || !domain) {
      console.error('[verify-domain] Domain not found:', domainError);
      return new Response(
        JSON.stringify({ error: 'Domain not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`[verify-domain] Verifying domain: ${domain.domain}`);
    console.log(`[verify-domain] Expected token: lovable_verify=${domain.verification_token}`);

    // Update status to verifying
    await supabaseAdmin
      .from('custom_domains')
      .update({ status: 'verifying' })
      .eq('id', domainId);

    // Check TXT record for verification token
    const txtRecords = await queryDnsTxt(domain.domain);
    console.log(`[verify-domain] Found TXT records:`, txtRecords);

    const expectedToken = `lovable_verify=${domain.verification_token}`;
    const txtVerified = txtRecords.some(record => 
      record.includes(domain.verification_token) || record.includes(expectedToken)
    );

    // Check A record points to Lovable's IP
    const aRecordValid = await checkARecord(domain.domain);
    console.log(`[verify-domain] A record valid: ${aRecordValid}`);

    // Determine final status
    let newStatus: string;
    let isVerified = false;
    let sslStatus = domain.ssl_status;

    if (txtVerified && aRecordValid) {
      newStatus = 'active';
      isVerified = true;
      sslStatus = 'active'; // Assuming SSL is provisioned when DNS is correct
      console.log(`[verify-domain] Domain ${domain.domain} verified successfully!`);
    } else if (txtVerified && !aRecordValid) {
      newStatus = 'pending';
      console.log(`[verify-domain] TXT verified but A record not pointing to Lovable`);
    } else {
      newStatus = 'pending';
      console.log(`[verify-domain] Verification failed - TXT: ${txtVerified}, A: ${aRecordValid}`);
    }

    // Update domain record
    const { error: updateError } = await supabaseAdmin
      .from('custom_domains')
      .update({
        status: newStatus,
        is_verified: isVerified,
        ssl_status: sslStatus,
        verified_at: isVerified ? new Date().toISOString() : null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', domainId);

    if (updateError) {
      console.error('[verify-domain] Failed to update domain:', updateError);
    }

    return new Response(
      JSON.stringify({
        success: true,
        domain: domain.domain,
        status: newStatus,
        verified: isVerified,
        checks: {
          txt_record: txtVerified,
          a_record: aRecordValid,
          txt_records_found: txtRecords,
          expected_token: expectedToken,
        },
        instructions: !isVerified ? {
          txt: {
            type: 'TXT',
            name: '_lovable',
            value: expectedToken,
          },
          a: {
            type: 'A',
            name: '@',
            value: '185.158.133.1',
          },
        } : null,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('[verify-domain] Error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Verification failed' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
