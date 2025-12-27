import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Save, RotateCcw, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { PERSONALITY_COLORS } from '@/constants/companion';
import type { CompanionProfile, CompanionRelationship } from '@/types/companion';

interface PersonalityCustomizerProps {
  companion: CompanionProfile;
  relationship: CompanionRelationship;
  onSave: (traits: Record<string, number>) => Promise<void>;
}

interface TraitConfig {
  key: string;
  label: string;
  description: string;
  lowLabel: string;
  highLabel: string;
  emoji: string;
}

const TRAIT_CONFIGS: TraitConfig[] = [
  {
    key: 'empathy',
    label: 'Empathy',
    description: 'How emotionally supportive responses are',
    lowLabel: 'Objective',
    highLabel: 'Compassionate',
    emoji: '💗',
  },
  {
    key: 'formality',
    label: 'Formality',
    description: 'Communication style from casual to professional',
    lowLabel: 'Casual',
    highLabel: 'Professional',
    emoji: '🎩',
  },
  {
    key: 'humor',
    label: 'Humor',
    description: 'How playful and witty responses are',
    lowLabel: 'Serious',
    highLabel: 'Playful',
    emoji: '😄',
  },
  {
    key: 'curiosity',
    label: 'Curiosity',
    description: 'How many follow-up questions are asked',
    lowLabel: 'Direct',
    highLabel: 'Inquisitive',
    emoji: '🔍',
  },
  {
    key: 'patience',
    label: 'Patience',
    description: 'Detail and explanation depth',
    lowLabel: 'Concise',
    highLabel: 'Thorough',
    emoji: '🧘',
  },
];

export function PersonalityCustomizer({ companion, relationship, onSave }: PersonalityCustomizerProps) {
  const [traits, setTraits] = useState<Record<string, number>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  const color = PERSONALITY_COLORS[companion.personality_type] || PERSONALITY_COLORS.mentor;

  // Initialize traits from companion profile
  useEffect(() => {
    const initialTraits: Record<string, number> = {};
    TRAIT_CONFIGS.forEach(({ key }) => {
      initialTraits[key] = companion.personality_traits?.[key as keyof typeof companion.personality_traits] ?? 50;
    });
    setTraits(initialTraits);
  }, [companion.personality_traits]);

  const handleTraitChange = (key: string, value: number[]) => {
    setTraits(prev => ({ ...prev, [key]: value[0] }));
    setHasChanges(true);
  };

  const handleReset = () => {
    const resetTraits: Record<string, number> = {};
    TRAIT_CONFIGS.forEach(({ key }) => {
      resetTraits[key] = 50;
    });
    setTraits(resetTraits);
    setHasChanges(true);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSave(traits);
      setHasChanges(false);
      toast.success('Personality updated', { description: `${companion.name}'s traits have been customized.` });
    } catch (error) {
      toast.error('Failed to save', { description: (error as Error).message });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card className="border-0 bg-transparent">
      <CardHeader className="px-0 pt-0">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5" style={{ color }} />
              Personality Tuning
            </CardTitle>
            <CardDescription>
              Adjust {companion.name}'s personality traits to your preference
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleReset}
              disabled={isSaving}
            >
              <RotateCcw className="h-4 w-4 mr-1" />
              Reset
            </Button>
            <Button
              size="sm"
              onClick={handleSave}
              disabled={!hasChanges || isSaving}
            >
              <Save className="h-4 w-4 mr-1" />
              {isSaving ? 'Saving...' : 'Save'}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="px-0 space-y-6">
        {TRAIT_CONFIGS.map((config, index) => (
          <motion.div
            key={config.key}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="space-y-3"
          >
            <div className="flex items-center justify-between">
              <Label className="flex items-center gap-2 text-sm font-medium">
                <span>{config.emoji}</span>
                {config.label}
              </Label>
              <span 
                className="text-sm font-semibold tabular-nums"
                style={{ color }}
              >
                {traits[config.key] ?? 50}%
              </span>
            </div>
            <div className="space-y-1">
              <Slider
                value={[traits[config.key] ?? 50]}
                onValueChange={(value) => handleTraitChange(config.key, value)}
                max={100}
                min={0}
                step={5}
                className="cursor-pointer"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{config.lowLabel}</span>
                <span>{config.highLabel}</span>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">{config.description}</p>
          </motion.div>
        ))}

        {/* Preview section */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="p-4 rounded-lg bg-muted/50 border"
        >
          <h4 className="text-sm font-medium mb-2">Personality Preview</h4>
          <p className="text-sm text-muted-foreground">
            {companion.name} will be{' '}
            {(traits.empathy ?? 50) > 60 ? 'emotionally supportive' : 'objective'},{' '}
            {(traits.formality ?? 50) > 60 ? 'professionally-spoken' : 'casual'},{' '}
            {(traits.humor ?? 50) > 60 ? 'playful and witty' : 'focused and serious'},{' '}
            {(traits.curiosity ?? 50) > 60 ? 'curious about your experiences' : 'direct in responses'}, and{' '}
            {(traits.patience ?? 50) > 60 ? 'thorough in explanations' : 'concise in answers'}.
          </p>
        </motion.div>
      </CardContent>
    </Card>
  );
}
