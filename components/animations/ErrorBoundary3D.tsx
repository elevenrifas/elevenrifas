"use client";
import * as React from "react";

type Props = {
  fallback: React.ReactNode;
  children: React.ReactNode;
};

export class ErrorBoundary3D extends React.Component<Props, { hasError: boolean }> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch() {
    // no-op: could log to a service
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}




