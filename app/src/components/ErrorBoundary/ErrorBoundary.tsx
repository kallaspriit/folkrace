import React from "react";
import { ErrorView } from "../../views/ErrorView/ErrorView";

interface ErrorBoundaryProps {
  errorLogger?: (error: Error, info: React.ErrorInfo) => void;
}

interface ErrorBoundaryState {
  error?: Error;
}

export default class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { error: undefined };

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    if (this.props.errorLogger) {
      this.props.errorLogger(error, info);
    }
  }

  render() {
    // render error if exists
    if (this.state.error) {
      return <ErrorView error={this.state.error} />;
    }

    // render normal children if there's no error condition
    return this.props.children;
  }
}
