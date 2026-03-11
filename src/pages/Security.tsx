import { SEOHead } from '@/components/seo/SEOHead';
import { SEO_CONFIG, PAGE_SEO, getOrganizationSchema } from '@/lib/seo';
import { PublicLayout } from '@/components/layout/PublicLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Shield, 
  Lock, 
  Eye, 
  Server, 
  Key,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Mail,
  ExternalLink
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { GlowText } from '@/components/ui/glow-text';
import { HoloBadge } from '@/components/ui/holo-badge';
import { HoloSection } from '@/components/ui/holo-section';
import { HoloCard, HoloCardHeader, HoloCardContent, HoloCardTitle } from '@/components/ui/holo-card';

const securityFeatures = [
  {
    icon: Lock,
    title: 'Encryption at Rest & Transit',
    description: 'All data is encrypted using AES-256 at rest and TLS 1.3 in transit.',
  },
  {
    icon: Key,
    title: 'Secure Authentication',
    description: 'Multi-factor authentication, OAuth 2.0, and secure session management.',
  },
  {
    icon: Eye,
    title: 'Access Controls',
    description: 'Role-based access control (RBAC) and row-level security policies.',
  },
  {
    icon: Server,
    title: 'Infrastructure Security',
    description: 'Hosted on SOC 2 Type II certified infrastructure with 24/7 monitoring.',
  },
];

const certifications = [
  { name: 'SOC 2 Type II', status: 'Certified' },
  { name: 'GDPR', status: 'Compliant' },
  { name: 'CCPA', status: 'Compliant' },
  { name: 'ISO 27001', status: 'In Progress' },
];

const securityPractices = [
  'Regular penetration testing by third-party security firms',
  'Automated vulnerability scanning on every deployment',
  'Bug bounty program for responsible disclosure',
  'Employee security training and background checks',
  'Incident response plan with 24/7 security team',
  'Regular security audits and code reviews',
  'Data backup with geographic redundancy',
  'Secure software development lifecycle (SSDLC)',
];

const Security = () => {
  return (
    <PublicLayout>
      <SEO
        title={PAGE_SEO.security.title}
        description={PAGE_SEO.security.description}
        ogImage={PAGE_SEO.security.ogImage}
        keywords={PAGE_SEO.security.keywords as unknown as string[]}
        canonical="/security"
        structuredData={[
          getOrganizationSchema(SEO_CONFIG.siteUrl),
          BREADCRUMBS.security(SEO_CONFIG.siteUrl),
        ]}
      />
      
      <div className="container mx-auto px-4 py-16 max-w-6xl">
        {/* Hero */}
        <HoloSection variant="gradient" className="text-center mb-16 py-8 -mx-4 px-4">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Shield className="h-8 w-8 text-primary drop-shadow-[0_0_8px_hsl(var(--primary)/0.5)]" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Security at <GlowText variant="primary" intensity="medium">Kernel</GlowText>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Your security is our top priority. Learn about the measures we take to protect your data and applications.
          </p>
        </HoloSection>

        {/* Security features */}
        <section className="mb-16">
          <h2 className="text-2xl font-semibold text-center mb-8">
            <GlowText variant="gradient" intensity="low">Security Features</GlowText>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {securityFeatures.map((feature, index) => (
              <HoloCard key={index} variant="bordered" hover>
                <HoloCardHeader>
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <feature.icon className="h-5 w-5 text-primary" />
                    </div>
                    <HoloCardTitle className="text-lg">{feature.title}</HoloCardTitle>
                  </div>
                </HoloCardHeader>
                <HoloCardContent>
                  <p className="text-muted-foreground">{feature.description}</p>
                </HoloCardContent>
              </HoloCard>
            ))}
          </div>
        </section>

        {/* Certifications */}
        <section className="mb-16">
          <h2 className="text-2xl font-semibold text-center mb-8">Compliance & Certifications</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {certifications.map((cert, index) => (
              <Card key={index} className="text-center">
                <CardContent className="py-6">
                  <div className="flex items-center justify-center mb-2">
                    {cert.status === 'Certified' || cert.status === 'Compliant' ? (
                      <CheckCircle2 className="h-8 w-8 text-emerald-500" />
                    ) : (
                      <AlertTriangle className="h-8 w-8 text-amber-500" />
                    )}
                  </div>
                  <h3 className="font-semibold">{cert.name}</h3>
                  <Badge 
                    className={
                      cert.status === 'Certified' || cert.status === 'Compliant'
                        ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20 mt-2'
                        : 'bg-amber-500/10 text-amber-500 border-amber-500/20 mt-2'
                    }
                  >
                    {cert.status}
                  </Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Security practices */}
        <section className="mb-16">
          <Card>
            <CardHeader>
              <CardTitle>Our Security Practices</CardTitle>
              <CardDescription>
                We follow industry best practices to ensure your data remains secure.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {securityPractices.map((practice, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
                    <span className="text-muted-foreground">{practice}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </section>

        {/* Responsible disclosure */}
        <section className="mb-16">
          <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
            <CardContent className="py-8">
              <div className="flex flex-col md:flex-row items-center gap-6">
                <div className="p-4 rounded-full bg-primary/20">
                  <AlertTriangle className="h-8 w-8 text-primary" />
                </div>
                <div className="flex-1 text-center md:text-left">
                  <h3 className="text-xl font-semibold mb-2">Responsible Disclosure</h3>
                  <p className="text-muted-foreground mb-4">
                    Found a security vulnerability? We appreciate your help in keeping Kernel secure. 
                    Please report security issues responsibly.
                  </p>
                  <Button variant="gold-outline" asChild>
                    <a href="mailto:security@kernel.cool">
                      <Mail className="mr-2 h-4 w-4" />
                      Report a Vulnerability
                    </a>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Related links */}
        <section>
          <h2 className="text-2xl font-semibold text-center mb-8">Related Resources</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="hover:border-primary/50 transition-colors">
              <CardContent className="flex items-center gap-4 py-6">
                <FileText className="h-6 w-6 text-primary" />
                <div className="flex-1">
                  <h3 className="font-semibold">Privacy Policy</h3>
                  <p className="text-sm text-muted-foreground">How we collect and use your data</p>
                </div>
                <Button variant="ghost" size="icon" asChild>
                  <Link to="/privacy">
                    <ExternalLink className="h-4 w-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
            <Card className="hover:border-primary/50 transition-colors">
              <CardContent className="flex items-center gap-4 py-6">
                <FileText className="h-6 w-6 text-primary" />
                <div className="flex-1">
                  <h3 className="font-semibold">Terms of Service</h3>
                  <p className="text-sm text-muted-foreground">Our terms and conditions</p>
                </div>
                <Button variant="ghost" size="icon" asChild>
                  <Link to="/terms">
                    <ExternalLink className="h-4 w-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </section>
      </div>
    </PublicLayout>
  );
};

export default Security;
