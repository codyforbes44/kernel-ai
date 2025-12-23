import { SEO } from '@/components/seo/SEO';
import { SEO_CONFIG, PAGE_SEO, getOrganizationSchema, getJobPostingSchema, getBreadcrumbSchema, BREADCRUMBS } from '@/lib/seo';
import { PublicLayout } from '@/components/layout/PublicLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Briefcase, 
  MapPin, 
  Clock, 
  Heart,
  Coffee,
  Laptop,
  Plane,
  GraduationCap,
  Users,
  Sparkles,
  ArrowRight
} from 'lucide-react';

interface JobPosition {
  id: string;
  title: string;
  department: string;
  location: string;
  type: 'Full-time' | 'Part-time' | 'Contract';
  remote: boolean;
}

const openPositions: JobPosition[] = [
  {
    id: '1',
    title: 'Senior Frontend Engineer',
    department: 'Engineering',
    location: 'San Francisco, CA',
    type: 'Full-time',
    remote: true,
  },
  {
    id: '2',
    title: 'Product Designer',
    department: 'Design',
    location: 'New York, NY',
    type: 'Full-time',
    remote: true,
  },
  {
    id: '3',
    title: 'Machine Learning Engineer',
    department: 'AI',
    location: 'Remote',
    type: 'Full-time',
    remote: true,
  },
  {
    id: '4',
    title: 'Developer Advocate',
    department: 'Developer Relations',
    location: 'Remote',
    type: 'Full-time',
    remote: true,
  },
];

const benefits = [
  {
    icon: Heart,
    title: 'Health & Wellness',
    description: 'Comprehensive health, dental, and vision insurance for you and your family.',
  },
  {
    icon: Laptop,
    title: 'Remote-First',
    description: 'Work from anywhere. We provide the equipment you need to do your best work.',
  },
  {
    icon: Plane,
    title: 'Unlimited PTO',
    description: 'Take the time you need to rest, recharge, and explore.',
  },
  {
    icon: GraduationCap,
    title: 'Learning Budget',
    description: '$2,000 annual budget for courses, books, and conferences.',
  },
  {
    icon: Coffee,
    title: 'Home Office Stipend',
    description: '$1,000 to set up your perfect home workspace.',
  },
  {
    icon: Users,
    title: 'Team Retreats',
    description: 'Quarterly in-person gatherings to connect and collaborate.',
  },
];

const values = [
  {
    title: 'Build with Empathy',
    description: 'We put ourselves in our users\' shoes and create tools that truly help them succeed.',
  },
  {
    title: 'Move Fast, Stay Grounded',
    description: 'We ship quickly but thoughtfully, always maintaining quality.',
  },
  {
    title: 'Embrace the Unknown',
    description: 'We tackle ambitious problems and learn from every challenge.',
  },
  {
    title: 'Lift Each Other Up',
    description: 'We succeed as a team, celebrating wins and supporting each other through obstacles.',
  },
];

const Careers = () => {
  const jobSchemas = openPositions.map(job => getJobPostingSchema({
    title: job.title,
    description: `${job.title} position in the ${job.department} department at Kernel.`,
    department: job.department,
    location: job.location,
    employmentType: job.type === 'Full-time' ? 'FULL_TIME' : job.type === 'Part-time' ? 'PART_TIME' : 'CONTRACT',
    remote: job.remote,
    datePosted: new Date().toISOString().split('T')[0],
  }, SEO_CONFIG.siteUrl));

  return (
    <PublicLayout>
      <SEO
        title={PAGE_SEO.careers.title}
        description={PAGE_SEO.careers.description}
        ogImage={PAGE_SEO.careers.ogImage}
        keywords={PAGE_SEO.careers.keywords as unknown as string[]}
        canonical="/careers"
        structuredData={[
          getOrganizationSchema(SEO_CONFIG.siteUrl),
          ...jobSchemas,
          BREADCRUMBS.careers(SEO_CONFIG.siteUrl),
        ]}
      />
      
      <div className="container mx-auto px-4 py-16 max-w-6xl">
        {/* Hero section */}
        <div className="text-center mb-16">
          <Badge className="mb-4 bg-primary/10 text-primary border-primary/20">
            <Sparkles className="h-3 w-3 mr-1" />
            We're Hiring
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Build the Future With Us</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            We're on a mission to democratize software development. Join our team and help millions of people bring their ideas to life.
          </p>
        </div>

        {/* Values section */}
        <section className="mb-16">
          <h2 className="text-2xl font-semibold text-center mb-8">Our Values</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value, index) => (
              <Card key={index} className="text-center">
                <CardHeader>
                  <CardTitle className="text-lg">{value.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{value.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Benefits section */}
        <section className="mb-16">
          <h2 className="text-2xl font-semibold text-center mb-8">Benefits & Perks</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {benefits.map((benefit, index) => (
              <Card key={index}>
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <benefit.icon className="h-5 w-5 text-primary" />
                    </div>
                    <CardTitle className="text-lg">{benefit.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{benefit.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Open positions */}
        <section>
          <h2 className="text-2xl font-semibold text-center mb-8">Open Positions</h2>
          
          {openPositions.length > 0 ? (
            <div className="space-y-4">
              {openPositions.map((position) => (
                <Card key={position.id} className="hover:border-primary/50 transition-colors">
                  <CardContent className="flex flex-col md:flex-row md:items-center justify-between gap-4 py-6">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="outline">{position.department}</Badge>
                        {position.remote && (
                          <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20">
                            Remote OK
                          </Badge>
                        )}
                      </div>
                      <h3 className="text-xl font-semibold mb-1">{position.title}</h3>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <MapPin className="h-3.5 w-3.5" />
                          {position.location}
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5" />
                          {position.type}
                        </div>
                      </div>
                    </div>
                    <Button>
                      Apply Now <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="text-center py-12">
              <CardContent>
                <Briefcase className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">No Open Positions</h3>
                <p className="text-muted-foreground mb-4">
                  We don't have any open positions right now, but we're always looking for talented people.
                </p>
                <Button variant="gold-outline">Send Us Your Resume</Button>
              </CardContent>
            </Card>
          )}
        </section>
      </div>
    </PublicLayout>
  );
};

export default Careers;
