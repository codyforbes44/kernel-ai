// Milestone checking and awarding utilities

import type { Relationship, Milestone } from './types.ts';

// Message milestone definitions
const MESSAGE_MILESTONES = [
  { id: 'first_message', trigger: 1, title: 'First Words', description: 'Started your journey together' },
  { id: 'messages_10', trigger: 10, title: 'Getting Acquainted', description: 'Exchanged 10 messages' },
  { id: 'messages_50', trigger: 50, title: 'Building Connection', description: 'Reached 50 messages' },
  { id: 'messages_100', trigger: 100, title: 'Strong Bond', description: 'Shared 100 messages together' },
  { id: 'messages_500', trigger: 500, title: 'True Companion', description: 'An incredible 500 message milestone' },
];

// Affinity milestone definitions
const AFFINITY_MILESTONES = [
  { id: 'affinity_25', trigger: 25, title: 'Friendly Connection', description: 'Reached 25 affinity' },
  { id: 'affinity_50', trigger: 50, title: 'True Friend', description: 'Reached 50 affinity' },
  { id: 'affinity_75', trigger: 75, title: 'Close Bond', description: 'Reached 75 affinity' },
  { id: 'affinity_100', trigger: 100, title: 'Soulmate', description: 'Maximum affinity achieved!' },
];

// Check and award milestones
export function checkMilestones(relationship: Relationship, newMessageCount: number): Milestone[] {
  const milestones = [...relationship.milestones];
  const existingIds = new Set(milestones.map(m => m.id));
  
  // Check message milestones
  for (const milestone of MESSAGE_MILESTONES) {
    if (!existingIds.has(milestone.id) && newMessageCount >= milestone.trigger) {
      milestones.push({
        ...milestone,
        achieved_at: new Date().toISOString()
      });
    }
  }
  
  // Check affinity milestones
  for (const milestone of AFFINITY_MILESTONES) {
    if (!existingIds.has(milestone.id) && relationship.affinity_level >= milestone.trigger) {
      milestones.push({
        ...milestone,
        achieved_at: new Date().toISOString()
      });
    }
  }
  
  return milestones;
}
