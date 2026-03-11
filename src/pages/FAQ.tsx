import { PublicLayout } from '@/components/layout/PublicLayout';
import { SEOHead } from '@/components/seo/SEOHead';
import { getFAQSchema, SEO_CONFIG } from '@/lib/seo';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Link } from 'react-router-dom';

const FAQ_CATEGORIES = [
  {
    id: 'getting-started',
    title: 'Getting Started',
    faqs: [
      {
        question: 'What is Kernel?',
        answer: 'Kernel is an AI-powered development operating system. It combines an intelligent chat assistant, visual app builder, one-click deployment, and database management into a single platform — letting you go from idea to production in minutes.',
      },
      {
        question: 'Do I need coding experience to use Kernel?',
        answer: 'No. Kernel\'s AI assistant understands natural language. Describe what you want to build, and Kernel generates production-ready code. Developers can also edit code directly for full control.',
      },
      {
        question: 'How do I create an account?',
        answer: 'Request an invite code at kernel.cool/request-invite, or redeem one you\'ve received. Once approved, sign up with your email to get started immediately.',
      },
      {
        question: 'What can I build with Kernel?',
        answer: 'Web apps, dashboards, SaaS products, landing pages, admin panels, internal tools, and more. Kernel supports React, TypeScript, databases, authentication, file storage, and API integrations out of the box.',
      },
    ],
  },
  {
    id: 'features',
    title: 'Features & Capabilities',
    faqs: [
      {
        question: 'What AI models does Kernel use?',
        answer: 'Kernel supports multiple frontier AI models including GPT-5, Gemini 2.5 Pro, and Gemini Flash. You can switch models per-conversation based on your needs — complex reasoning, fast iteration, or cost optimization.',
      },
      {
        question: 'Does Kernel support real-time collaboration?',
        answer: 'Yes. Kernel includes real-time database subscriptions, live preview, and instant deployment. Team collaboration features are available on Pro and Enterprise plans.',
      },
      {
        question: 'Can I connect my own database?',
        answer: 'Kernel includes a built-in cloud database with every project. You can also connect external databases and APIs through backend functions.',
      },
      {
        question: 'Does Kernel support custom domains?',
        answer: 'Yes. Pro and Enterprise plans include custom domain support with automatic SSL certificates. Free plans deploy to a kernel.cool subdomain.',
      },
    ],
  },
  {
    id: 'pricing',
    title: 'Pricing & Plans',
    faqs: [
      {
        question: 'Is Kernel free to use?',
        answer: 'Yes. The free plan includes AI chat assistance, the visual builder, basic templates, and deployment to a kernel.cool subdomain. No credit card required.',
      },
      {
        question: 'What\'s included in the Pro plan?',
        answer: 'Pro includes unlimited AI messages, priority model access, custom domains, advanced analytics, team collaboration, and priority support. See our pricing page for full details.',
      },
      {
        question: 'Can I cancel or change my plan anytime?',
        answer: 'Absolutely. Upgrade instantly or downgrade at the end of your billing period. We offer a 14-day money-back guarantee on all paid plans.',
      },
      {
        question: 'Do you offer enterprise pricing?',
        answer: 'Yes. Enterprise plans include SSO, dedicated support, SLA guarantees, custom integrations, and volume discounts. Contact our sales team for a quote.',
      },
    ],
  },
  {
    id: 'technical',
    title: 'Technical',
    faqs: [
      {
        question: 'What tech stack does Kernel use?',
        answer: 'Kernel generates React + TypeScript + Tailwind CSS applications. The backend uses PostgreSQL with row-level security, edge functions for custom logic, and built-in authentication.',
      },
      {
        question: 'Can I export my code?',
        answer: 'Yes. Kernel projects are standard React applications. You can connect to GitHub for version control, or export your code at any time. No vendor lock-in.',
      },
      {
        question: 'How does deployment work?',
        answer: 'One-click deployment to Kernel\'s global CDN. Your app gets an instant URL, SSL certificate, and can be connected to a custom domain. Zero DevOps required.',
      },
      {
        question: 'Does Kernel support mobile apps?',
        answer: 'Kernel builds Progressive Web Apps (PWAs) that work on any device — iOS, Android, and desktop. PWAs can be installed from the browser and work offline.',
      },
    ],
  },
  {
    id: 'security',
    title: 'Security & Privacy',
    faqs: [
      {
        question: 'Is my data secure on Kernel?',
        answer: 'Yes. We use TLS 1.3 encryption in transit, AES-256 at rest, and row-level security for database access. Our infrastructure is SOC 2 Type II compliant.',
      },
      {
        question: 'Do you store my code?',
        answer: 'Your code is stored securely in our cloud with full encryption. You maintain full ownership and can export or delete your data at any time.',
      },
      {
        question: 'How do you handle AI data privacy?',
        answer: 'Your conversations and code are not used to train AI models. We process requests through secure API connections and do not share your data with third parties.',
      },
    ],
  },
];

const allFaqs = FAQ_CATEGORIES.flatMap(cat => cat.faqs);

export default function FAQ() {
  const siteUrl = SEO_CONFIG.siteUrl;

  return (
    <PublicLayout>
      <SEOHead
        title="FAQ - Frequently Asked Questions"
        description="Find answers to common questions about Kernel — features, pricing, security, technical details, and getting started with AI-powered development."
        canonical="/faq"
        keywords={['FAQ', 'frequently asked questions', 'help', 'support', 'Kernel']}
        structuredData={getFAQSchema(allFaqs)}
        breadcrumbs={[
          { name: 'Home', url: siteUrl },
          { name: 'FAQ', url: `${siteUrl}/faq` },
        ]}
        speakable={{ cssSelectors: ['h1', '.faq-summary'] }}
      />

      <article className="container max-w-4xl py-12 sm:py-16 lg:py-20 px-4">
        {/* Hero */}
        <header className="text-center mb-12">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight mb-4">
            Frequently Asked Questions
          </h1>
          <p className="faq-summary text-lg text-muted-foreground max-w-2xl mx-auto">
            Everything you need to know about Kernel. Can't find an answer?{' '}
            <Link to="/contact" className="text-primary hover:underline">Contact our team</Link>.
          </p>
        </header>

        {/* Category Navigation */}
        <nav aria-label="FAQ categories" className="flex flex-wrap gap-2 justify-center mb-10">
          {FAQ_CATEGORIES.map(cat => (
            <a
              key={cat.id}
              href={`#${cat.id}`}
              className="px-4 py-2 rounded-full text-sm font-medium border border-border hover:bg-accent hover:text-accent-foreground transition-colors min-h-[44px] flex items-center"
            >
              {cat.title}
            </a>
          ))}
        </nav>

        {/* FAQ Sections */}
        <div className="space-y-10">
          {FAQ_CATEGORIES.map(category => (
            <section key={category.id} id={category.id} aria-labelledby={`heading-${category.id}`}>
              <h2 id={`heading-${category.id}`} className="text-xl sm:text-2xl font-semibold mb-4">
                {category.title}
              </h2>
              <Accordion type="multiple" className="space-y-2">
                {category.faqs.map((faq, i) => (
                  <AccordionItem key={i} value={`${category.id}-${i}`} className="border rounded-lg px-4">
                    <AccordionTrigger className="text-left text-sm sm:text-base min-h-[44px]">
                      {faq.question}
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground text-sm sm:text-base leading-relaxed pb-4">
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </section>
          ))}
        </div>

        {/* CTA */}
        <aside className="mt-16 text-center p-8 rounded-2xl border border-border bg-muted/30">
          <h2 className="text-xl font-semibold mb-2">Still have questions?</h2>
          <p className="text-muted-foreground mb-4">Our team is ready to help you get started.</p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Link
              to="/contact"
              className="inline-flex items-center justify-center rounded-lg bg-primary text-primary-foreground px-6 py-3 text-sm font-medium hover:bg-primary/90 transition-colors min-h-[44px]"
            >
              Contact Support
            </Link>
            <Link
              to="/docs"
              className="inline-flex items-center justify-center rounded-lg border border-border px-6 py-3 text-sm font-medium hover:bg-accent transition-colors min-h-[44px]"
            >
              Read Documentation
            </Link>
          </div>
        </aside>
      </article>
    </PublicLayout>
  );
}