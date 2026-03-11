import { PublicLayout } from '@/components/layout/PublicLayout';
import { SEOHead } from '@/components/seo/SEOHead';
import { SEO_CONFIG } from '@/lib/seo';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CalendarDays, Clock, ArrowRight, User } from 'lucide-react';

const BLOG_POSTS = [
  {
    slug: 'introducing-kernel-ai-development-os',
    title: 'Introducing Kernel: The AI Development OS',
    excerpt: 'We built Kernel to be the operating system for modern development — one platform that powers AI, databases, UI, APIs, auth, and deployment.',
    author: { name: 'Kernel Team', avatar: '' },
    date: '2026-03-01',
    readTime: '5 min read',
    category: 'Announcements',
    featured: true,
  },
  {
    slug: 'how-ai-is-changing-web-development',
    title: 'How AI is Changing Web Development in 2026',
    excerpt: 'From code generation to intelligent debugging, AI is fundamentally reshaping how developers build applications. Here\'s what\'s different now.',
    author: { name: 'Kernel Team', avatar: '' },
    date: '2026-02-20',
    readTime: '7 min read',
    category: 'Industry',
    featured: false,
  },
  {
    slug: 'building-saas-in-minutes-not-months',
    title: 'Building a SaaS in Minutes, Not Months',
    excerpt: 'A step-by-step walkthrough of building a complete SaaS application with authentication, billing, and dashboards using Kernel.',
    author: { name: 'Kernel Team', avatar: '' },
    date: '2026-02-10',
    readTime: '10 min read',
    category: 'Tutorials',
    featured: false,
  },
  {
    slug: 'security-first-ai-development',
    title: 'Security-First AI Development: Our Approach',
    excerpt: 'How Kernel ensures your AI-generated code meets enterprise security standards — from row-level security to SOC 2 compliance.',
    author: { name: 'Kernel Team', avatar: '' },
    date: '2026-01-28',
    readTime: '6 min read',
    category: 'Security',
    featured: false,
  },
];

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}

export default function Blog() {
  const siteUrl = SEO_CONFIG.siteUrl;
  const featured = BLOG_POSTS.find(p => p.featured);
  const rest = BLOG_POSTS.filter(p => !p.featured);

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Blog",
    "name": "Kernel Blog",
    "description": "Insights, tutorials, and updates from the Kernel team on AI-powered development.",
    "url": `${siteUrl}/blog`,
    "publisher": {
      "@type": "Organization",
      "name": "Kernel",
      "url": siteUrl,
      "logo": `${siteUrl}/pwa-512x512.png`,
    },
    "blogPost": BLOG_POSTS.map(post => ({
      "@type": "BlogPosting",
      "headline": post.title,
      "description": post.excerpt,
      "datePublished": post.date,
      "author": { "@type": "Person", "name": post.author.name },
      "url": `${siteUrl}/blog/${post.slug}`,
    })),
  };

  return (
    <PublicLayout>
      <SEOHead
        title="Blog - Insights & Updates"
        description="Insights, tutorials, and updates from the Kernel team on AI-powered development, industry trends, and building modern web applications."
        canonical="/blog"
        ogType="website"
        keywords={['blog', 'AI development', 'web development', 'tutorials', 'kernel']}
        structuredData={articleSchema}
        breadcrumbs={[
          { name: 'Home', url: siteUrl },
          { name: 'Blog', url: `${siteUrl}/blog` },
        ]}
      />

      <article className="container max-w-5xl py-12 sm:py-16 lg:py-20 px-4">
        <header className="text-center mb-12">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight mb-4">
            Blog
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Insights, tutorials, and updates from the Kernel team on AI-powered development.
          </p>
        </header>

        {/* Featured Post */}
        {featured && (
          <section aria-label="Featured article" className="mb-12">
            <Card className="overflow-hidden border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
              <CardContent className="p-6 sm:p-8 lg:p-10">
                <Badge variant="secondary" className="mb-4">{featured.category}</Badge>
                <h2 className="text-2xl sm:text-3xl font-bold mb-3">
                  {featured.title}
                </h2>
                <p className="text-muted-foreground text-base sm:text-lg mb-4 max-w-2xl">
                  {featured.excerpt}
                </p>
                <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-6">
                  <span className="flex items-center gap-1.5">
                    <User className="h-4 w-4" aria-hidden="true" />
                    {featured.author.name}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <CalendarDays className="h-4 w-4" aria-hidden="true" />
                    <time dateTime={featured.date}>{formatDate(featured.date)}</time>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Clock className="h-4 w-4" aria-hidden="true" />
                    {featured.readTime}
                  </span>
                </div>
                <span className="inline-flex items-center gap-1 text-primary font-medium text-sm">
                  Read article <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </span>
              </CardContent>
            </Card>
          </section>
        )}

        {/* Post Grid */}
        <section aria-label="All articles">
          <h2 className="text-xl font-semibold mb-6">Latest Articles</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {rest.map(post => (
              <Card key={post.slug} className="group hover:border-primary/30 transition-colors">
                <CardContent className="p-5 space-y-3">
                  <Badge variant="outline" className="text-xs">{post.category}</Badge>
                  <h3 className="font-semibold text-base leading-snug group-hover:text-primary transition-colors">
                    {post.title}
                  </h3>
                  <p className="text-sm text-muted-foreground line-clamp-2">{post.excerpt}</p>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground pt-2">
                    <time dateTime={post.date}>{formatDate(post.date)}</time>
                    <span>·</span>
                    <span>{post.readTime}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Newsletter CTA */}
        <aside className="mt-16 text-center p-8 rounded-2xl border border-border bg-muted/30">
          <h2 className="text-xl font-semibold mb-2">Stay in the loop</h2>
          <p className="text-muted-foreground mb-4">Get the latest articles and updates delivered to your inbox.</p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Link
              to="/request-invite"
              className="inline-flex items-center justify-center rounded-lg bg-primary text-primary-foreground px-6 py-3 text-sm font-medium hover:bg-primary/90 transition-colors min-h-[44px]"
            >
              Get Early Access
            </Link>
          </div>
        </aside>
      </article>
    </PublicLayout>
  );
}