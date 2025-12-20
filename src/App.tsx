import { lazy, Suspense, useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { AuthProvider } from "@/hooks/useAuth";
import { WorkspaceProvider } from "@/hooks/useWorkspace";
import { TemplateInjectionProvider } from "@/hooks/useTemplateInjection";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { useOLEDSuggestion } from "@/hooks/useOLEDSuggestion";
import { CommandPalette } from "@/components/CommandPalette";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Landing from "./pages/Landing";
import NotFound from "./pages/NotFound";
import Pricing from "./pages/Pricing";
import Contact from "./pages/Contact";

// Lazy load heavy pages
const Admin = lazy(() => import("./pages/Admin"));
const Settings = lazy(() => import("./pages/Settings"));
const Builder = lazy(() => import("./pages/Builder"));
const BuilderProject = lazy(() => import("./pages/BuilderProject"));

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

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
        <AuthProvider>
          <ReducedMotionLoader />
          <OLEDSuggestionLoader />
          <WorkspaceProvider>
            <TemplateInjectionProvider>
              <TooltipProvider>
                <Toaster />
                <Sonner />
              <BrowserRouter>
                <CommandPalette />
                <Routes>
                  <Route path="/" element={<Landing />} />
                  <Route path="/pricing" element={<Pricing />} />
                  <Route path="/contact" element={<Contact />} />
                  <Route path="/dashboard" element={<Index />} />
                  <Route path="/auth" element={<Auth />} />
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
                  {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
                </BrowserRouter>
              </TooltipProvider>
            </TemplateInjectionProvider>
          </WorkspaceProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
