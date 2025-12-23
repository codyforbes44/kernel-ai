// Re-export static data hooks for convenient imports
export {
  // FAQ hooks
  usePricingFAQs,
  useContactFAQs,
  
  // Tutorial hooks
  useTutorials,
  useTutorial,
  
  // Documentation hooks
  useDocCategories,
  useDocCategory,
  useDocArticle,
  useAllDocArticles,
  
  // Utilities
  prefetchStaticData,
  
  // Types
  type FAQItem,
  type TutorialData,
  type TutorialStepData,
  type DocCategoryData,
  type DocArticleData,
  type DocSectionData,
} from './useStaticData';
