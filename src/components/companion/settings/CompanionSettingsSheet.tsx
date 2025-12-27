import { useState } from 'react';
import { motion } from 'framer-motion';
import { Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { PersonalityCustomizer } from './PersonalityCustomizer';
import { ConversationExporter } from './ConversationExporter';
import { VoiceSettingsPanel } from '../voice/VoiceSettingsPanel';
import { supabase } from '@/integrations/supabase/client';
import { PERSONALITY_COLORS, PERSONALITY_ICONS } from '@/constants/companion';
import type { CompanionProfile, CompanionRelationship, CompanionConversation } from '@/types/companion';
import type { VoiceSettings } from '@/hooks/useCompanionVoiceSettings';

interface CompanionSettingsSheetProps {
  companion: CompanionProfile;
  relationship: CompanionRelationship;
  conversations: CompanionConversation[];
  voiceSettings: VoiceSettings;
  onVoiceSettingsChange: (settings: VoiceSettings) => void;
  trigger?: React.ReactNode;
}

export function CompanionSettingsSheet({
  companion,
  relationship,
  conversations,
  voiceSettings,
  onVoiceSettingsChange,
  trigger,
}: CompanionSettingsSheetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const color = PERSONALITY_COLORS[companion.personality_type] || PERSONALITY_COLORS.mentor;
  const icon = PERSONALITY_ICONS[companion.personality_type] || PERSONALITY_ICONS.mentor;

  const handleSaveTraits = async (traits: Record<string, number>) => {
    const { error } = await supabase
      .from('companion_relationships')
      .update({
        memory_context: {
          ...relationship.memory_context,
          custom_traits: traits
        }
      })
      .eq('id', relationship.id);

    if (error) throw error;
  };

  const defaultTrigger = (
    <Button variant="ghost" size="icon" className="h-8 w-8">
      <Settings className="h-4 w-4" />
    </Button>
  );

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        {trigger || defaultTrigger}
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-lg p-0 flex flex-col">
        <SheetHeader className="p-6 pb-0">
          <SheetTitle className="flex items-center gap-3">
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="text-2xl"
            >
              {icon}
            </motion.span>
            <span>{companion.name} Settings</span>
          </SheetTitle>
        </SheetHeader>

        <Tabs defaultValue="voice" className="flex-1 flex flex-col">
          <div className="px-6 pt-4">
            <TabsList className="w-full">
              <TabsTrigger value="voice" className="flex-1">Voice</TabsTrigger>
              <TabsTrigger value="personality" className="flex-1">Personality</TabsTrigger>
              <TabsTrigger value="export" className="flex-1">Export</TabsTrigger>
            </TabsList>
          </div>

          <ScrollArea className="flex-1 px-6 py-4">
            <TabsContent value="voice" className="m-0">
              <VoiceSettingsPanel
                companion={companion}
                settings={voiceSettings}
                onSettingsChange={onVoiceSettingsChange}
              />
            </TabsContent>

            <TabsContent value="personality" className="m-0">
              <PersonalityCustomizer
                companion={companion}
                relationship={relationship}
                onSave={handleSaveTraits}
              />
            </TabsContent>

            <TabsContent value="export" className="m-0">
              <ConversationExporter
                companion={companion}
                relationship={relationship}
                conversations={conversations}
              />
            </TabsContent>
          </ScrollArea>
        </Tabs>

        {/* Footer */}
        <div className="p-4 border-t bg-muted/30">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Relationship Level</span>
            <span className="font-medium" style={{ color }}>
              {relationship.affinity_level}/100
            </span>
          </div>
          <div className="flex items-center justify-between text-sm mt-1">
            <span className="text-muted-foreground">Total Messages</span>
            <span className="font-medium">{relationship.total_messages}</span>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
