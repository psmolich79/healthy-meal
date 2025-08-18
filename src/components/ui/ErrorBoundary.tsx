import React, { Component } from "react";

type ReactNode = React.ReactNode;
import { AlertTriangle, RefreshCw } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
  maxRetries?: number;
  className?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
  retryCount: number;
}

export class ErrorBoundary extends Component<Props, State> {
  private resetTimeoutId: number | null = null;

  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null, retryCount: 0 };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, retryCount: 0 };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
    this.props.onError?.(error, errorInfo);
  }

  handleRetry = () => {
    const { maxRetries = 5 } = this.props;

    if (this.state.retryCount >= maxRetries) {
      return;
    }

    this.setState((prevState) => ({
      hasError: false,
      error: null,
      retryCount: prevState.retryCount + 1,
    }));

    // Auto-reset retry count after 30 seconds of successful operation
    this.resetTimeoutId = window.setTimeout(() => {
      this.setState({ retryCount: 0 });
    }, 30000);
  };

  componentWillUnmount() {
    if (this.resetTimeoutId) {
      clearTimeout(this.resetTimeoutId);
    }
  }

  render() {
    if (this.state.hasError) {
      const { fallback, maxRetries = 5, className = "" } = this.props;
      const canRetry = this.state.retryCount < maxRetries;

      if (fallback) {
        return fallback;
      }

      return (
        <Card className={`max-w-2xl mx-auto ${className}`}>
          <CardContent className="p-6">
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <div className="space-y-4">
                  <div>
                    <h3 className="font-medium mb-2">Wystąpił nieoczekiwany błąd</h3>
                    <p className="text-sm">
                      Przepraszamy, coś poszło nie tak. Spróbuj odświeżyć stronę lub skontaktuj się z pomocą techniczną.
                    </p>
                  </div>

                  {this.state.error && (
                    <details className="text-xs">
                      <summary className="cursor-pointer font-medium">Szczegóły błędu (dla deweloperów)</summary>
                      <pre className="mt-2 p-2 bg-muted rounded text-xs overflow-auto">
                        {this.state.error.toString()}
                      </pre>
                    </details>
                  )}

                  <div className="flex items-center space-x-2">
                    {canRetry && (
                      <Button onClick={this.handleRetry} variant="outline" size="sm" className="text-xs">
                        <RefreshCw className="h-3 w-3 mr-1" />
                        Spróbuj ponownie ({this.state.retryCount + 1}/{maxRetries})
                      </Button>
                    )}

                    <Button onClick={() => window.location.reload()} variant="outline" size="sm" className="text-xs">
                      Odśwież stronę
                    </Button>
                  </div>

                  {!canRetry && (
                    <p className="text-xs text-muted-foreground">
                      Przekroczono maksymalną liczbę prób. Odśwież stronę lub skontaktuj się z pomocą techniczną.
                    </p>
                  )}
                </div>
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      );
    }

    return this.props.children;
  }
}
