import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { User, CreditCard, Shield, Bot, Palette, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';

export type SettingsTab = 'account' | 'subscription' | 'security' | 'ai' | 'appearance' | 'advanced';

interface SettingsTabsProps {
  defaultTab?: SettingsTab;
  children: React.ReactNode;
}

const tabs = [
  { id: 'account', label: 'Account', icon: User },
  { id: 'subscription', label: 'Billing', icon: CreditCard },
  { id: 'security', label: 'Security', icon: Shield },
  { id: 'ai', label: 'AI & Chat', icon: Bot },
  { id: 'appearance', label: 'Appearance', icon: Palette },
  { id: 'advanced', label: 'Advanced', icon: Zap },
] as const;

export function SettingsTabs({ defaultTab = 'account', children }: SettingsTabsProps) {
  const [activeTab, setActiveTab] = useState<SettingsTab>(defaultTab);

  return (
    <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as SettingsTab)} className="w-full">
      <TabsList className="w-full flex flex-wrap h-auto gap-1 p-1 bg-muted/50 mb-6">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <TabsTrigger
              key={tab.id}
              value={tab.id}
              className={cn(
                "flex-1 min-w-[100px] gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm",
                "py-2 px-3"
              )}
            >
              <Icon className="h-4 w-4" />
              <span className="hidden sm:inline">{tab.label}</span>
            </TabsTrigger>
          );
        })}
      </TabsList>
      {children}
    </Tabs>
  );
}

export function SettingsTabContent({ 
  value, 
  children,
  className 
}: { 
  value: SettingsTab; 
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <TabsContent value={value} className={cn("space-y-6", className)}>
      {children}
    </TabsContent>
  );
}
