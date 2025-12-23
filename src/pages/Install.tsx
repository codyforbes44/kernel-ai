import { useState } from 'react';
import { PublicLayout } from '@/components/layout/PublicLayout';
import { SEO } from '@/components/seo/SEO';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { usePWA } from '@/hooks/usePWA';
import { 
  Download, 
  Share, 
  MoreVertical, 
  Plus, 
  Smartphone,
  CheckCircle2,
  ArrowRight,
  Chrome,
  Globe
} from 'lucide-react';
import { motion } from 'framer-motion';

const AppleIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
  </svg>
);

const AndroidIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
    <path d="M17.6 9.48l1.84-3.18c.16-.31.04-.69-.26-.85-.29-.15-.65-.06-.83.22l-1.88 3.24c-1.43-.65-3.02-1.01-4.72-1.01-1.7 0-3.29.36-4.72 1.01L5.15 5.67c-.18-.28-.54-.37-.83-.22-.3.16-.42.54-.26.85l1.84 3.18C2.88 11.13.88 14.45.88 18.38h22.24c0-3.93-2-7.25-5.52-8.9zM7 15.25c-.69 0-1.25-.56-1.25-1.25 0-.69.56-1.25 1.25-1.25s1.25.56 1.25 1.25c0 .69-.56 1.25-1.25 1.25zm10 0c-.69 0-1.25-.56-1.25-1.25 0-.69.56-1.25 1.25-1.25s1.25.56 1.25 1.25c0 .69-.56 1.25-1.25 1.25z"/>
  </svg>
);

interface StepProps {
  number: number;
  title: string;
  description: string;
  icon: React.ReactNode;
}

function Step({ number, title, description, icon }: StepProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: number * 0.1 }}
      className="flex gap-4"
    >
      <div className="flex-shrink-0">
        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
          {icon}
        </div>
      </div>
      <div className="flex-1 pt-1">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs font-medium text-muted-foreground">Step {number}</span>
        </div>
        <h3 className="font-semibold text-foreground mb-1">{title}</h3>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
    </motion.div>
  );
}

export default function Install() {
  const { isInstallable, isInstalled, installApp } = usePWA();
  const [isInstalling, setIsInstalling] = useState(false);

  const handleInstall = async () => {
    setIsInstalling(true);
    await installApp();
    setIsInstalling(false);
  };

  const iosSteps = [
    {
      icon: <Globe className="w-5 h-5" />,
      title: "Open in Safari",
      description: "Make sure you're viewing this page in Safari browser. The install feature only works in Safari on iOS."
    },
    {
      icon: <Share className="w-5 h-5" />,
      title: "Tap the Share button",
      description: "Look for the Share icon at the bottom of the screen (square with an arrow pointing up) and tap it."
    },
    {
      icon: <Plus className="w-5 h-5" />,
      title: "Select 'Add to Home Screen'",
      description: "Scroll down in the share menu and tap 'Add to Home Screen'. You may need to scroll to find it."
    },
    {
      icon: <CheckCircle2 className="w-5 h-5" />,
      title: "Confirm the installation",
      description: "Tap 'Add' in the top right corner. The app icon will appear on your home screen."
    }
  ];

  const androidChromeSteps = [
    {
      icon: <Chrome className="w-5 h-5" />,
      title: "Open in Chrome",
      description: "Make sure you're viewing this page in Google Chrome browser for the best experience."
    },
    {
      icon: <MoreVertical className="w-5 h-5" />,
      title: "Tap the menu button",
      description: "Tap the three dots (⋮) in the top right corner of Chrome to open the menu."
    },
    {
      icon: <Download className="w-5 h-5" />,
      title: "Select 'Install app' or 'Add to Home screen'",
      description: "Look for 'Install app' or 'Add to Home screen' in the menu and tap it."
    },
    {
      icon: <CheckCircle2 className="w-5 h-5" />,
      title: "Confirm the installation",
      description: "Tap 'Install' in the popup. The app will be added to your home screen and app drawer."
    }
  ];

  return (
    <PublicLayout>
      <SEO
        title="Install Kernel App"
        description="Install Kernel on your device for the best experience. Works offline, loads instantly, and feels like a native app."
        keywords={['install', 'pwa', 'app', 'mobile', 'download']}
        ogImage="/og-images/default.png"
      />

      <div className="min-h-screen bg-background">
        {/* Hero Section */}
        <section className="relative py-16 md:py-24 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent" />
          <div className="container mx-auto px-4 relative">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-2xl mx-auto text-center"
            >
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-primary/10 mb-6">
                <Smartphone className="w-10 h-10 text-primary" />
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                Install Kernel on Your Device
              </h1>
              <p className="text-lg text-muted-foreground mb-8">
                Get the full app experience. Install Kernel to your home screen for instant access, offline support, and a native app feel.
              </p>

              {/* Direct Install Button (if supported) */}
              {isInstallable && !isInstalled && (
                <Button
                  size="lg"
                  onClick={handleInstall}
                  disabled={isInstalling}
                  className="mb-4"
                >
                  <Download className="w-4 h-4 mr-2" />
                  {isInstalling ? 'Installing...' : 'Install Now'}
                </Button>
              )}

              {isInstalled && (
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-500/10 text-green-600 dark:text-green-400">
                  <CheckCircle2 className="w-5 h-5" />
                  <span className="font-medium">App installed successfully!</span>
                </div>
              )}
            </motion.div>
          </div>
        </section>

        {/* Benefits */}
        <section className="py-12 border-y border-border bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              {[
                { icon: '⚡', title: 'Instant Loading', description: 'Opens immediately, no waiting' },
                { icon: '📴', title: 'Works Offline', description: 'Access your work anywhere' },
                { icon: '🔔', title: 'Stay Updated', description: 'Get notified of new features' }
              ].map((benefit, i) => (
                <motion.div
                  key={benefit.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="text-center"
                >
                  <span className="text-3xl mb-2 block">{benefit.icon}</span>
                  <h3 className="font-semibold text-foreground">{benefit.title}</h3>
                  <p className="text-sm text-muted-foreground">{benefit.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Installation Instructions */}
        <section className="py-16 md:py-24">
          <div className="container mx-auto px-4">
            <div className="max-w-2xl mx-auto">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-center mb-12"
              >
                <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
                  How to Install
                </h2>
                <p className="text-muted-foreground">
                  Follow the steps below for your device
                </p>
              </motion.div>

              <Tabs defaultValue="ios" className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-8">
                  <TabsTrigger value="ios" className="gap-2">
                    <AppleIcon />
                    iPhone / iPad
                  </TabsTrigger>
                  <TabsTrigger value="android" className="gap-2">
                    <AndroidIcon />
                    Android
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="ios">
                  <Card>
                    <CardContent className="pt-6">
                      <div className="space-y-8">
                        {iosSteps.map((step, index) => (
                          <Step
                            key={step.title}
                            number={index + 1}
                            title={step.title}
                            description={step.description}
                            icon={step.icon}
                          />
                        ))}
                      </div>

                      <div className="mt-8 p-4 rounded-lg bg-muted/50 border border-border">
                        <p className="text-sm text-muted-foreground">
                          <strong className="text-foreground">Note:</strong> On iOS, you must use Safari browser. 
                          Chrome and other browsers on iOS don't support installing web apps to the home screen.
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="android">
                  <Card>
                    <CardContent className="pt-6">
                      <div className="space-y-8">
                        {androidChromeSteps.map((step, index) => (
                          <Step
                            key={step.title}
                            number={index + 1}
                            title={step.title}
                            description={step.description}
                            icon={step.icon}
                          />
                        ))}
                      </div>

                      <div className="mt-8 p-4 rounded-lg bg-muted/50 border border-border">
                        <p className="text-sm text-muted-foreground">
                          <strong className="text-foreground">Tip:</strong> If you see an "Install" banner at the bottom of the screen, 
                          you can tap it directly to install the app.
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 bg-muted/30 border-t border-border">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-xl font-semibold text-foreground mb-4">
              Ready to get started?
            </h2>
            <p className="text-muted-foreground mb-6">
              Install now and enjoy the full Kernel experience
            </p>
            <Button asChild>
              <a href="/">
                Go to App
                <ArrowRight className="w-4 h-4 ml-2" />
              </a>
            </Button>
          </div>
        </section>
      </div>
    </PublicLayout>
  );
}
