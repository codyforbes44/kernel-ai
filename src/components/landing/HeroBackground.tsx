import { Component, ReactNode } from 'react';
import { Hero3DScene } from '../three/Hero3DScene';

// Error boundary for graceful WebGL fallback
interface ErrorBoundaryState {
  hasError: boolean;
}

class WebGLErrorBoundary extends Component<{ children: ReactNode }, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error) {
    console.warn('WebGL Error:', error.message);
  }

  render() {
    if (this.state.hasError) {
      // CSS gradient fallback when WebGL fails
      return (
        <div 
          className="absolute inset-0"
          style={{
            background: 'radial-gradient(ellipse at 50% 120%, hsl(var(--primary) / 0.15) 0%, transparent 50%), linear-gradient(to bottom, hsl(var(--background)) 0%, hsl(195 100% 3%) 100%)'
          }}
        />
      );
    }
    return this.props.children;
  }
}

export function HeroBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <WebGLErrorBoundary>
        <Hero3DScene />
      </WebGLErrorBoundary>
    </div>
  );
}
