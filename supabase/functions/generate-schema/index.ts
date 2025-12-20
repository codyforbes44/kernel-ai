import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SchemaRequest {
  description: string;
  existingTables?: string[];
  includeRLS?: boolean;
  includeTriggers?: boolean;
}

interface GeneratedSchema {
  sql: string;
  tables: {
    name: string;
    columns: { name: string; type: string; nullable: boolean; default?: string }[];
    description: string;
  }[];
  rlsPolicies: { table: string; name: string; operation: string; description: string }[];
  triggers: { name: string; table: string; description: string }[];
  thinking: string;
}

// Input validation helpers
function sanitizeString(str: string, maxLength: number): string {
  return str.slice(0, maxLength).replace(/[<>]/g, "");
}

function isValidTableName(name: string): boolean {
  // Only allow alphanumeric, underscores, and must start with letter or underscore
  return /^[a-zA-Z_][a-zA-Z0-9_]*$/.test(name) && name.length <= 63;
}

function validateSchemaRequest(body: unknown): { valid: true; data: SchemaRequest } | { valid: false; error: string } {
  if (typeof body !== "object" || body === null) {
    return { valid: false, error: "Invalid request body" };
  }

  const { description, existingTables, includeRLS, includeTriggers } = body as Record<string, unknown>;

  // Validate description (required, max 5000 chars)
  if (typeof description !== "string") {
    return { valid: false, error: "description is required and must be a string" };
  }

  if (description.trim().length === 0) {
    return { valid: false, error: "description cannot be empty" };
  }

  if (description.length > 5000) {
    return { valid: false, error: "description must be 5000 characters or less" };
  }

  // Validate existingTables (optional, array of valid table names)
  if (existingTables !== undefined && existingTables !== null) {
    if (!Array.isArray(existingTables)) {
      return { valid: false, error: "existingTables must be an array" };
    }

    if (existingTables.length > 100) {
      return { valid: false, error: "existingTables cannot have more than 100 entries" };
    }

    for (const tableName of existingTables) {
      if (typeof tableName !== "string" || !isValidTableName(tableName)) {
        return { valid: false, error: `Invalid table name: ${tableName}` };
      }
    }
  }

  // Validate boolean fields
  if (includeRLS !== undefined && typeof includeRLS !== "boolean") {
    return { valid: false, error: "includeRLS must be a boolean" };
  }

  if (includeTriggers !== undefined && typeof includeTriggers !== "boolean") {
    return { valid: false, error: "includeTriggers must be a boolean" };
  }

  return {
    valid: true,
    data: {
      description: sanitizeString(description.trim(), 5000),
      existingTables: Array.isArray(existingTables) 
        ? existingTables.filter((t): t is string => typeof t === "string" && isValidTableName(t))
        : undefined,
      includeRLS: typeof includeRLS === "boolean" ? includeRLS : true,
      includeTriggers: typeof includeTriggers === "boolean" ? includeTriggers : true,
    },
  };
}

const SCHEMA_SYSTEM_PROMPT = `You are an expert PostgreSQL database architect specialized in Supabase. You generate production-ready SQL schemas from natural language descriptions.

IMPORTANT: Always respond with valid JSON containing the schema.

Response format:
{
  "thinking": "Your reasoning about the schema design, relationships, and security considerations",
  "sql": "-- Complete SQL migration\\nCREATE TABLE...",
  "tables": [
    {
      "name": "table_name",
      "description": "What this table stores",
      "columns": [
        { "name": "id", "type": "uuid", "nullable": false, "default": "gen_random_uuid()" }
      ]
    }
  ],
  "rlsPolicies": [
    { "table": "table_name", "name": "policy_name", "operation": "SELECT", "description": "What this policy does" }
  ],
  "triggers": [
    { "name": "trigger_name", "table": "table_name", "description": "What this trigger does" }
  ]
}

SCHEMA DESIGN RULES:
1. Always use UUID primary keys with gen_random_uuid() default
2. Include created_at and updated_at timestamps on most tables
3. Use appropriate PostgreSQL types (text, integer, bigint, boolean, jsonb, etc.)
4. Add foreign key constraints with ON DELETE actions
5. Create indexes for commonly queried columns
6. Use meaningful table and column names (snake_case)

ROW LEVEL SECURITY (RLS) RULES:
1. ALWAYS enable RLS on tables containing user data
2. Create policies for SELECT, INSERT, UPDATE, DELETE operations as needed
3. Use auth.uid() for user ownership checks
4. Consider organization/workspace-level access patterns
5. Use security definer functions to avoid recursive RLS issues

COMMON PATTERNS:
- User-owned data: WHERE user_id = auth.uid()
- Public read, owner write: SELECT policy with true, others with user_id check
- Soft delete: Add is_deleted boolean instead of hard delete
- Audit trails: Use triggers to log changes
- Full-text search: Add GIN indexes for text search

TRIGGER PATTERNS:
1. update_updated_at_column() - Auto-update updated_at timestamp
2. Audit logging triggers for sensitive data
3. Computed column updates

Generate COMPLETE, WORKING SQL that can be run directly in Supabase. Include:
- CREATE TABLE statements
- ALTER TABLE for RLS
- CREATE POLICY statements
- CREATE INDEX statements
- CREATE FUNCTION and CREATE TRIGGER as needed
- Comments explaining the schema

Respond ONLY with valid JSON. No markdown, no code blocks.`;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Validate input
    const rawBody = await req.json();
    const validation = validateSchemaRequest(rawBody);
    
    if (!validation.valid) {
      console.log("[generate-schema] Validation error:", validation.error);
      return new Response(
        JSON.stringify({ error: validation.error }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { description, existingTables = [], includeRLS, includeTriggers } = validation.data;

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    console.log(`[generate-schema] Generating schema for: ${description.slice(0, 100)}...`);

    // Build context about existing tables
    let existingContext = '';
    if (existingTables.length > 0) {
      existingContext = `\n\nEXISTING TABLES IN DATABASE:\n${existingTables.join(', ')}\n\nMake sure to create appropriate foreign key relationships to existing tables if relevant.`;
    }

    const userPrompt = `Generate a database schema for the following requirements:

${description}

Requirements:
- ${includeRLS ? 'Include Row Level Security (RLS) policies' : 'Skip RLS policies for now'}
- ${includeTriggers ? 'Include triggers for updated_at and any necessary automation' : 'Skip triggers'}
${existingContext}

Generate complete, production-ready SQL.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: SCHEMA_SYSTEM_PROMPT },
          { role: "user", content: userPrompt },
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("[generate-schema] AI gateway error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits exhausted. Please add more credits." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error("No content in AI response");
    }

    console.log(`[generate-schema] Raw AI response length: ${content.length}`);

    // Parse the JSON response
    let parsedSchema: GeneratedSchema;
    try {
      // Clean up potential markdown
      let jsonContent = content.trim();
      if (jsonContent.startsWith('```json')) {
        jsonContent = jsonContent.slice(7);
      } else if (jsonContent.startsWith('```')) {
        jsonContent = jsonContent.slice(3);
      }
      if (jsonContent.endsWith('```')) {
        jsonContent = jsonContent.slice(0, -3);
      }
      parsedSchema = JSON.parse(jsonContent.trim());
    } catch (parseError) {
      console.error("[generate-schema] Failed to parse AI response:", parseError);
      // Return raw SQL as fallback
      parsedSchema = {
        sql: content,
        tables: [],
        rlsPolicies: [],
        triggers: [],
        thinking: "Generated SQL schema (could not fully parse structured response)",
      };
    }

    console.log(`[generate-schema] Successfully generated schema with ${parsedSchema.tables.length} tables`);

    return new Response(
      JSON.stringify(parsedSchema),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("[generate-schema] Error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
