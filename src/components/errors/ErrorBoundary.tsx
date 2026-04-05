import { Component, type ErrorInfo, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    if (import.meta.env.DEV) {
      console.error('[ErrorBoundary]', error, info.componentStack);
    }
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    const { hasError, error } = this.state;
    if (hasError && error) {
      return (
        <div
          className="min-h-screen flex items-center justify-center bg-[hsl(var(--color-bg-base))] px-6"
          role="alert"
          aria-live="assertive"
        >
          <div className="max-w-md rounded-lg border border-[hsl(var(--color-error))] bg-[hsl(var(--color-bg-surface))] p-6 text-center">
            <h1 className="text-lg font-semibold text-[hsl(var(--color-text-primary))] mb-2">
              Something went wrong
            </h1>
            <p className="text-sm text-[hsl(var(--color-text-secondary))] mb-4">{error.message}</p>
            <button
              type="button"
              onClick={this.handleRetry}
              className="px-4 py-2 text-sm font-medium rounded-md bg-[hsl(var(--indigo-600))] text-[hsl(var(--slate-50))] hover:bg-[hsl(var(--indigo-700))] focus:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--indigo-400))]"
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
