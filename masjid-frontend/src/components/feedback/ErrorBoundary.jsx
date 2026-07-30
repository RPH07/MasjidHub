import React from 'react';
import * as Sentry from '@sentry/react';
import { Button } from "@/components/ui/button";

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
    this.handleReset = this.handleReset.bind(this);
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    Sentry.captureException(error, {
      contexts: { react: { componentStack: info.componentStack } }
    });
  }

  handleReset() {
    this.setState({ hasError: false, error: null });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-screen p-8 text-center">
          <p className="text-4xl mb-4">❌</p>
          <h2 className="text-lg font-semibold text-red-600 mb-2">
            Oops, terjadi kesalahan
          </h2>

          {import.meta.env.DEV && (
            <pre className="text-xs text-left text-red-400 bg-red-50 rounded p-3 mb-4 max-w-lg overflow-auto">
              {this.state.error?.message || 'Unknown error'}
            </pre>
          )}

          <Button
            onClick={this.handleReset}
            className="px-4 py-2 bg-emerald-600 text-white text-sm rounded hover:bg-emerald-700"
          >
            Coba Lagi
          </Button>
        </div>
      );
    }

    return this.props.children;
  }
}