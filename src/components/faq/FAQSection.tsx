import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { FAQItem } from "@/lib/faq-data";

interface FAQSectionProps {
  faqs: FAQItem[];
  title?: string;
  description?: string;
  showCategories?: boolean;
}

export function FAQSection({ 
  faqs, 
  title = "Frequently Asked Questions",
  description,
  showCategories = false 
}: FAQSectionProps) {
  // Group FAQs by category if showCategories is true
  const groupedFAQs = showCategories
    ? faqs.reduce((acc, faq) => {
        const category = faq.category || "General";
        if (!acc[category]) acc[category] = [];
        acc[category].push(faq);
        return acc;
      }, {} as Record<string, FAQItem[]>)
    : { all: faqs };

  return (
    <section className="py-16 md:py-24">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">{title}</h2>
          {description && (
            <p className="text-lg text-muted-foreground">{description}</p>
          )}
        </div>

        <div className="max-w-2xl mx-auto">
          {showCategories ? (
            Object.entries(groupedFAQs).map(([category, items]) => (
              <div key={category} className="mb-8">
                <h3 className="text-lg font-semibold mb-4 text-primary">
                  {category}
                </h3>
                <Accordion type="single" collapsible className="space-y-2">
                  {items.map((faq, index) => (
                    <AccordionItem
                      key={index}
                      value={`${category}-${index}`}
                      className="border border-border/50 rounded-lg px-4 bg-card/50"
                    >
                      <AccordionTrigger className="text-left hover:no-underline">
                        {faq.question}
                      </AccordionTrigger>
                      <AccordionContent className="text-muted-foreground">
                        {faq.answer}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </div>
            ))
          ) : (
            <Accordion type="single" collapsible className="space-y-2">
              {faqs.map((faq, index) => (
                <AccordionItem
                  key={index}
                  value={`faq-${index}`}
                  className="border border-border/50 rounded-lg px-4 bg-card/50"
                >
                  <AccordionTrigger className="text-left hover:no-underline">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          )}
        </div>
      </div>
    </section>
  );
}
