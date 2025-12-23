import { lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { AuthProvider } from "@/hooks/useAuth";
import { WorkspaceProvider } from "@/hooks/useWorkspace";
import { TemplateInjectionProvider } from "@/hooks/useTemplateInjection";
import { FeatureGatingProvider } from "@/hooks/useFeatureGating";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { useOLEDSuggestion } from "@/hooks/useOLEDSuggestion";
import { usePageTracking } from "@/hooks/usePageTracking";
import { CommandPalette } from "@/components/CommandPalette";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { UpdateNotification } from "@/components/pwa/UpdateNotification";
import { InstallPromptBanner } from "@/components/pwa/InstallPromptBanner";
import { FloatingInstallButton } from "@/components/pwa/FloatingInstallButton";
// Core pages - keep static for fast initial load
import Landing from "./pages/Landing";
import NotFound from "./pages/NotFound";

// Lazy load all other pages for better FCP
const Index = lazy(() => import("./pages/Index"));
const Auth = lazy(() => import("./pages/Auth"));
const Pricing = lazy(() => import("./pages/Pricing"));
const Contact = lazy(() => import("./pages/Contact"));
const About = lazy(() => import("./pages/About"));
const Privacy = lazy(() => import("./pages/Privacy"));
const Terms = lazy(() => import("./pages/Terms"));
const Changelog = lazy(() => import("./pages/Changelog"));
const Documentation = lazy(() => import("./pages/Documentation"));
const Tutorials = lazy(() => import("./pages/Tutorials"));
const TutorialDetail = lazy(() => import("./pages/TutorialDetail"));
const DocCategory = lazy(() => import("./pages/DocCategory"));
const DocDetail = lazy(() => import("./pages/DocDetail"));
const Security = lazy(() => import("./pages/Security"));
const Compare = lazy(() => import("./pages/Compare"));
const Install = lazy(() => import("./pages/Install"));

// Lazy load heavy pages
const Admin = lazy(() => import("./pages/Admin"));
const Settings = lazy(() => import("./pages/Settings"));
const Builder = lazy(() => import("./pages/Builder"));
const BuilderProject = lazy(() => import("./pages/BuilderProject"));
const SEODashboard = lazy(() => import("./pages/SEODashboard"));
const Onboarding = lazy(() => import("./pages/Onboarding"));
const Performance = lazy(() => import("./pages/Performance"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
    },
  },
});

function LoadingFallback() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

function ReducedMotionLoader() {
  // This hook loads the user's reduced motion preference and applies it
  useReducedMotion();
  return null;
}

function OLEDSuggestionLoader() {
  // This hook suggests OLED mode to mobile users on first visit
  useOLEDSuggestion();
  return null;
}

function PageTracker() {
  // This hook tracks page views for analytics
  usePageTracking();
  return null;
}

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
        <AuthProvider>
          <ReducedMotionLoader />
          <OLEDSuggestionLoader />
          <WorkspaceProvider>
            <FeatureGatingProvider>
            <TemplateInjectionProvider>
              <TooltipProvider>
                <Toaster />
                <Sonner />
                <UpdateNotification />
                <InstallPromptBanner />
                <FloatingInstallButton />
              <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
                <PageTracker />
                <CommandPalette />
                <Routes>
                  <Route path="/" element={<Landing />} />
                  <Route path="/pricing" element={<Suspense fallback={<LoadingFallback />}><Pricing /></Suspense>} />
                  <Route path="/contact" element={<Suspense fallback={<LoadingFallback />}><Contact /></Suspense>} />
                  <Route path="/about" element={<Suspense fallback={<LoadingFallback />}><About /></Suspense>} />
                  <Route path="/privacy" element={<Suspense fallback={<LoadingFallback />}><Privacy /></Suspense>} />
                  <Route path="/terms" element={<Suspense fallback={<LoadingFallback />}><Terms /></Suspense>} />
                  <Route path="/changelog" element={<Suspense fallback={<LoadingFallback />}><Changelog /></Suspense>} />
                  <Route path="/docs" element={<Suspense fallback={<LoadingFallback />}><Documentation /></Suspense>} />
                  <Route path="/docs/:categorySlug" element={<Suspense fallback={<LoadingFallback />}><DocCategory /></Suspense>} />
                  <Route path="/docs/:categorySlug/:slug" element={<Suspense fallback={<LoadingFallback />}><DocDetail /></Suspense>} />
                  <Route path="/tutorials" element={<Suspense fallback={<LoadingFallback />}><Tutorials /></Suspense>} />
                  <Route path="/tutorials/:slug" element={<Suspense fallback={<LoadingFallback />}><TutorialDetail /></Suspense>} />
                  <Route path="/security" element={<Suspense fallback={<LoadingFallback />}><Security /></Suspense>} />
                  <Route path="/compare" element={<Suspense fallback={<LoadingFallback />}><Compare /></Suspense>} />
                  <Route path="/install" element={<Suspense fallback={<LoadingFallback />}><Install /></Suspense>} />
                  <Route path="/assistant" element={<Suspense fallback={<LoadingFallback />}><Index /></Suspense>} />
                  {/* Legacy redirect for backwards compatibility */}
                  <Route path="/dashboard" element={<Suspense fallback={<LoadingFallback />}><Index /></Suspense>} />
                  <Route path="/auth" element={<Suspense fallback={<LoadingFallback />}><Auth /></Suspense>} />
                  <Route
                    path="/onboarding"
                    element={
                      <ErrorBoundary>
                        <Suspense fallback={<LoadingFallback />}>
                          <Onboarding />
                        </Suspense>
                      </ErrorBoundary>
                    }
                  />
                  <Route
                    path="/admin"
                    element={
                      <ErrorBoundary>
                        <Suspense fallback={<LoadingFallback />}>
                          <Admin />
                        </Suspense>
                      </ErrorBoundary>
                    }
                  />
                  <Route
                    path="/settings"
                    element={
                      <ErrorBoundary>
                        <Suspense fallback={<LoadingFallback />}>
                          <Settings />
                        </Suspense>
                      </ErrorBoundary>
                    }
                  />
                  <Route
                    path="/builder"
                    element={
                      <ErrorBoundary>
                        <Suspense fallback={<LoadingFallback />}>
                          <Builder />
                        </Suspense>
                      </ErrorBoundary>
                    }
                  />
                  <Route
                    path="/builder/:projectId"
                    element={
                      <ErrorBoundary>
                        <Suspense fallback={<LoadingFallback />}>
                          <BuilderProject />
                        </Suspense>
                      </ErrorBoundary>
                    }
                  />
                  <Route
                    path="/seo"
                    element={
                      <ErrorBoundary>
                        <Suspense fallback={<LoadingFallback />}>
                          <SEODashboard />
                        </Suspense>
                      </ErrorBoundary>
                    }
                  />
                  <Route
                    path="/performance"
                    element={
                      <ErrorBoundary>
                        <Suspense fallback={<LoadingFallback />}>
                          <Performance />
                        </Suspense>
                      </ErrorBoundary>
                    }
                  />
                  {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
                </BrowserRouter>
              </TooltipProvider>
            </TemplateInjectionProvider>
            </FeatureGatingProvider>
          </WorkspaceProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
