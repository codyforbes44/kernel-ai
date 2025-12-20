import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Home, Code2, Sparkles, ArrowLeft } from "lucide-react";
import { SEO } from "@/components/seo/SEO";
import { PAGE_SEO } from "@/lib/seo";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <SEO
        title={PAGE_SEO.notFound.title}
        description={PAGE_SEO.notFound.description}
        ogImage={PAGE_SEO.notFound.ogImage}
        noIndex={PAGE_SEO.notFound.noIndex}
      />
      
      <Card className="max-w-md w-full border-border/50">
        <CardContent className="pt-10 pb-8 px-8">
          <div className="text-center">
            {/* Logo/Icon */}
            <div className="mx-auto h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mb-6">
              <Sparkles className="h-8 w-8 text-primary" />
            </div>

            {/* Error Code */}
            <h1 className="text-6xl font-bold text-primary mb-2">404</h1>
            
            {/* Message */}
            <h2 className="text-xl font-semibold mb-2">Page not found</h2>
            <p className="text-muted-foreground mb-8">
              The page you're looking for doesn't exist or has been moved.
            </p>

            {/* Navigation Options */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button asChild variant="default" className="gap-2">
                <Link to="/">
                  <Home className="h-4 w-4" />
                  Go Home
                </Link>
              </Button>
              <Button asChild variant="outline" className="gap-2">
                <Link to="/builder">
                  <Code2 className="h-4 w-4" />
                  App Builder
                </Link>
              </Button>
            </div>

            {/* Back Link */}
            <button
              onClick={() => window.history.back()}
              className="mt-6 text-sm text-muted-foreground hover:text-foreground inline-flex items-center gap-1 transition-colors"
            >
              <ArrowLeft className="h-3 w-3" />
              Go back
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default NotFound;
