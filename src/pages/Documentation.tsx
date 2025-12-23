import { useState, useMemo } from 'react';
import { SEO } from '@/components/seo/SEO';
import { SEO_CONFIG, PAGE_SEO, getOrganizationSchema, BREADCRUMBS } from '@/lib/seo';
import { PublicLayout } from '@/components/layout/PublicLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Book, 
  Rocket, 
  Search,
  ArrowRight,
  X
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { docCategories, searchDocumentation, DocArticle } from '@/lib/documentation-data';

const Documentation = () => {
  const [searchQuery, setSearchQuery] = useState('');

  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    return searchDocumentation(searchQuery);
  }, [searchQuery]);

  const isSearching = searchQuery.trim().length > 0;

  return (
    <PublicLayout>
      <SEO
        title={PAGE_SEO.documentation.title}
        description={PAGE_SEO.documentation.description}
        ogImage={PAGE_SEO.documentation.ogImage}
        keywords={PAGE_SEO.documentation.keywords as unknown as string[]}
        canonical="/docs"
        structuredData={[
          getOrganizationSchema(SEO_CONFIG.siteUrl),
          BREADCRUMBS.docs(SEO_CONFIG.siteUrl),
        ]}
      />
      
      <div className="container mx-auto px-4 py-16 max-w-6xl">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Book className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Documentation</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
            Everything you need to build amazing applications with Kernel.
          </p>
          
          {/* Search bar */}
          <div className="relative max-w-md mx-auto">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search documentation..." 
              className="pl-10 pr-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        {/* Search Results */}
        {isSearching && (
          <div className="mb-12">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">
                {searchResults.length} result{searchResults.length !== 1 ? 's' : ''} for "{searchQuery}"
              </h2>
              <Button variant="ghost" size="sm" onClick={() => setSearchQuery('')}>
                Clear search
              </Button>
            </div>
            {searchResults.length > 0 ? (
              <div className="grid gap-3">
                {searchResults.map((article: DocArticle) => (
                  <Link 
                    key={article.id} 
                    to={`/docs/${article.categorySlug}/${article.slug}`}
                  >
                    <Card className="hover:border-primary/50 transition-colors">
                      <CardContent className="flex items-center justify-between py-4">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <Badge variant="outline" className="text-xs">
                              {article.category}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {article.readTime}
                            </span>
                          </div>
                          <h3 className="font-medium">{article.title}</h3>
                          <p className="text-sm text-muted-foreground line-clamp-1">
                            {article.description}
                          </p>
                        </div>
                        <ArrowRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            ) : (
              <Card className="text-center py-8">
                <CardContent>
                  <p className="text-muted-foreground">
                    No documentation found matching your search.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* Quick start banner - hide when searching */}
        {!isSearching && (
          <Card className="mb-12 bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
            <CardContent className="flex flex-col md:flex-row items-center justify-between gap-4 py-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-full bg-primary/20">
                  <Rocket className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">New to Kernel?</h3>
                  <p className="text-muted-foreground">Start with our quick start guide and build your first app in 5 minutes.</p>
                </div>
              </div>
              <Button asChild>
                <Link to="/docs/getting-started/quick-start-guide">
                  Quick Start <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Documentation sections grid - hide when searching */}
        {!isSearching && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {docCategories.map((category) => {
              const CategoryIcon = category.icon;
              return (
                <Card key={category.slug} className="hover:border-primary/50 transition-colors">
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <CategoryIcon className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <Link to={`/docs/${category.slug}`}>
                          <CardTitle className="text-lg hover:text-primary transition-colors">
                            {category.title}
                          </CardTitle>
                        </Link>
                        <CardDescription>{category.description}</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {category.articles.map((article) => (
                        <li key={article.id}>
                          <Link 
                            to={`/docs/${article.categorySlug}/${article.slug}`}
                            className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center gap-2"
                          >
                            <ArrowRight className="h-3 w-3" />
                            {article.title}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </PublicLayout>
  );
};

export default Documentation;
