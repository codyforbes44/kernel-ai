import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface AnalyzeRequest {
  url: string;
}

interface ProjectAnalysis {
  platform: string | null;
  platformConfidence: 'high' | 'medium' | 'low';
  framework: string | null;
  features: string[];
  techStack: string[];
  hasDatabase: boolean;
  hasAuth: boolean;
  hasAPI: boolean;
  pageType: string;
  description: string;
  suggestedProjectName: string;
}

// Platform detection patterns
const platformPatterns = [
  { pattern: /bolt\.new|bolt\.diy/i, platform: 'Bolt.new', confidence: 'high' as const },
  { pattern: /v0\.dev/i, platform: 'v0', confidence: 'high' as const },
  { pattern: /replit\.com|repl\.co/i, platform: 'Replit', confidence: 'high' as const },
  { pattern: /lovable\.dev|lovable\.app/i, platform: 'Lovable', confidence: 'high' as const },
  { pattern: /cursor\.sh|cursor\.so/i, platform: 'Cursor', confidence: 'high' as const },
  { pattern: /stackblitz\.com/i, platform: 'StackBlitz', confidence: 'high' as const },
  { pattern: /codesandbox\.io/i, platform: 'CodeSandbox', confidence: 'high' as const },
  { pattern: /vercel\.app/i, platform: 'Vercel', confidence: 'medium' as const },
  { pattern: /netlify\.app/i, platform: 'Netlify', confidence: 'medium' as const },
  { pattern: /github\.io/i, platform: 'GitHub Pages', confidence: 'medium' as const },
];

// Framework detection from HTML/content
const frameworkPatterns = [
  { pattern: /__next|next\.js|_next/i, framework: 'Next.js' },
  { pattern: /react|reactdom|__REACT/i, framework: 'React' },
  { pattern: /vue|__VUE/i, framework: 'Vue.js' },
  { pattern: /svelte|__SVELTE/i, framework: 'Svelte' },
  { pattern: /angular|ng-/i, framework: 'Angular' },
  { pattern: /vite|@vite/i, framework: 'Vite' },
  { pattern: /gatsby/i, framework: 'Gatsby' },
  { pattern: /remix/i, framework: 'Remix' },
  { pattern: /astro/i, framework: 'Astro' },
];

// Feature detection
const featurePatterns = [
  { pattern: /supabase/i, feature: 'Supabase Integration' },
  { pattern: /firebase/i, feature: 'Firebase Integration' },
  { pattern: /stripe|payment/i, feature: 'Payment Processing' },
  { pattern: /auth|login|signup|sign-in|sign-up/i, feature: 'Authentication' },
  { pattern: /dashboard/i, feature: 'Dashboard' },
  { pattern: /chart|graph|analytics/i, feature: 'Analytics/Charts' },
  { pattern: /form|input|submit/i, feature: 'Forms' },
  { pattern: /table|grid|list/i, feature: 'Data Tables' },
  { pattern: /modal|dialog/i, feature: 'Modals' },
  { pattern: /toast|notification/i, feature: 'Notifications' },
  { pattern: /dark-mode|theme/i, feature: 'Theme Support' },
  { pattern: /responsive|mobile/i, feature: 'Responsive Design' },
  { pattern: /api|fetch|axios/i, feature: 'API Integration' },
  { pattern: /upload|file/i, feature: 'File Upload' },
  { pattern: /search/i, feature: 'Search' },
  { pattern: /chat|message/i, feature: 'Chat/Messaging' },
  { pattern: /map|location/i, feature: 'Maps/Location' },
  { pattern: /calendar|date/i, feature: 'Calendar/Dates' },
];

// Tech stack detection
const techStackPatterns = [
  { pattern: /tailwind|tw-/i, tech: 'Tailwind CSS' },
  { pattern: /chakra/i, tech: 'Chakra UI' },
  { pattern: /material-ui|mui/i, tech: 'Material UI' },
  { pattern: /shadcn|radix/i, tech: 'shadcn/ui' },
  { pattern: /typescript|\.ts/i, tech: 'TypeScript' },
  { pattern: /graphql/i, tech: 'GraphQL' },
  { pattern: /redux/i, tech: 'Redux' },
  { pattern: /zustand/i, tech: 'Zustand' },
  { pattern: /tanstack|react-query/i, tech: 'TanStack Query' },
  { pattern: /framer-motion/i, tech: 'Framer Motion' },
  { pattern: /three\.js|three/i, tech: 'Three.js' },
  { pattern: /prisma/i, tech: 'Prisma' },
  { pattern: /drizzle/i, tech: 'Drizzle ORM' },
];

function detectPlatformFromUrl(url: string): { platform: string | null; confidence: 'high' | 'medium' | 'low' } {
  for (const { pattern, platform, confidence } of platformPatterns) {
    if (pattern.test(url)) {
      return { platform, confidence };
    }
  }
  return { platform: null, confidence: 'low' };
}

function detectFramework(content: string): string | null {
  for (const { pattern, framework } of frameworkPatterns) {
    if (pattern.test(content)) {
      return framework;
    }
  }
  return null;
}

function detectFeatures(content: string): string[] {
  const features: string[] = [];
  for (const { pattern, feature } of featurePatterns) {
    if (pattern.test(content) && !features.includes(feature)) {
      features.push(feature);
    }
  }
  return features;
}

function detectTechStack(content: string): string[] {
  const stack: string[] = [];
  for (const { pattern, tech } of techStackPatterns) {
    if (pattern.test(content) && !stack.includes(tech)) {
      stack.push(tech);
    }
  }
  return stack;
}

function generateProjectName(url: string, content: string): string {
  // Try to extract from title
  const titleMatch = content.match(/<title[^>]*>([^<]+)<\/title>/i);
  if (titleMatch) {
    const title = titleMatch[1].trim();
    // Clean up common suffixes
    const cleaned = title
      .replace(/\s*[-|–]\s*.*/g, '')
      .replace(/\s*\|.*/g, '')
      .trim();
    if (cleaned.length > 2 && cleaned.length < 50) {
      return cleaned;
    }
  }
  
  // Extract from URL
  try {
    const urlObj = new URL(url);
    const pathParts = urlObj.pathname.split('/').filter(Boolean);
    if (pathParts.length > 0) {
      const lastPart = pathParts[pathParts.length - 1];
      if (lastPart && lastPart.length > 2) {
        return lastPart.replace(/[-_]/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
      }
    }
    // Use subdomain or domain
    const hostParts = urlObj.hostname.split('.');
    if (hostParts.length > 2) {
      return hostParts[0].replace(/[-_]/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
    }
  } catch {
    // Ignore URL parsing errors
  }
  
  return 'Imported Project';
}

function detectPageType(content: string): string {
  if (/landing|hero|cta/i.test(content)) return 'Landing Page';
  if (/dashboard|admin|panel/i.test(content)) return 'Dashboard';
  if (/blog|article|post/i.test(content)) return 'Blog/Content';
  if (/shop|store|product|cart/i.test(content)) return 'E-commerce';
  if (/portfolio|gallery|showcase/i.test(content)) return 'Portfolio';
  if (/docs|documentation|guide/i.test(content)) return 'Documentation';
  if (/login|signup|auth/i.test(content)) return 'Auth Page';
  if (/form|contact|submit/i.test(content)) return 'Form/Contact';
  return 'Web Application';
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { url } = await req.json() as AnalyzeRequest;

    if (!url) {
      return new Response(
        JSON.stringify({ success: false, error: 'URL is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const apiKey = Deno.env.get('FIRECRAWL_API_KEY');
    if (!apiKey) {
      console.error('FIRECRAWL_API_KEY not configured');
      return new Response(
        JSON.stringify({ success: false, error: 'Firecrawl connector not configured. Please connect Firecrawl in Settings.' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Format URL
    let formattedUrl = url.trim();
    if (!formattedUrl.startsWith('http://') && !formattedUrl.startsWith('https://')) {
      formattedUrl = `https://${formattedUrl}`;
    }

    console.log('Analyzing competitor URL:', formattedUrl);

    // Detect platform from URL first
    const { platform: urlPlatform, confidence: urlConfidence } = detectPlatformFromUrl(formattedUrl);

    // Scrape the page with Firecrawl
    const response = await fetch('https://api.firecrawl.dev/v1/scrape', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url: formattedUrl,
        formats: ['html', 'markdown', 'links'],
        onlyMainContent: false, // Get full page for better detection
        waitFor: 2000, // Wait for JS to render
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Firecrawl API error:', errorData);
      
      // Return partial analysis from URL only
      if (urlPlatform) {
        const analysis: ProjectAnalysis = {
          platform: urlPlatform,
          platformConfidence: urlConfidence,
          framework: null,
          features: [],
          techStack: [],
          hasDatabase: false,
          hasAuth: false,
          hasAPI: false,
          pageType: 'Web Application',
          description: `Project from ${urlPlatform}`,
          suggestedProjectName: generateProjectName(formattedUrl, ''),
        };
        
        return new Response(
          JSON.stringify({ success: true, data: analysis, partial: true }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      return new Response(
        JSON.stringify({ success: false, error: errorData.error || 'Failed to scrape URL' }),
        { status: response.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const scrapeData = await response.json();
    const html = scrapeData.data?.html || scrapeData.html || '';
    const markdown = scrapeData.data?.markdown || scrapeData.markdown || '';
    const fullContent = `${html} ${markdown}`;

    // Perform analysis
    const framework = detectFramework(fullContent);
    const features = detectFeatures(fullContent);
    const techStack = detectTechStack(fullContent);
    const pageType = detectPageType(fullContent);

    // Check for specific capabilities
    const hasDatabase = /supabase|firebase|prisma|database|postgres|mysql|mongodb/i.test(fullContent);
    const hasAuth = /auth|login|signup|sign-in|sign-up|session|token/i.test(fullContent);
    const hasAPI = /api|fetch|axios|graphql|rest|endpoint/i.test(fullContent);

    // Generate description
    const descriptionParts: string[] = [];
    if (pageType !== 'Web Application') descriptionParts.push(pageType);
    if (framework) descriptionParts.push(`built with ${framework}`);
    if (techStack.length > 0) descriptionParts.push(`using ${techStack.slice(0, 3).join(', ')}`);
    if (features.length > 0) descriptionParts.push(`featuring ${features.slice(0, 3).join(', ')}`);

    const analysis: ProjectAnalysis = {
      platform: urlPlatform,
      platformConfidence: urlPlatform ? urlConfidence : 'low',
      framework,
      features: features.slice(0, 10), // Limit to top 10
      techStack: techStack.slice(0, 8), // Limit to top 8
      hasDatabase,
      hasAuth,
      hasAPI,
      pageType,
      description: descriptionParts.length > 0 
        ? descriptionParts.join(' ') 
        : 'Web application ready for migration',
      suggestedProjectName: generateProjectName(formattedUrl, fullContent),
    };

    console.log('Analysis complete:', analysis);

    return new Response(
      JSON.stringify({ success: true, data: analysis }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error analyzing URL:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to analyze URL';
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
