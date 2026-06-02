import { Component, type ErrorInfo, type ReactNode } from "react";

interface Props {
  children: ReactNode;
  /** Optional override for the fallback UI. */
  fallback?: ReactNode;
  /** Short label included in the error log; helps split crashes by surface. */
  scope?: string;
}

interface State {
  hasError: boolean;
  error?: Error;
}

/**
 * Top-level error boundary. Catches render-phase errors from its children and
 * renders a calm fallback so a single bad widget can't take down the whole
 * app. Wrap the route layouts (`DashboardLayout`, `MarketingLayout`) in
 * `App.tsx` — boundaries must be class components because there is no hook
 * equivalent for `componentDidCatch`.
 */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    if (typeof console !== "undefined") {
      const label = this.props.scope
        ? `[${this.props.scope}]`
        : "[ErrorBoundary]";
      // eslint-disable-next-line no-console
      console.error(label, error, info.componentStack);
    }
  }

  private handleReload = () => {
    if (typeof window !== "undefined") {
      window.location.reload();
    }
  };

  private handleReset = () => {
    this.setState({ hasError: false, error: undefined });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;
      return (
        <div
          role="alert"
          className="flex min-h-[60vh] flex-col items-center justify-center gap-4 p-8 text-center"
        >
          <h1 className="font-display text-[28px] font-light tracking-tight">
            Something went wrong
          </h1>
          <p className="max-w-[420px] text-[14px] text-muted">
            We hit an unexpected error. Your data stays on your device — reloading
            usually clears it.
          </p>
          <div className="mt-2 flex flex-wrap items-center justify-center gap-2">
            <button
              type="button"
              onClick={this.handleReload}
              className="rounded-full bg-rausch px-6 py-2.5 text-[14px] font-semibold text-white transition-colors hover:bg-rausch-hover"
            >
              Reload
            </button>
            <button
              type="button"
              onClick={this.handleReset}
              className="rounded-full border border-ink/12 px-5 py-2.5 text-[14px] font-medium text-ink transition-colors hover:border-rausch/30 hover:text-rausch"
            >
              Try again
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
