import React, { Suspense, lazy, ComponentType } from "react";
import { LoadingSpinner } from "@/components/profile/LoadingSpinner";

export interface LazyLoaderProps {
  component: () => Promise<{ default: ComponentType<any> }>;
  fallback?: React.ReactNode;
  props?: Record<string, any>;
}

export const LazyLoader = React.memo<LazyLoaderProps>(
  ({ component, fallback = <LoadingSpinner isVisible={true} status="Ładowanie komponentu..." />, props = {} }) => {
    const LazyComponent = lazy(component);

    return (
      <Suspense fallback={fallback}>
        <LazyComponent {...props} />
      </Suspense>
    );
  }
);

// Predefined lazy components for common use cases
export const LazyProfileForm = lazy(() => import("@/components/profile/ProfileFormView"));
export const LazyPreferencesAccordion = lazy(() => import("@/components/profile/PreferencesAccordion"));
export const LazyDietSection = lazy(() => import("@/components/profile/DietSection"));
export const LazyCuisineSection = lazy(() => import("@/components/profile/CuisineSection"));
export const LazyAllergiesSection = lazy(() => import("@/components/profile/AllergiesSection"));

// Lazy loading with error boundary
export const LazyLoaderWithErrorBoundary = React.memo<
  LazyLoaderProps & {
    errorFallback?: React.ComponentType<{ error: Error; retry: () => void }>;
  }
>(({ component, fallback, props, errorFallback: ErrorFallback }) => {
  const LazyComponent = lazy(component);

  if (ErrorFallback) {
    return (
      <ErrorBoundary FallbackComponent={ErrorFallback}>
        <Suspense fallback={fallback}>
          <LazyComponent {...props} />
        </Suspense>
      </ErrorBoundary>
    );
  }

  return (
    <Suspense fallback={fallback}>
      <LazyComponent {...props} />
    </Suspense>
  );
});

// Error boundary component
class ErrorBoundary extends React.Component<
  { children: React.ReactNode; FallbackComponent: React.ComponentType<{ error: Error; retry: () => void }> },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("LazyLoader error:", error, errorInfo);
  }

  retry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError && this.state.error) {
      return <this.props.FallbackComponent error={this.state.error} retry={this.retry} />;
    }

    return this.props.children;
  }
}

// Hook for lazy loading with intersection observer
export const useLazyLoad = (ref: React.RefObject<HTMLElement>, options = {}) => {
  const [isVisible, setIsVisible] = React.useState(false);

  React.useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1, ...options }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [ref, options]);

  return isVisible;
};

// Component that loads when it becomes visible
export const IntersectionLazyLoader = React.memo<
  LazyLoaderProps & {
    threshold?: number;
    rootMargin?: string;
  }
>(({ component, fallback, props, threshold = 0.1, rootMargin = "50px" }) => {
  const ref = React.useRef<HTMLDivElement>(null);
  const isVisible = useLazyLoad(ref, { threshold, rootMargin });

  if (!isVisible) {
    return (
      <div ref={ref} className="min-h-[200px] flex items-center justify-center">
        {fallback}
      </div>
    );
  }

  return <LazyLoader component={component} fallback={fallback} props={props} />;
});
