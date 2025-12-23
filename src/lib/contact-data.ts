import { Mail, MessageSquare, Phone } from "lucide-react";

export interface ContactOption {
  icon: typeof Mail;
  title: string;
  description: string;
  action: string;
  href: string;
}

export const contactOptions: ContactOption[] = [
  {
    icon: Mail,
    title: "Email Us",
    description: "Get a response within 24 hours",
    action: "support@kernel.cool",
    href: "mailto:support@kernel.cool",
  },
  {
    icon: MessageSquare,
    title: "Live Chat",
    description: "Available Mon-Fri, 9am-6pm EST",
    action: "Start a conversation",
    href: "#chat",
  },
  {
    icon: Phone,
    title: "Phone Support",
    description: "For Enterprise customers",
    action: "+1 (555) 123-4567",
    href: "tel:+15551234567",
  },
];

export const subjectOptions = [
  { value: "general", label: "General Inquiry" },
  { value: "support", label: "Technical Support" },
  { value: "billing", label: "Billing Question" },
  { value: "enterprise", label: "Enterprise Sales" },
  { value: "partnership", label: "Partnership" },
  { value: "feedback", label: "Product Feedback" },
] as const;

export type SubjectValue = typeof subjectOptions[number]["value"];
