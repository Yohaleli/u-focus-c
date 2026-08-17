import React, { ErrorInfo, ReactNode } from 'react';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  private handleReset = async () => {
    // Clear localStorage
    localStorage.clear();
    
    // Clear IndexedDB (used by Firebase)
    try {
        const dbs = await window.indexedDB.databases();
        dbs.forEach(db => {
            if (db.name) {
                window.indexedDB.deleteDatabase(db.name);
            }
        });
    } catch (e) {
        console.error("Could not clear IndexedDB", e);
    }

    // Reload
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#161514] text-white flex flex-col items-center justify-center p-4 font-sans">
          <div className="bg-red-900/20 border border-red-500/50 rounded-xl p-8 max-w-lg text-center">
            <h1 className="text-2xl font-bold text-red-500 mb-4">Something went wrong</h1>
            <p className="text-white/70 mb-6 font-mono text-sm break-all">
              {this.state.error?.message}
            </p>
            <p className="text-white/50 mb-8 text-sm">
              Your local data might be corrupted. Resetting the app data should fix this issue.
            </p>
            <button
              onClick={this.handleReset}
              className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-lg transition-colors"
            >
              Reset All Data & Reload
            </button>
          </div>
        </div>
      );
    }

    return (this as any).props.children;
  }
}
