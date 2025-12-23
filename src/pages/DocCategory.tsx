import { useParams, useNavigate, Link } from 'react-router-dom';
import { SEO } from '@/components/seo/SEO';
import { SEO_CONFIG, getBreadcrumbSchema } from '@/lib/seo';
import { PublicLayout } from '@/components/layout/PublicLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { ArrowLeft, ArrowRight, Clock, Book } from 'lucide-react';
import { getCategoryBySlug, docCategories } from '@/lib/documentation-data';

const DocCategory = () => {
  const { categorySlug } = useParams<{ categorySlug: string }>();
  const navigate = useNavigate();

  const category = categorySlug ? getCategoryBySlug(categorySlug) : undefined;

  if (!category) {
    return (
      <PublicLayout>
        <div className="container mx-auto px-4 py-16 max-w-4xl text-center">
          <h1 className="text-2xl font-bold mb-4">Category Not Found</h1>
          <p className="text-muted-foreground mb-8">
            The documentation category you're looking for doesn't exist.
          </p>
          <Button onClick={() => navigate('/docs')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Documentation
          </Button>
        </div>
      </PublicLayout>
    );
  }

  const CategoryIcon = category.icon;
  const currentIndex = docCategories.findIndex(c => c.slug === category.slug);
  const prevCategory = currentIndex > 0 ? docCategories[currentIndex - 1] : undefined;
  const nextCategory = currentIndex < docCategories.length - 1 ? docCategories[currentIndex + 1] : undefined;

  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Home', url: SEO_CONFIG.siteUrl },
    { name: 'Documentation', url: `${SEO_CONFIG.siteUrl}/docs` },
    { name: category.title, url: `${SEO_CONFIG.siteUrl}/docs/${category.slug}` },
  ]);

  return (
    <PublicLayout>
      <SEO
        title={`${category.title} Documentation | Kernel`}
        description={category.description}
        ogImage="/og-images/docs.png"
        keywords={[category.title.toLowerCase(), 'documentation', 'guide', 'kernel']}
        canonical={`/docs/${category.slug}`}
        structuredData={[breadcrumbSchema]}
      />

      <div className="container mx-auto px-4 py-8 max-w-5xl">
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
              <BreadcrumbPage>{category.title}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        {/* Category Header */}
        <header className="mb-12">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 rounded-xl bg-primary/10">
              <CategoryIcon className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h1 className="text-4xl font-bold">{category.title}</h1>
              <p className="text-lg text-muted-foreground">{category.description}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Book className="h-4 w-4" />
            <span>{category.articles.length} articles in this section</span>
          </div>
        </header>

        {/* Articles Grid */}
        <div className="grid gap-4 mb-12">
          {category.articles.map((article, index) => (
            <Link 
              key={article.id} 
              to={`/docs/${article.categorySlug}/${article.slug}`}
              className="block"
            >
              <Card className="hover:border-primary/50 transition-colors">
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl font-bold text-muted-foreground/30">
                        {String(index + 1).padStart(2, '0')}
                      </span>
                      <div>
                        <CardTitle className="text-xl">{article.title}</CardTitle>
                        <CardDescription className="mt-1">{article.description}</CardDescription>
                      </div>
                    </div>
                    <ArrowRight className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-1" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" />
                      {article.readTime}
                    </span>
                    <Badge variant="outline" className="text-xs">
                      {article.sections.length} sections
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        {/* Category Navigation */}
        <nav className="flex justify-between items-center pt-8 border-t">
          {prevCategory ? (
            <Link 
              to={`/docs/${prevCategory.slug}`}
              className="group flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
              <div className="text-left">
                <div className="text-xs uppercase tracking-wide">Previous Section</div>
                <div className="font-medium">{prevCategory.title}</div>
              </div>
            </Link>
          ) : (
            <Link 
              to="/docs"
              className="group flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
              <span className="font-medium">All Documentation</span>
            </Link>
          )}
          
          {nextCategory ? (
            <Link 
              to={`/docs/${nextCategory.slug}`}
              className="group flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors text-right"
            >
              <div>
                <div className="text-xs uppercase tracking-wide">Next Section</div>
                <div className="font-medium">{nextCategory.title}</div>
              </div>
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          ) : <div />}
        </nav>

        {/* Other Categories */}
        <section className="mt-16">
          <h2 className="text-2xl font-bold mb-6">Explore Other Topics</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {docCategories
              .filter(c => c.slug !== category.slug)
              .slice(0, 6)
              .map((cat) => {
                const Icon = cat.icon;
                return (
                  <Link key={cat.slug} to={`/docs/${cat.slug}`}>
                    <Card className="h-full hover:border-primary/50 transition-colors">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="p-2 rounded-lg bg-primary/10">
                            <Icon className="h-4 w-4 text-primary" />
                          </div>
                          <CardTitle className="text-base">{cat.title}</CardTitle>
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {cat.description}
                        </p>
                        <p className="text-xs text-muted-foreground mt-2">
                          {cat.articles.length} articles
                        </p>
                      </CardContent>
                    </Card>
                  </Link>
                );
              })}
          </div>
        </section>
      </div>
    </PublicLayout>
  );
};

export default DocCategory;
