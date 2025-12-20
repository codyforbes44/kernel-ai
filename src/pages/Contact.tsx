import { useState } from "react";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Send, MessageSquare, Mail, Clock, HelpCircle, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { KernelLogo } from "@/components/ui/kernel-logo";
import { SEO } from "@/components/seo/SEO";
import { SEO_CONFIG, getOrganizationSchema } from "@/lib/seo";
import { toast } from "@/hooks/use-toast";

const contactSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100, "Name must be less than 100 characters"),
  email: z.string().trim().email("Invalid email address").max(255, "Email must be less than 255 characters"),
  subject: z.string().min(1, "Please select a subject"),
  message: z.string().trim().min(10, "Message must be at least 10 characters").max(2000, "Message must be less than 2000 characters"),
});

type ContactFormData = z.infer<typeof contactSchema>;

const faqItems = [
  {
    category: "Getting Started",
    questions: [
      {
        q: "How do I create my first project?",
        a: "After signing up, click 'New Project' from your dashboard. You can start with a blank project or choose from our templates. The AI assistant will guide you through building your app step by step."
      },
      {
        q: "Do I need coding experience to use Kernel?",
        a: "No coding experience is required! Kernel's AI assistant understands natural language and can generate code for you. However, developers can also access and customize the code directly for more control."
      },
      {
        q: "What types of apps can I build?",
        a: "You can build web applications, dashboards, landing pages, internal tools, SaaS products, and more. Kernel supports React-based applications with modern UI frameworks."
      },
    ]
  },
  {
    category: "Account & Billing",
    questions: [
      {
        q: "How do I upgrade my plan?",
        a: "Go to Settings > Billing in your dashboard. You can upgrade to Pro or contact us for Enterprise pricing. Changes take effect immediately with prorated billing."
      },
      {
        q: "Can I cancel my subscription anytime?",
        a: "Yes, you can cancel your subscription at any time from your account settings. You'll retain access to Pro features until the end of your billing period."
      },
      {
        q: "Do you offer refunds?",
        a: "We offer a 14-day money-back guarantee for Pro subscriptions. If you're not satisfied, contact support within 14 days of purchase for a full refund."
      },
    ]
  },
  {
    category: "Features & Capabilities",
    questions: [
      {
        q: "How does the AI code generation work?",
        a: "Our AI understands your natural language descriptions and generates production-ready code. It considers your project context, existing code, and best practices to create consistent, maintainable code."
      },
      {
        q: "Can I deploy my app directly from Kernel?",
        a: "Yes! Click the Deploy button to instantly publish your app. You'll get a unique URL, and you can also connect custom domains on Pro and Enterprise plans."
      },
      {
        q: "Is my code private and secure?",
        a: "Absolutely. Your projects are private by default and encrypted at rest. We never share your code or use it to train AI models. Enterprise plans include additional security features like SSO and audit logs."
      },
    ]
  },
  {
    category: "Technical Support",
    questions: [
      {
        q: "How do I report a bug?",
        a: "Use this contact form with 'Bug Report' as the subject. Include steps to reproduce the issue, expected vs actual behavior, and any error messages. Screenshots or screen recordings are helpful!"
      },
      {
        q: "Where can I find documentation?",
        a: "Visit our documentation at docs.kernel.app for guides, tutorials, and API references. You can also ask the AI assistant for help with specific features."
      },
      {
        q: "What's the response time for support tickets?",
        a: "Free users receive community support. Pro users get priority email support with 24-48 hour response times. Enterprise customers have dedicated support with SLA guarantees."
      },
    ]
  },
];

const contactOptions = [
  {
    icon: MessageSquare,
    title: "Live Chat",
    description: "Chat with our team in real-time",
    availability: "Pro & Enterprise",
  },
  {
    icon: Mail,
    title: "Email Support",
    description: "support@kernel.app",
    availability: "All users",
  },
  {
    icon: Clock,
    title: "Response Time",
    description: "Within 24-48 hours",
    availability: "Pro users",
  },
];

export default function Contact() {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      name: "",
      email: "",
      subject: "",
      message: "",
    },
  });

  const onSubmit = async (data: ContactFormData) => {
    setIsSubmitting(true);
    
    // Simulate form submission
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    toast({
      title: "Message sent!",
      description: "We've received your message and will get back to you soon.",
    });
    
    form.reset();
    setIsSubmitting(false);
  };

  const contactSeo = {
    title: "Contact & Support - Kernel",
    description: "Get help with Kernel. Contact our support team, browse FAQs, or find answers to common questions about our AI development platform.",
    keywords: ["support", "contact", "help", "FAQ", "customer service"],
  };

  return (
    <>
      <SEO 
        {...contactSeo}
        structuredData={[getOrganizationSchema(SEO_CONFIG.siteUrl)]}
      />
      
      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="fixed top-0 left-0 right-0 z-50 border-b border-border/40 bg-background/80 backdrop-blur-xl">
          <nav className="container mx-auto px-4 h-16 flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2">
              <KernelLogo size="sm" />
              <span className="font-bold text-xl">Kernel</span>
            </Link>
            <div className="flex items-center gap-3">
              <Button variant="ghost" asChild>
                <Link to="/pricing">Pricing</Link>
              </Button>
              <Button variant="ghost" asChild>
                <Link to="/auth">Sign In</Link>
              </Button>
              <Button asChild>
                <Link to="/auth?tab=signup">Get Started</Link>
              </Button>
            </div>
          </nav>
        </header>

        {/* Hero Section */}
        <section className="pt-32 pb-12 px-4">
          <div className="container mx-auto text-center max-w-3xl">
            <Badge variant="secondary" className="mb-4">
              <HelpCircle className="h-3 w-3 mr-1" />
              Support Center
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">
              How can we <span className="text-primary">help</span>?
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Browse our FAQ for quick answers or get in touch with our support team. 
              We're here to help you succeed with Kernel.
            </p>
          </div>
        </section>

        {/* Contact Options */}
        <section className="pb-12 px-4">
          <div className="container mx-auto max-w-4xl">
            <div className="grid md:grid-cols-3 gap-4">
              {contactOptions.map((option) => (
                <Card key={option.title} className="text-center">
                  <CardContent className="pt-6">
                    <div className="mx-auto mb-3 p-3 rounded-xl bg-primary/10 w-fit">
                      <option.icon className="h-5 w-5 text-primary" />
                    </div>
                    <h3 className="font-semibold mb-1">{option.title}</h3>
                    <p className="text-sm text-muted-foreground mb-2">{option.description}</p>
                    <Badge variant="outline" className="text-xs">
                      {option.availability}
                    </Badge>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Main Content Grid */}
        <section className="pb-20 px-4">
          <div className="container mx-auto max-w-6xl">
            <div className="grid lg:grid-cols-2 gap-12">
              {/* Contact Form */}
              <div>
                <Card>
                  <CardHeader>
                    <CardTitle>Send us a message</CardTitle>
                    <CardDescription>
                      Fill out the form below and we'll get back to you as soon as possible.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Form {...form}>
                      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <div className="grid sm:grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Name</FormLabel>
                                <FormControl>
                                  <Input placeholder="Your name" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Email</FormLabel>
                                <FormControl>
                                  <Input type="email" placeholder="you@example.com" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        <FormField
                          control={form.control}
                          name="subject"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Subject</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select a topic" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="general">General Inquiry</SelectItem>
                                  <SelectItem value="support">Technical Support</SelectItem>
                                  <SelectItem value="billing">Billing Question</SelectItem>
                                  <SelectItem value="bug">Bug Report</SelectItem>
                                  <SelectItem value="feature">Feature Request</SelectItem>
                                  <SelectItem value="enterprise">Enterprise Sales</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="message"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Message</FormLabel>
                              <FormControl>
                                <Textarea 
                                  placeholder="How can we help you?"
                                  className="min-h-[120px] resize-none"
                                  {...field} 
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <Button type="submit" className="w-full" disabled={isSubmitting}>
                          {isSubmitting ? (
                            <>Sending...</>
                          ) : (
                            <>
                              Send Message
                              <Send className="ml-2 h-4 w-4" />
                            </>
                          )}
                        </Button>
                      </form>
                    </Form>
                  </CardContent>
                </Card>
              </div>

              {/* FAQ Section */}
              <div>
                <h2 className="text-2xl font-bold mb-6">Frequently Asked Questions</h2>
                <div className="space-y-6">
                  {faqItems.map((category) => (
                    <div key={category.category}>
                      <h3 className="text-sm font-medium text-muted-foreground mb-3 uppercase tracking-wider">
                        {category.category}
                      </h3>
                      <Accordion type="single" collapsible className="space-y-2">
                        {category.questions.map((item, index) => (
                          <AccordionItem 
                            key={index} 
                            value={`${category.category}-${index}`}
                            className="border border-border rounded-lg px-4 data-[state=open]:bg-muted/30"
                          >
                            <AccordionTrigger className="text-left hover:no-underline py-4">
                              {item.q}
                            </AccordionTrigger>
                            <AccordionContent className="text-muted-foreground pb-4">
                              {item.a}
                            </AccordionContent>
                          </AccordionItem>
                        ))}
                      </Accordion>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-border py-8 px-4">
          <div className="container mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <KernelLogo size="sm" />
              <span className="font-semibold">Kernel</span>
            </div>
            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <Link to="/pricing" className="hover:text-foreground transition-colors">Pricing</Link>
              <Link to="/contact" className="hover:text-foreground transition-colors">Contact</Link>
            </div>
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} Kernel. All rights reserved.
            </p>
          </div>
        </footer>
      </div>
    </>
  );
}
