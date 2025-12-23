// Legacy re-exports for backwards compatibility
// New code should import from '@/hooks/useStaticData' instead

export interface FAQItem {
  question: string;
  answer: string;
  category?: string;
}

// These are now loaded dynamically via useStaticData hooks
// Keeping empty arrays for backwards compatibility with any direct imports
// Components should migrate to use usePricingFAQs() and useContactFAQs() hooks

/** @deprecated Use usePricingFAQs() hook instead */
export const pricingFAQs: FAQItem[] = [];

/** @deprecated Use useContactFAQs() hook instead */
export const contactFAQs: FAQItem[] = [];

/** @deprecated Use usePricingFAQs() and useContactFAQs() hooks instead */
export const generalFAQs: FAQItem[] = [];

// Re-export types for convenience
export type { FAQItem as FAQ };
