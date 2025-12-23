import { useParams, useNavigate, Link } from 'react-router-dom';
import { SEO } from '@/components/seo/SEO';
import { SEO_CONFIG, getBreadcrumbSchema } from '@/lib/seo';
import { PublicLayout } from '@/components/layout/PublicLayout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { 
  ArrowLeft, 
  ArrowRight, 
  Clock, 
  Calendar,
  BookOpen,
  Lightbulb,
  AlertTriangle,
  Info
} from 'lucide-react';
import { 
  useDocArticle, 
  useAdjacentArticles, 
  useRelatedArticles,
  DocSectionData 
} from '@/hooks/useStaticData';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';

const DocDetail = () => {
  const { categorySlug, slug } = useParams<{ categorySlug: string; slug: string }>();
  const navigate = useNavigate();

  const { data: article, isLoading } = useDocArticle(categorySlug || '', slug || '');
  const { prev, next } = useAdjacentArticles(categorySlug || '', slug || '');
  const relatedArticles = useRelatedArticles(article?.relatedDocs || []);

  if (isLoading) {
    return (
      <PublicLayout>
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <Skeleton className="h-6 w-72 mb-8" />
          <Skeleton className="h-8 w-24 mb-4" />
          <Skeleton className="h-14 w-full mb-4" />
          <Skeleton className="h-6 w-96 mb-6" />
          <div className="flex gap-4 mb-12">
            <Skeleton className="h-5 w-24" />
            <Skeleton className="h-5 w-32" />
          </div>
          <Skeleton className="h-32 w-full mb-12" />
          <div className="space-y-8">
            {[1, 2, 3].map(i => (
              <div key={i}>
                <Skeleton className="h-8 w-48 mb-4" />
                <Skeleton className="h-24 w-full" />
              </div>
            ))}
          </div>
        </div>
      </PublicLayout>
    );
  }

  if (!article) {
    return (
      <PublicLayout>
        <div className="container mx-auto px-4 py-16 max-w-4xl text-center">
          <h1 className="text-2xl font-bold mb-4">Article Not Found</h1>
          <p className="text-muted-foreground mb-8">
            The documentation article you're looking for doesn't exist.
          </p>
          <Button onClick={() => navigate('/docs')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Documentation
          </Button>
        </div>
      </PublicLayout>
    );
  }

  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Home', url: SEO_CONFIG.siteUrl },
    { name: 'Documentation', url: `${SEO_CONFIG.siteUrl}/docs` },
    { name: article.category, url: `${SEO_CONFIG.siteUrl}/docs/${article.categorySlug}` },
    { name: article.title, url: `${SEO_CONFIG.siteUrl}/docs/${article.categorySlug}/${article.slug}` },
  ]);

  return (
    <PublicLayout>
      <SEO
        title={`${article.title} | Kernel Documentation`}
        description={article.description}
        ogImage="/og-images/docs.png"
        keywords={[article.category, 'documentation', 'guide', 'kernel', article.title.toLowerCase()]}
        canonical={`/docs/${article.categorySlug}/${article.slug}`}
        structuredData={[breadcrumbSchema]}
      />

      <article className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Breadcrumbs */}
        <Breadcrumb className="mb-8">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link to="/">Home</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link to="/docs">Documentation</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link to={`/docs/${article.categorySlug}`}>{article.category}</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{article.title}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        {/* Article Header */}
        <header className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <Badge variant="secondary" className="font-normal">
              {article.category}
            </Badge>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">{article.title}</h1>
          <p className="text-xl text-muted-foreground mb-6">{article.description}</p>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              {article.readTime} read
            </span>
            <span className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              Updated {new Date(article.lastUpdated).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric'
              })}
            </span>
          </div>
        </header>

        {/* Table of Contents */}
        <Card className="mb-12 bg-muted/30">
          <CardContent className="py-4">
            <h2 className="font-semibold mb-3 flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              In this article
            </h2>
            <nav>
              <ul className="space-y-1">
                {article.sections.map((section, index) => (
                  <li key={index}>
                    <a 
                      href={`#section-${index}`}
                      className="text-sm text-muted-foreground hover:text-primary transition-colors"
                    >
                      {section.title}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          </CardContent>
        </Card>

        {/* Article Content */}
        <div className="prose prose-lg dark:prose-invert max-w-none">
          {article.sections.map((section, index) => (
            <DocSectionComponent key={index} section={section} index={index} />
          ))}
        </div>

        {/* Related Articles */}
        {relatedArticles.length > 0 && (
          <section className="mt-16">
            <h2 className="text-2xl font-bold mb-6">Related Documentation</h2>
            <div className="grid gap-4 md:grid-cols-2">
              {relatedArticles.slice(0, 4).map((related) => (
                <Link 
                  key={related.id} 
                  to={`/docs/${related.categorySlug}/${related.slug}`}
                  className="block"
                >
                  <Card className="h-full hover:border-primary/50 transition-colors">
                    <CardContent className="p-4">
                      <Badge variant="outline" className="mb-2 text-xs">
                        {related.category}
                      </Badge>
                      <h3 className="font-semibold mb-1">{related.title}</h3>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {related.description}
                      </p>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Navigation */}
        <Separator className="my-12" />
        <nav className="flex justify-between items-center">
          {prev ? (
            <Link 
              to={`/docs/${prev.categorySlug}/${prev.slug}`}
              className="group flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
              <div className="text-left">
                <div className="text-xs uppercase tracking-wide">Previous</div>
                <div className="font-medium">{prev.title}</div>
              </div>
            </Link>
          ) : <div />}
          
          {next ? (
            <Link 
              to={`/docs/${next.categorySlug}/${next.slug}`}
              className="group flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors text-right"
            >
              <div>
                <div className="text-xs uppercase tracking-wide">Next</div>
                <div className="font-medium">{next.title}</div>
              </div>
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          ) : <div />}
        </nav>
      </article>
    </PublicLayout>
  );
};

// Section component with code highlighting
const DocSectionComponent = ({ section, index }: { section: DocSectionData; index: number }) => {
  return (
    <section id={`section-${index}`} className="mb-12 scroll-mt-24">
      <h2 className="text-2xl font-bold mb-4">{section.title}</h2>
      
      <div className="text-muted-foreground mb-4">
        <ReactMarkdown>{section.content}</ReactMarkdown>
      </div>

      {section.codeExample && (
        <div className="my-6 rounded-lg overflow-hidden border">
          {section.codeExample.filename && (
            <div className="bg-muted px-4 py-2 text-sm font-mono border-b">
              {section.codeExample.filename}
            </div>
          )}
          <SyntaxHighlighter
            language={section.codeExample.language}
            style={oneDark}
            customStyle={{ margin: 0, borderRadius: 0 }}
          >
            {section.codeExample.code}
          </SyntaxHighlighter>
        </div>
      )}

      {section.tip && (
        <div className="flex gap-3 p-4 rounded-lg bg-primary/5 border border-primary/20 my-4">
          <Lightbulb className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
          <div className="text-sm">{section.tip}</div>
        </div>
      )}

      {section.warning && (
        <div className="flex gap-3 p-4 rounded-lg bg-destructive/5 border border-destructive/20 my-4">
          <AlertTriangle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
          <div className="text-sm">{section.warning}</div>
        </div>
      )}

      {section.note && (
        <div className="flex gap-3 p-4 rounded-lg bg-muted border my-4">
          <Info className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5" />
          <div className="text-sm text-muted-foreground">{section.note}</div>
        </div>
      )}
    </section>
  );
};

export default DocDetail;
