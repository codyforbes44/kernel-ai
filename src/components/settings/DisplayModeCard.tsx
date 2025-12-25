import { useTheme } from 'next-themes';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Badge } from '@/components/ui/badge';
import { Sun, Moon, Smartphone, Monitor, Sunset, Battery, Zap } from 'lucide-react';
import { useOLEDSuggestion } from '@/hooks/useOLEDSuggestion';

interface ThemeOption {
  value: string;
  label: string;
  description: string;
  icon: React.ReactNode;
  preview: {
    bg: string;
    accent: string;
    border: string;
  };
  badge?: {
    text: string;
    icon?: React.ReactNode;
  };
}

const themeOptions: ThemeOption[] = [
  {
    value: 'light',
    label: 'Light',
    description: 'Clean and bright',
    icon: <Sun className="h-4 w-4" />,
    preview: {
      bg: 'bg-[hsl(200,20%,98%)]',
      accent: 'bg-[hsl(185,100%,40%)]',
      border: 'border-[hsl(200,20%,88%)]',
    },
  },
  {
    value: 'dark',
    label: 'Dark',
    description: 'Standard dark theme',
    icon: <Moon className="h-4 w-4" />,
    preview: {
      bg: 'bg-[hsl(220,30%,5%)]',
      accent: 'bg-[hsl(185,100%,50%)]',
      border: 'border-[hsl(220,25%,18%)]',
    },
  },
  {
    value: 'oled',
    label: 'OLED',
    description: 'Pure black for OLED',
    icon: <Smartphone className="h-4 w-4" />,
    preview: {
      bg: 'bg-black',
      accent: 'bg-[hsl(185,100%,50%)]',
      border: 'border-[hsl(185,100%,50%)/0.3]',
    },
    badge: {
      text: 'Saves Battery',
      icon: <Battery className="h-3 w-3" />,
    },
  },
  {
    value: 'dim',
    label: 'Dim',
    description: 'Warm, reduced brightness',
    icon: <Sunset className="h-4 w-4" />,
    preview: {
      bg: 'bg-[hsl(30,8%,6%)]',
      accent: 'bg-[hsl(175,60%,45%)]',
      border: 'border-[hsl(30,10%,20%)]',
    },
    badge: {
      text: 'Night Mode',
    },
  },
  {
    value: 'system',
    label: 'System',
    description: 'Match OS settings',
    icon: <Monitor className="h-4 w-4" />,
    preview: {
      bg: 'bg-gradient-to-br from-[hsl(200,20%,98%)] to-[hsl(220,30%,5%)]',
      accent: 'bg-[hsl(185,100%,45%)]',
      border: 'border-muted',
    },
  },
];

export function DisplayModeCard() {
  const { theme, setTheme } = useTheme();
  const { isLikelyOLED, isMobile } = useOLEDSuggestion();

  const getThemeDescription = () => {
    switch (theme) {
      case 'system':
        return 'Theme will automatically match your system preferences';
      case 'oled':
        return 'Pure black for OLED displays - maximizes battery savings';
      case 'dim':
        return 'Warmer tones with reduced brightness - ideal for night reading';
      default:
        return `Using ${theme} theme`;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {theme === 'light' ? (
            <Sun className="h-5 w-5" />
          ) : theme === 'dim' ? (
            <Sunset className="h-5 w-5" />
          ) : theme === 'oled' ? (
            <Smartphone className="h-5 w-5" />
          ) : (
            <Moon className="h-5 w-5" />
          )}
          Display Mode
        </CardTitle>
        <CardDescription>Choose your preferred visual theme</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <RadioGroup
          value={theme}
          onValueChange={setTheme}
          className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3"
        >
          {themeOptions.map((option) => {
            const isRecommended = option.value === 'oled' && isLikelyOLED && isMobile;
            
            return (
              <Label
                key={option.value}
                htmlFor={`theme-${option.value}`}
                className="relative flex flex-col gap-2 p-3 rounded-lg border-2 cursor-pointer transition-all hover:bg-muted/50 [&:has([data-state=checked])]:border-primary [&:has([data-state=checked])]:bg-primary/5"
              >
                <RadioGroupItem
                  value={option.value}
                  id={`theme-${option.value}`}
                  className="sr-only"
                />
                
                {/* Theme Preview */}
                <div
                  className={`relative w-full aspect-[4/3] rounded-md ${option.preview.bg} ${option.preview.border} border overflow-hidden`}
                >
                  {/* Mini UI preview */}
                  <div className="absolute inset-1 flex flex-col gap-1">
                    {/* Header bar */}
                    <div className={`h-1.5 w-8 rounded-full ${option.preview.accent} opacity-80`} />
                    {/* Content lines */}
                    <div className="flex-1 flex flex-col gap-0.5 mt-1">
                      <div className={`h-1 w-full rounded-full ${option.preview.accent} opacity-20`} />
                      <div className={`h-1 w-3/4 rounded-full ${option.preview.accent} opacity-15`} />
                      <div className={`h-1 w-1/2 rounded-full ${option.preview.accent} opacity-10`} />
                    </div>
                  </div>
                </div>

                {/* Label and badges */}
                <div className="flex items-center justify-between gap-1">
                  <div className="flex items-center gap-1.5">
                    {option.icon}
                    <span className="text-sm font-medium">{option.label}</span>
                  </div>
                </div>

                {/* Badge */}
                {option.badge && (
                  <Badge
                    variant="secondary"
                    className="absolute -top-1.5 -right-1.5 text-[10px] px-1.5 py-0.5 bg-primary/10 text-primary border-0 gap-0.5"
                  >
                    {option.badge.icon}
                    {option.badge.text}
                  </Badge>
                )}

                {/* Recommended badge for OLED devices */}
                {isRecommended && (
                  <Badge
                    variant="secondary"
                    className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 text-[9px] px-1.5 py-0.5 bg-success/10 text-success border-0 gap-0.5 whitespace-nowrap"
                  >
                    <Zap className="h-2.5 w-2.5" />
                    Recommended
                  </Badge>
                )}
              </Label>
            );
          })}
        </RadioGroup>

        <p className="text-xs text-muted-foreground">{getThemeDescription()}</p>

        {/* OLED Info Banner */}
        {theme === 'oled' && (
          <div className="flex items-start gap-3 p-3 rounded-lg bg-primary/5 border border-primary/20">
            <Battery className="h-5 w-5 text-primary shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="text-sm font-medium text-foreground">Battery Optimization Active</p>
              <p className="text-xs text-muted-foreground">
                OLED displays use no power for pure black pixels, reducing battery consumption significantly.
              </p>
            </div>
          </div>
        )}

        {/* Dim Mode Info Banner */}
        {theme === 'dim' && (
          <div className="flex items-start gap-3 p-3 rounded-lg bg-accent/5 border border-accent/20">
            <Sunset className="h-5 w-5 text-accent shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="text-sm font-medium text-foreground">Night Mode Active</p>
              <p className="text-xs text-muted-foreground">
                Warmer color temperature and reduced contrast for comfortable nighttime reading.
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
