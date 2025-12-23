import { motion, AnimatePresence } from 'framer-motion';
import { useMigrationWizard } from '@/hooks/useMigrationWizard';
import { PlatformSelectStep } from './steps/PlatformSelectStep';
import { ImportMethodStep } from './steps/ImportMethodStep';
import { FileUploadStep } from './steps/FileUploadStep';
import { FeatureDiscoveryStep } from './steps/FeatureDiscoveryStep';
import { ProjectSetupStep } from './steps/ProjectSetupStep';
import { SuccessStep } from './steps/SuccessStep';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, ArrowRight, Loader2 } from 'lucide-react';
import { KernelLogo } from '@/components/ui/kernel-logo';
import { useNavigate } from 'react-router-dom';

export function MigrationAssistant() {
  const navigate = useNavigate();
  const {
    state,
    selectPlatform,
    selectMethod,
    setFiles,
    setPastedCode,
    setImportUrl,
    setShareCode,
    lookupShareCode,
    setProjectDetails,
    setSupabaseCredentials,
    testSupabaseConnection,
    setSkipSupabaseConnection,
    nextStep,
    prevStep,
    canProceed,
    getProgress,
    stepIndex,
    totalSteps,
  } = useMigrationWizard();

  const renderStep = () => {
    switch (state.currentStep) {
      case 'platform':
        return (
          <PlatformSelectStep
            selectedPlatform={state.selectedPlatform}
            onSelect={(platform) => {
              selectPlatform(platform);
              nextStep();
            }}
          />
        );
      case 'method':
        return state.selectedPlatform && (
          <ImportMethodStep
            platform={state.selectedPlatform}
            selectedMethod={state.selectedMethod}
            onSelect={(method) => {
              selectMethod(method);
              nextStep();
            }}
          />
        );
      case 'upload':
        return state.selectedPlatform && state.selectedMethod && (
          <FileUploadStep
            platform={state.selectedPlatform}
            method={state.selectedMethod}
            files={state.files}
            pastedCode={state.pastedCode}
            importUrl={state.importUrl}
            detectedFramework={state.detectedFramework}
            fileCount={state.fileCount}
            onFilesChange={setFiles}
            onPastedCodeChange={setPastedCode}
            onImportUrlChange={setImportUrl}
            detectionResult={state.detectionResult}
            isAnalyzing={state.isAnalyzing}
            shareCode={state.shareCode}
            onShareCodeChange={setShareCode}
            shareCodeData={state.shareCodeData}
            shareCodeError={state.shareCodeError}
            isLookingUpShareCode={state.isLookingUpShareCode}
            onLookupShareCode={lookupShareCode}
          />
        );
      case 'features':
        return state.selectedPlatform && (
          <FeatureDiscoveryStep platform={state.selectedPlatform} />
        );
      case 'setup':
        return state.selectedPlatform && (
          <ProjectSetupStep
            platform={state.selectedPlatform}
            projectName={state.projectName}
            projectDescription={state.projectDescription}
            createConversation={state.createConversation}
            enableKnowledgeBase={state.enableKnowledgeBase}
            onProjectNameChange={(name) => setProjectDetails({ projectName: name })}
            onProjectDescriptionChange={(desc) => setProjectDetails({ projectDescription: desc })}
            onCreateConversationChange={(val) => setProjectDetails({ createConversation: val })}
            onEnableKnowledgeBaseChange={(val) => setProjectDetails({ enableKnowledgeBase: val })}
            supabaseDetection={state.supabaseDetection}
            supabaseCredentials={state.supabaseCredentials}
            onSupabaseCredentialsChange={setSupabaseCredentials}
            onTestSupabaseConnection={testSupabaseConnection}
            supabaseConnectionTested={state.supabaseConnectionTested}
            supabaseConnectionValid={state.supabaseConnectionValid}
            isTestingSupabaseConnection={state.isTestingSupabaseConnection}
            skipSupabaseConnection={state.skipSupabaseConnection}
            onSkipSupabaseConnection={setSkipSupabaseConnection}
          />
        );
      case 'success':
        return state.selectedPlatform && (
          <SuccessStep
            platform={state.selectedPlatform}
            projectName={state.projectName}
            projectId={state.createdProjectId}
            supabaseDetection={state.supabaseDetection}
            supabaseConnectionValid={state.supabaseConnectionValid}
            skipSupabaseConnection={state.skipSupabaseConnection}
          />
        );
      default:
        return null;
    }
  };

  const showNavigation = state.currentStep !== 'success';
  const showBack = stepIndex > 0 && state.currentStep !== 'success';

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <button onClick={() => navigate('/')} className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <KernelLogo className="h-8 w-8" />
            <span className="font-semibold text-lg">Kernel</span>
          </button>
          <div className="text-sm text-muted-foreground">
            Migration Assistant
          </div>
        </div>
      </header>

      {/* Progress */}
      <div className="border-b border-border">
        <div className="max-w-5xl mx-auto px-4 py-3">
          <div className="flex items-center gap-4">
            <Progress value={getProgress()} className="h-2" />
            <span className="text-sm text-muted-foreground whitespace-nowrap">
              Step {stepIndex + 1} of {totalSteps}
            </span>
          </div>
        </div>
      </div>

      {/* Content */}
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-5xl mx-auto px-4 py-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={state.currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              {renderStep()}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      {/* Footer Navigation */}
      {showNavigation && (
        <footer className="border-t border-border bg-card/50 backdrop-blur-sm sticky bottom-0">
          <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
            <div>
              {showBack && (
                <Button variant="ghost" onClick={prevStep}>
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
              )}
            </div>
            <Button
              onClick={nextStep}
              disabled={!canProceed() || state.isProcessing}
            >
              {state.isProcessing && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {state.currentStep === 'setup' ? 'Create Project' : 'Continue'}
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </footer>
      )}
    </div>
  );
}
