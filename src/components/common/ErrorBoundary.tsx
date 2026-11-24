import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertCircle, RotateCcw } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallbackTitle?: string;
  fallbackMessage?: string;
  /** Render nothing (instead of a message card) when the child crashes. */
  silent?: boolean;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: undefined });
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.silent) return null;
      return (
        <div className="p-6 rounded-xl border border-slate-200 bg-white shadow-sm flex flex-col items-center justify-center text-center my-4">
          <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 mb-3">
            <AlertCircle className="w-5 h-5 text-blue-700" />
          </div>
          <h4 className="text-base font-semibold text-slate-900 mb-1">
            {this.props.fallbackTitle || 'Component could not be loaded'}
          </h4>
          <p className="text-sm text-slate-600 max-w-md mb-4 leading-relaxed">
            {this.props.fallbackMessage || 'A temporary visual error occurred. The remainder of the application remains fully accessible.'}
          </p>
          <button
            onClick={this.handleReset}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300 bg-white text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors shadow-sm"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Try re-rendering</span>
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
