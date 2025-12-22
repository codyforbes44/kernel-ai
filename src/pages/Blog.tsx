import { Link } from 'react-router-dom';
import { SEO } from '@/components/seo/SEO';
import { PublicLayout } from '@/components/layout/PublicLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Calendar, Clock } from 'lucide-react';
import { blogPosts, categoryColors } from '@/lib/blog-data';

const Blog = () => {
  const featuredPost = blogPosts.find(post => post.featured);
  const regularPosts = blogPosts.filter(post => !post.featured);

  return (
    <PublicLayout>
      <SEO
        title="Blog"
        description="Insights, tutorials, and updates from the Kernel team. Learn about AI development, best practices, and more."
        noIndex={false}
      />
      
      <div className="container mx-auto px-4 py-16 max-w-6xl">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Blog</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Insights, tutorials, and updates from our team.
          </p>
        </div>

        {/* Featured post */}
        {featuredPost && (
          <Link to={`/blog/${featuredPost.slug}`}>
            <Card className="mb-12 overflow-hidden hover:border-primary/50 transition-colors cursor-pointer group">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-gradient-to-br from-primary/20 to-primary/5 min-h-[200px] md:min-h-[300px] flex items-center justify-center">
                  <span className="text-6xl">📝</span>
                </div>
                <div className="p-6 flex flex-col justify-center">
                  <div className="flex items-center gap-2 mb-3">
                    <Badge className={categoryColors[featuredPost.category]}>
                      {featuredPost.category}
                    </Badge>
                    <Badge variant="outline">Featured</Badge>
                  </div>
                  <h2 className="text-2xl md:text-3xl font-bold mb-3 group-hover:text-primary transition-colors">
                    {featuredPost.title}
                  </h2>
                  <p className="text-muted-foreground mb-4">{featuredPost.excerpt}</p>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Avatar className="h-6 w-6">
                        <AvatarImage src={featuredPost.author.avatar} />
                        <AvatarFallback className="text-xs">{featuredPost.author.initials}</AvatarFallback>
                      </Avatar>
                      <span>{featuredPost.author.name}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5" />
                      {featuredPost.date}
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" />
                      {featuredPost.readTime}
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </Link>
        )}

        {/* Post grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {regularPosts.map((post) => (
            <Link key={post.id} to={`/blog/${post.slug}`}>
              <Card className="hover:border-primary/50 transition-colors cursor-pointer group h-full">
                <div className="bg-gradient-to-br from-muted/50 to-muted/20 h-40 flex items-center justify-center">
                  <span className="text-4xl">📄</span>
                </div>
                <CardHeader>
                  <Badge className={`w-fit ${categoryColors[post.category]}`}>
                    {post.category}
                  </Badge>
                  <CardTitle className="text-lg group-hover:text-primary transition-colors line-clamp-2">
                    {post.title}
                  </CardTitle>
                  <CardDescription className="line-clamp-2">{post.excerpt}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Avatar className="h-5 w-5">
                        <AvatarImage src={post.author.avatar} />
                        <AvatarFallback className="text-[10px]">{post.author.initials}</AvatarFallback>
                      </Avatar>
                      <span>{post.author.name}</span>
                    </div>
                    <span>{post.readTime}</span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </PublicLayout>
  );
};

export default Blog;
