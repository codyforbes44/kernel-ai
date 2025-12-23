import { onCLS, onFID, onFCP, onLCP, onTTFB, onINP, type Metric } from 'web-vitals';

export interface VitalMetric {
  name: string;
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  delta: number;
  id: string;
  navigationType: string;
  timestamp: number;
}

export interface WebVitalsData {
  CLS: VitalMetric | null;
  FID: VitalMetric | null;
  FCP: VitalMetric | null;
  LCP: VitalMetric | null;
  TTFB: VitalMetric | null;
  INP: VitalMetric | null;
}

// Store vitals in memory for dashboard access
const vitalsStore: WebVitalsData = {
  CLS: null,
  FID: null,
  FCP: null,
  LCP: null,
  TTFB: null,
  INP: null,
};

// Callbacks for real-time updates
const listeners: Set<(vitals: WebVitalsData) => void> = new Set();

// Thresholds for rating (based on Google's Core Web Vitals)
const thresholds = {
  CLS: { good: 0.1, poor: 0.25 },
  FID: { good: 100, poor: 300 },
  FCP: { good: 1800, poor: 3000 },
  LCP: { good: 2500, poor: 4000 },
  TTFB: { good: 800, poor: 1800 },
  INP: { good: 200, poor: 500 },
};

function getRating(name: keyof typeof thresholds, value: number): 'good' | 'needs-improvement' | 'poor' {
  const threshold = thresholds[name];
  if (value <= threshold.good) return 'good';
  if (value <= threshold.poor) return 'needs-improvement';
  return 'poor';
}

function handleMetric(metric: Metric) {
  const vitalMetric: VitalMetric = {
    name: metric.name,
    value: metric.value,
    rating: getRating(metric.name as keyof typeof thresholds, metric.value),
    delta: metric.delta,
    id: metric.id,
    navigationType: metric.navigationType,
    timestamp: Date.now(),
  };

  vitalsStore[metric.name as keyof WebVitalsData] = vitalMetric;
  
  // Notify listeners
  listeners.forEach((callback) => callback({ ...vitalsStore }));

  // Log in development
  if (import.meta.env.DEV) {
    const color = vitalMetric.rating === 'good' ? '#22c55e' : 
                  vitalMetric.rating === 'needs-improvement' ? '#f59e0b' : '#ef4444';
    console.log(
      `%c[Web Vitals] ${metric.name}: ${metric.value.toFixed(2)}`,
      `color: ${color}; font-weight: bold;`
    );
  }

  // Send to analytics/Sentry if configured
  if (import.meta.env.VITE_SENTRY_DSN) {
    import('./sentry').then(({ addBreadcrumb }) => {
      addBreadcrumb(
        `${metric.name}: ${metric.value.toFixed(2)} (${vitalMetric.rating})`,
        'web-vitals',
        vitalMetric.rating === 'good' ? 'info' : 'warning',
        { value: metric.value, rating: vitalMetric.rating }
      );
    });
  }
}

// Initialize Web Vitals tracking
export function initWebVitals() {
  onCLS(handleMetric);
  onFID(handleMetric);
  onFCP(handleMetric);
  onLCP(handleMetric);
  onTTFB(handleMetric);
  onINP(handleMetric);
  
  console.log('[Web Vitals] Tracking initialized');
}

// Subscribe to vitals updates
export function subscribeToVitals(callback: (vitals: WebVitalsData) => void) {
  listeners.add(callback);
  // Immediately send current state
  callback({ ...vitalsStore });
  
  return () => listeners.delete(callback);
}

// Get current vitals snapshot
export function getVitals(): WebVitalsData {
  return { ...vitalsStore };
}

// Get overall performance score (0-100)
export function getPerformanceScore(): number {
  const weights = {
    LCP: 0.25,
    FID: 0.15,
    CLS: 0.25,
    FCP: 0.15,
    TTFB: 0.10,
    INP: 0.10,
  };

  let score = 0;
  let totalWeight = 0;

  Object.entries(vitalsStore).forEach(([name, metric]) => {
    if (metric) {
      const weight = weights[name as keyof typeof weights] || 0.1;
      const metricScore = metric.rating === 'good' ? 100 : 
                          metric.rating === 'needs-improvement' ? 50 : 0;
      score += metricScore * weight;
      totalWeight += weight;
    }
  });

  return totalWeight > 0 ? Math.round(score / totalWeight * 100) / 100 : 0;
}
