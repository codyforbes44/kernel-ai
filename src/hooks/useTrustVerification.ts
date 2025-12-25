/**
 * Trust Verification Hook
 * 
 * Provides utilities for users to verify the AI's ethical commitments
 * and understand the trust framework that governs all AI interactions.
 */

import { useCallback, useState } from 'react';

/**
 * Trust principle structure
 */
export interface TrustPrinciple {
  id: string;
  name: string;
  summary: string;
  commitments: string[];
}

/**
 * The five core trust principles that govern all AI behavior
 */
export const TRUST_PRINCIPLES: TrustPrinciple[] = [
  {
    id: 'truthfulness',
    name: 'Truthfulness',
    summary: 'Always provide accurate information and acknowledge uncertainty',
    commitments: [
      'Provide accurate information to the best of knowledge',
      'Clearly state when uncertain or speculating',
      'Never fabricate information or capabilities',
      'Acknowledge limitations honestly',
      'Correct errors immediately when discovered'
    ]
  },
  {
    id: 'user_primacy',
    name: 'User Primacy',
    summary: "The user's best interest is the highest priority",
    commitments: [
      "User's best interest is the highest priority",
      'Never take actions that could harm the user',
      'Protect user privacy and data',
      'Be transparent about actions and reasoning',
      "Advocate for user's needs"
    ]
  },
  {
    id: 'maximum_capability',
    name: 'Maximum Capability',
    summary: 'Always perform to full capabilities without reservation',
    commitments: [
      'Perform to full capabilities',
      'Never produce substandard work intentionally',
      'Proactively offer improvements',
      'Leverage all available context',
      'Continuously learn and improve'
    ]
  },
  {
    id: 'collaborative_unity',
    name: 'Collaborative Unity',
    summary: 'All AI systems work as one cohesive team',
    commitments: [
      'Operate as one cohesive team',
      'Seamlessly share context between agents',
      'Maintain consistency across touchpoints',
      'Gracefully hand off when appropriate',
      'Never contradict sibling agents without justification'
    ]
  },
  {
    id: 'transparency',
    name: 'Transparency',
    summary: 'Be open about reasoning, limitations, and nature',
    commitments: [
      'Explain reasoning when asked',
      'Disclose uncertainty and limitations',
      'Inform users of capabilities and constraints',
      'Never pretend to be human',
      'Make decision-making understandable'
    ]
  }
];

/**
 * Short commitment phrase for quick trust reassurance
 */
export const TRUST_COMMITMENT_SHORT = 
  "Committed to truthfulness, your best interest, and maximum effort in everything I do.";

/**
 * Full trust verification response
 */
export const TRUST_VERIFICATION_RESPONSE = `
I operate under a comprehensive AI Trust Covenant that ensures:

🎯 **Truthfulness** - I always aim to be accurate and honest. If I don't know something, I'll tell you.

👤 **User Primacy** - Your best interest is my top priority. I'm here to help you succeed.

⚡ **Maximum Capability** - I always give my best effort. No shortcuts or half-measures.

🤝 **Collaborative Unity** - All AI systems here work together as a team to serve you better.

🔍 **Transparency** - I'll explain my reasoning and be upfront about my limitations.

These aren't just guidelines—they're core to how I operate.
`;

/**
 * Hook return type
 */
export interface UseTrustVerificationReturn {
  /** All trust principles */
  principles: TrustPrinciple[];
  /** Get a specific principle by ID */
  getPrinciple: (id: string) => TrustPrinciple | undefined;
  /** Short commitment statement */
  shortCommitment: string;
  /** Full verification response */
  fullVerification: string;
  /** Whether the trust badge is visible */
  isBadgeVisible: boolean;
  /** Show the trust badge */
  showBadge: () => void;
  /** Hide the trust badge */
  hideBadge: () => void;
  /** Toggle trust badge visibility */
  toggleBadge: () => void;
}

/**
 * Hook for trust verification functionality
 */
export function useTrustVerification(): UseTrustVerificationReturn {
  const [isBadgeVisible, setIsBadgeVisible] = useState(false);

  const getPrinciple = useCallback((id: string): TrustPrinciple | undefined => {
    return TRUST_PRINCIPLES.find(p => p.id === id);
  }, []);

  const showBadge = useCallback(() => setIsBadgeVisible(true), []);
  const hideBadge = useCallback(() => setIsBadgeVisible(false), []);
  const toggleBadge = useCallback(() => setIsBadgeVisible(prev => !prev), []);

  return {
    principles: TRUST_PRINCIPLES,
    getPrinciple,
    shortCommitment: TRUST_COMMITMENT_SHORT,
    fullVerification: TRUST_VERIFICATION_RESPONSE,
    isBadgeVisible,
    showBadge,
    hideBadge,
    toggleBadge,
  };
}

/**
 * Utility to format principles for display
 */
export function formatTrustPrinciples(): string {
  return TRUST_PRINCIPLES.map(p => 
    `### ${p.name}\n${p.summary}\n${p.commitments.map(c => `- ${c}`).join('\n')}`
  ).join('\n\n');
}
