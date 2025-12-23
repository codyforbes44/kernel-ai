import { useQuery, UseQueryOptions } from '@tanstack/react-query';

// ============================================
// Type Definitions
// ============================================

export interface FAQItem {
  question: string;
  answer: string;
  category?: string;
}

export interface TutorialStepData {
  title: string;
  content: string;
  codeExample?: {
    language: string;
    code: string;
    filename?: string;
  };
  tip?: string;
  warning?: string;
}

export interface TutorialData {
  id: string;
  slug: string;
  title: string;
  description: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  duration: string;
  type: 'video' | 'article';
  category: string;
  iconName: string;
  popular?: boolean;
  prerequisites: string[];
  whatYouWillLearn: string[];
  steps: TutorialStepData[];
  nextTutorial?: string;
  prevTutorial?: string;
}

export interface DocSectionData {
  title: string;
  content: string;
  codeExample?: {
    language: string;
    code: string;
    filename?: string;
  };
  tip?: string;
  warning?: string;
  note?: string;
}

export interface DocArticleData {
  id: string;
  slug: string;
  title: string;
  description: string;
  category: string;
  categorySlug: string;
  iconName: string;
  readTime: string;
  lastUpdated: string;
  sections: DocSectionData[];
  relatedDocs?: string[];
}

export interface DocCategoryData {
  title: string;
  slug: string;
  description: string;
  iconName: string;
  articles: DocArticleData[];
}

// ============================================
// Fetch Utilities
// ============================================

async function fetchJSON<T>(path: string): Promise<T> {
  const response = await fetch(path);
  if (!response.ok) {
    throw new Error(`Failed to fetch ${path}: ${response.statusText}`);
  }
  return response.json();
}

// ============================================
// FAQ Hooks
// ============================================

export function usePricingFAQs(options?: Omit<UseQueryOptions<FAQItem[]>, 'queryKey' | 'queryFn'>) {
  return useQuery({
    queryKey: ['static-data', 'faqs', 'pricing'],
    queryFn: () => fetchJSON<FAQItem[]>('/data/faqs-pricing.json'),
    staleTime: 1000 * 60 * 60, // 1 hour
    gcTime: 1000 * 60 * 60 * 24, // 24 hours
    ...options,
  });
}

export function useContactFAQs(options?: Omit<UseQueryOptions<FAQItem[]>, 'queryKey' | 'queryFn'>) {
  return useQuery({
    queryKey: ['static-data', 'faqs', 'contact'],
    queryFn: () => fetchJSON<FAQItem[]>('/data/faqs-contact.json'),
    staleTime: 1000 * 60 * 60,
    gcTime: 1000 * 60 * 60 * 24,
    ...options,
  });
}

// ============================================
// Tutorial Hooks
// ============================================

export function useTutorials(options?: Omit<UseQueryOptions<TutorialData[]>, 'queryKey' | 'queryFn'>) {
  return useQuery({
    queryKey: ['static-data', 'tutorials'],
    queryFn: () => fetchJSON<TutorialData[]>('/data/tutorials.json'),
    staleTime: 1000 * 60 * 60,
    gcTime: 1000 * 60 * 60 * 24,
    ...options,
  });
}

export function useTutorial(slug: string, options?: Omit<UseQueryOptions<TutorialData | undefined>, 'queryKey' | 'queryFn'>) {
  return useQuery({
    queryKey: ['static-data', 'tutorials', slug],
    queryFn: async () => {
      const tutorials = await fetchJSON<TutorialData[]>('/data/tutorials.json');
      return tutorials.find(t => t.slug === slug);
    },
    staleTime: 1000 * 60 * 60,
    gcTime: 1000 * 60 * 60 * 24,
    enabled: !!slug,
    ...options,
  });
}

// ============================================
// Documentation Hooks
// ============================================

export function useDocCategories(options?: Omit<UseQueryOptions<DocCategoryData[]>, 'queryKey' | 'queryFn'>) {
  return useQuery({
    queryKey: ['static-data', 'docs', 'categories'],
    queryFn: () => fetchJSON<DocCategoryData[]>('/data/documentation.json'),
    staleTime: 1000 * 60 * 60,
    gcTime: 1000 * 60 * 60 * 24,
    ...options,
  });
}

export function useDocCategory(categorySlug: string, options?: Omit<UseQueryOptions<DocCategoryData | undefined>, 'queryKey' | 'queryFn'>) {
  return useQuery({
    queryKey: ['static-data', 'docs', 'category', categorySlug],
    queryFn: async () => {
      const categories = await fetchJSON<DocCategoryData[]>('/data/documentation.json');
      return categories.find(c => c.slug === categorySlug);
    },
    staleTime: 1000 * 60 * 60,
    gcTime: 1000 * 60 * 60 * 24,
    enabled: !!categorySlug,
    ...options,
  });
}

export function useDocArticle(categorySlug: string, articleSlug: string, options?: Omit<UseQueryOptions<DocArticleData | undefined>, 'queryKey' | 'queryFn'>) {
  return useQuery({
    queryKey: ['static-data', 'docs', 'article', categorySlug, articleSlug],
    queryFn: async () => {
      const categories = await fetchJSON<DocCategoryData[]>('/data/documentation.json');
      const category = categories.find(c => c.slug === categorySlug);
      return category?.articles.find(a => a.slug === articleSlug);
    },
    staleTime: 1000 * 60 * 60,
    gcTime: 1000 * 60 * 60 * 24,
    enabled: !!categorySlug && !!articleSlug,
    ...options,
  });
}

// ============================================
// All Docs Search Helper
// ============================================

export function useAllDocArticles(options?: Omit<UseQueryOptions<DocArticleData[]>, 'queryKey' | 'queryFn'>) {
  return useQuery({
    queryKey: ['static-data', 'docs', 'all-articles'],
    queryFn: async () => {
      const categories = await fetchJSON<DocCategoryData[]>('/data/documentation.json');
      return categories.flatMap(c => c.articles);
    },
    staleTime: 1000 * 60 * 60,
    gcTime: 1000 * 60 * 60 * 24,
    ...options,
  });
}

// ============================================
// Prefetch Utilities
// ============================================

export function prefetchStaticData(queryClient: import('@tanstack/react-query').QueryClient) {
  // Prefetch FAQs
  queryClient.prefetchQuery({
    queryKey: ['static-data', 'faqs', 'pricing'],
    queryFn: () => fetchJSON<FAQItem[]>('/data/faqs-pricing.json'),
  });
  
  queryClient.prefetchQuery({
    queryKey: ['static-data', 'faqs', 'contact'],
    queryFn: () => fetchJSON<FAQItem[]>('/data/faqs-contact.json'),
  });
}
