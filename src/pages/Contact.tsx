import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Send, HelpCircle, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { HoloBadge } from "@/components/ui/holo-badge";
import { HoloCard, HoloCardContent, HoloCardHeader, HoloCardTitle, HoloCardDescription } from "@/components/ui/holo-card";
import { GlowText } from "@/components/ui/glow-text";
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
import { PublicLayout } from "@/components/layout/PublicLayout";
import { SEO } from "@/components/seo/SEO";
import { SEO_CONFIG, PAGE_SEO, getOrganizationSchema, getContactPointSchema, getFAQSchema, getBreadcrumbSchema, BREADCRUMBS } from "@/lib/seo";
import { contactOptions, subjectOptions } from "@/lib/contact-data";
import { useContactFAQs } from "@/hooks/useStaticData";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const contactSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100, "Name must be less than 100 characters"),
  email: z.string().trim().email("Invalid email address").max(255, "Email must be less than 255 characters"),
  subject: z.string().min(1, "Please select a subject"),
  message: z.string().trim().min(10, "Message must be at least 10 characters").max(2000, "Message must be less than 2000 characters"),
});

type ContactFormData = z.infer<typeof contactSchema>;

export default function Contact() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { data: contactFAQs = [] } = useContactFAQs();

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
    
    try {
      const { data: response, error } = await supabase.functions.invoke('send-contact', {
        body: data,
      });

      if (error) throw error;

      toast({
        title: "Message sent!",
        description: "We've received your message and will get back to you soon.",
      });
      
      form.reset();
    } catch (error: any) {
      console.error('Contact form error:', error);
      toast({
        title: "Failed to send message",
        description: error.message || "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const faqItems = contactFAQs.slice(0, 8).map(faq => ({
    question: faq.question,
    answer: faq.answer,
  }));

  return (
    <PublicLayout backgroundIntensity="medium">
      <SEO 
        title={PAGE_SEO.contact.title}
        description={PAGE_SEO.contact.description}
        ogImage={PAGE_SEO.contact.ogImage}
        keywords={PAGE_SEO.contact.keywords as unknown as string[]}
        canonical="/contact"
        structuredData={[
          getOrganizationSchema(SEO_CONFIG.siteUrl),
          getContactPointSchema(SEO_CONFIG.siteUrl),
          getFAQSchema(faqItems),
          BREADCRUMBS.contact(SEO_CONFIG.siteUrl),
        ]}
      />

      {/* Hero Section */}
      <section className="pt-12 sm:pt-16 pb-8 sm:pb-12 px-4">
        <div className="container mx-auto text-center max-w-3xl">
          <HoloBadge variant="glow" className="mb-4">
            <HelpCircle className="h-3 w-3 mr-1" />
            Support Center
          </HoloBadge>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight mb-4 sm:mb-6">
            How can we{" "}
            <GlowText variant="primary" intensity="high" as="span">
              help
            </GlowText>
            ?
          </h1>
          <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto">
            Browse our FAQ for quick answers or get in touch with our support team. 
            We're here to help you succeed with Kernel.
          </p>
        </div>
      </section>

      {/* Contact Options */}
      <section className="pb-8 sm:pb-10 md:pb-12 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
            {contactOptions.map((option) => (
              <HoloCard key={option.title} className="text-center touch-manipulation" hover>
                <HoloCardContent className="pt-5 sm:pt-6 px-4 pb-4">
                  <div className="mx-auto mb-2 sm:mb-3 p-2.5 sm:p-3 rounded-xl bg-primary/10 w-fit shadow-[0_0_15px_hsl(var(--primary)/0.2)]">
                    <option.icon className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                  </div>
                  <h3 className="font-semibold text-sm sm:text-base mb-1">{option.title}</h3>
                  <p className="text-xs sm:text-sm text-muted-foreground mb-2">{option.description}</p>
                  <a
                    href={option.href}
                    className="text-xs sm:text-sm text-primary hover:underline font-medium touch-manipulation"
                  >
                    {option.action}
                  </a>
                </HoloCardContent>
              </HoloCard>
            ))}
          </div>
        </div>
      </section>

      {/* Main Content Grid */}
      <section className="pb-12 sm:pb-16 md:pb-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-10 lg:gap-12">
            {/* Contact Form */}
            <div>
              <HoloCard variant="glow">
                <HoloCardHeader>
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                    <div>
                      <HoloCardTitle className="text-lg sm:text-xl">Send us a message</HoloCardTitle>
                      <HoloCardDescription className="text-xs sm:text-sm">
                        Fill out the form below and we'll get back to you as soon as possible.
                      </HoloCardDescription>
                    </div>
                    <HoloBadge variant="default" className="flex items-center gap-1 shrink-0">
                      <Clock className="h-3 w-3" />
                      <span className="text-[10px] sm:text-xs">~24h response</span>
                    </HoloBadge>
                  </div>
                </HoloCardHeader>
                <HoloCardContent>
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 sm:space-y-6">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                        <FormField
                          control={form.control}
                          name="name"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-sm">Name</FormLabel>
                              <FormControl>
                                <Input placeholder="Your name" {...field} className="h-11 touch-manipulation" />
                              </FormControl>
                              <FormMessage className="text-xs" />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="email"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-sm">Email</FormLabel>
                              <FormControl>
                                <Input type="email" placeholder="you@example.com" {...field} className="h-11 touch-manipulation" />
                              </FormControl>
                              <FormMessage className="text-xs" />
                            </FormItem>
                          )}
                        />
                      </div>
                      <FormField
                        control={form.control}
                        name="subject"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm">Subject</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger className="h-11 touch-manipulation">
                                  <SelectValue placeholder="Select a topic" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {subjectOptions.map((option) => (
                                  <SelectItem key={option.value} value={option.value} className="touch-manipulation">
                                    {option.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage className="text-xs" />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="message"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm">Message</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="How can we help you?"
                                className="min-h-[100px] sm:min-h-[120px] resize-none touch-manipulation"
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage className="text-xs" />
                          </FormItem>
                        )}
                      />
                      <Button type="submit" className="w-full min-h-[48px] touch-manipulation active:scale-[0.98] transition-transform" disabled={isSubmitting}>
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
                </HoloCardContent>
              </HoloCard>
            </div>

            {/* FAQ Accordion */}
            <div>
              <GlowText as="h2" variant="primary" intensity="low" className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">
                Frequently Asked Questions
              </GlowText>
              <Accordion type="single" collapsible className="space-y-2">
                {contactFAQs.slice(0, 8).map((faq, index) => (
                  <AccordionItem 
                    key={index} 
                    value={`faq-${index}`}
                    className="border border-border rounded-lg px-3 sm:px-4 data-[state=open]:border-primary/30"
                  >
                    <AccordionTrigger className="text-left hover:no-underline py-3 sm:py-4 touch-manipulation">
                      <span className="font-medium text-xs sm:text-sm">{faq.question}</span>
                    </AccordionTrigger>
                    <AccordionContent className="text-xs sm:text-sm text-muted-foreground pb-3 sm:pb-4">
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
              
              <p className="text-xs sm:text-sm text-muted-foreground mt-4 sm:mt-6">
                Can't find what you're looking for?{" "}
                <a href="mailto:support@kernel.cool" className="text-primary hover:underline touch-manipulation">
                  Email us directly
                </a>
              </p>
            </div>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
