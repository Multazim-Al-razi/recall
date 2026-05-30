import { Component, type ErrorInfo, type ReactNode } from 'react';
import { ChartEmptyState } from './ChartEmptyState';

interface Props {
  /** The chart subtree to isolate behind this boundary. */
  children: ReactNode;
  /** Message shown when the chart fails to render. */
  message?: string;
}

interface State {
  hasError: boolean;
}

const DEFAULT_MESSAGE = "This chart couldn't be displayed.";

/**
 * Per-chart error boundary (Requirement 15.4).
 *
 * Wraps a single chart so a render failure is isolated: instead of bubbling up
 * and blanking the whole view (KPIs, timeline, navigation, sibling charts), the
 * boundary renders a contained chart error state via {@link ChartEmptyState}.
 * Because boundaries are per-chart rather than per-page, one chart failing never
 * takes down a sibling chart or the rest of the route.
 *
 * Error boundaries must be class components, so this mirrors the top-level
 * `ErrorBoundary` style in `main.tsx` while staying chart-scoped and reusing the
 * shared empty/error surface.
 */
export class ChartErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Keep a failing chart diagnosable in development, but quiet in production.
    if (import.meta.env.DEV) {
      console.error('ChartErrorBoundary caught an error:', error, errorInfo);
    }
  }

  render(): ReactNode {
    if (this.state.hasError) {
      return <ChartEmptyState message={this.props.message ?? DEFAULT_MESSAGE} />;
    }
    return this.props.children;
  }
}
