import React from 'react';
import { AlertTriangle, RotateCcw } from 'lucide-react';

interface Props {
  children: React.ReactNode;
  resetKey?: string;
}

export class ErrorBoundary extends React.Component<Props, { hasError: boolean }> {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('UI error:', error, info);
  }

  componentDidUpdate(prev: Props) {
    // لما المستخدم يروح لصفحة تانية الخطأ بيتمسح
    if (this.state.hasError && prev.resetKey !== this.props.resetKey) {
      this.setState({ hasError: false });
    }
  }

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <div role="alert" className="max-w-xl mx-auto px-4 py-20 text-center space-y-5">
        <div className="mx-auto w-14 h-14 rounded-full bg-red-100 text-[#C8202F] flex items-center justify-center">
          <AlertTriangle size={28} aria-hidden="true" />
        </div>
        <h1 className="text-2xl font-extrabold text-[#171717]">Something went wrong on our side</h1>
        <p className="text-gray-700 text-sm leading-relaxed">
          This page could not be displayed. You can try again, go back to the home page, or reload.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            type="button"
            onClick={() => this.setState({ hasError: false })}
            className="inline-flex items-center justify-center gap-2 bg-[#C8202F] hover:bg-red-700 text-white font-bold px-6 py-3 rounded-xl min-h-[48px] transition-colors"
          >
            <RotateCcw size={16} aria-hidden="true" />
            Try again
          </button>
          <a
            href="#/"
            onClick={() => this.setState({ hasError: false })}
            className="inline-flex items-center justify-center border border-gray-300 text-gray-800 font-semibold px-6 py-3 rounded-xl min-h-[48px] hover:bg-gray-50 transition-colors"
          >
            Back to home
          </a>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="inline-flex items-center justify-center border border-gray-300 text-gray-800 font-semibold px-6 py-3 rounded-xl min-h-[48px] hover:bg-gray-50 transition-colors"
          >
            Reload page
          </button>
        </div>
      </div>
    );
  }
}

export default ErrorBoundary;