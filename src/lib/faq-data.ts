export interface FAQItem {
  question: string;
  answer: string;
  category?: string;
}

export const pricingFAQs: FAQItem[] = [
  {
    question: "Can I change plans anytime?",
    answer: "Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately, and we'll prorate any billing differences."
  },
  {
    question: "Is there a free trial?",
    answer: "Yes! Our Free plan lets you explore all basic features with no time limit. When you're ready for more, upgrading is seamless."
  },
  {
    question: "What payment methods do you accept?",
    answer: "We accept all major credit cards (Visa, MasterCard, American Express) and PayPal. Enterprise customers can also pay via invoice."
  },
  {
    question: "Can I cancel my subscription?",
    answer: "Absolutely. You can cancel anytime from your account settings. You'll continue to have access until the end of your billing period."
  }
];

export const contactFAQs: FAQItem[] = [
  {
    category: "Account",
    question: "How do I reset my password?",
    answer: "Click 'Forgot Password' on the login page. We'll send you a secure link to create a new password."
  },
  {
    category: "Account",
    question: "Can I change my email address?",
    answer: "Yes, go to Settings > Account and update your email. You'll need to verify the new address."
  },
  {
    category: "Billing",
    question: "When will I be charged?",
    answer: "Billing occurs at the start of each billing cycle. You can view your next billing date in Settings > Billing."
  },
  {
    category: "Billing",
    question: "How do I get a refund?",
    answer: "Contact our support team within 14 days of purchase. We offer full refunds for eligible requests."
  },
  {
    category: "Features",
    question: "What's included in the Pro plan?",
    answer: "Pro includes unlimited projects, priority support, advanced analytics, and all premium features."
  },
  {
    category: "Features",
    question: "Can I collaborate with my team?",
    answer: "Yes! Pro and Enterprise plans support team collaboration with role-based permissions."
  }
];

export const generalFAQs: FAQItem[] = [
  ...pricingFAQs,
  ...contactFAQs
];
