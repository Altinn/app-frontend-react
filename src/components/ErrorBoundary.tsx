import React from 'react';

import { DisplayError } from 'src/core/errorHandling/DisplayError';

interface IErrorBoundary {
  lastError?: Error;
}

interface Props extends React.PropsWithChildren {}

export class ErrorBoundary extends React.Component<Props, IErrorBoundary> {
  constructor(props: Props) {
    super(props);
    this.state = { lastError: undefined };
  }

  static getDerivedStateFromError(lastError: Error) {
    return { lastError };
  }

  render() {
    if (this.state.lastError) {
      return <DisplayError error={this.state.lastError} />;
    }

    return this.props.children;
  }
}
