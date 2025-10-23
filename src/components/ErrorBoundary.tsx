import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle } from 'lucide-react';
import { GlassmorphicButton } from './GlassmorphicButton';
import { logger } from '../utils/logger';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Log error with context
    logger.error('Error caught by boundary', error, {
      componentStack: errorInfo.componentStack
    });
  }

  handleReset = (): void => {
    this.setState({
      hasError: false,
      error: null
    });
  };

  render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="fixed inset-0 w-full h-full flex items-center justify-center px-6 bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900">
          <div className="w-full max-w-md">
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 p-8">
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mb-4">
                  <AlertTriangle className="w-8 h-8 text-red-400" />
                </div>

                <h2 className="text-white text-2xl mb-3">Something went wrong</h2>

                <p className="text-slate-300 mb-6">
                  An unexpected error occurred. Please try refreshing the page or contact support if the problem persists.
                </p>

                {process.env.NODE_ENV === 'development' && this.state.error && (
                  <div className="w-full bg-red-950/30 border border-red-500/30 rounded-lg p-4 mb-4 text-left">
                    <p className="text-red-300 text-sm font-mono break-all">
                      {this.state.error.message}
                    </p>
                  </div>
                )}

                <div className="flex gap-3 w-full">
                  <GlassmorphicButton
                    variant="secondary"
                    onClick={this.handleReset}
                    className="flex-1"
                  >
                    Try Again
                  </GlassmorphicButton>

                  <GlassmorphicButton
                    variant="primary"
                    onClick={() => window.location.reload()}
                    className="flex-1"
                  >
                    Refresh Page
                  </GlassmorphicButton>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
