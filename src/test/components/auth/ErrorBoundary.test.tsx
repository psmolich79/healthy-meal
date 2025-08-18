import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { ErrorBoundary } from "@/components/auth/ErrorBoundary";

// Component that throws an error for testing
const ThrowError = ({ shouldThrow }: { shouldThrow: boolean }) => {
  if (shouldThrow) {
    throw new Error("Test error");
  }
  return <div>No error</div>;
};

// Mock console.error to avoid noise in tests
const originalError = console.error;

describe("ErrorBoundary", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    console.error = vi.fn();
  });

  afterEach(() => {
    console.error = originalError;
  });

  it("renders children when there is no error", () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={false} />
      </ErrorBoundary>
    );

    expect(screen.getByText("No error")).toBeInTheDocument();
    expect(screen.queryByText(/wystąpił nieoczekiwany błąd/i)).not.toBeInTheDocument();
  });

  it("renders error UI when there is an error", () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(screen.getByText(/wystąpił nieoczekiwany błąd/i)).toBeInTheDocument();
    expect(screen.getByText(/przepraszamy, wystąpił błąd/i)).toBeInTheDocument();
    expect(screen.queryByText("No error")).not.toBeInTheDocument();
  });

  it("shows error details in development mode", () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    const detailsButton = screen.getByText(/szczegóły błędu/i);
    expect(detailsButton).toBeInTheDocument();
  });

  it("shows retry button when there is an error", () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(screen.getByRole("button", { name: /spróbuj ponownie/i })).toBeInTheDocument();
  });

  it("shows report error button when there is an error", () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(screen.getByRole("button", { name: /zgłoś błąd/i })).toBeInTheDocument();
  });

  it("shows return to home button when there is an error", () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(screen.getByRole("button", { name: /wróć do strony głównej/i })).toBeInTheDocument();
  });

  it("renders with proper styling classes", () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    // Look for the main container with min-h-screen class
    const mainContainer = screen.getByText(/wystąpił nieoczekiwany błąd/i).closest("div")?.parentElement?.parentElement?.parentElement;
    expect(mainContainer).toHaveClass("min-h-screen", "flex", "items-center", "justify-center");
  });

  it("shows proper error icon", () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    // Look for SVG element in the error header
    const errorHeader = screen.getByText(/wystąpił nieoczekiwany błąd/i).closest('[data-slot="card-header"]');
    const svg = errorHeader?.querySelector("svg");
    expect(svg).toBeInTheDocument();
  });

  it("handles different error types", () => {
    const CustomError = () => {
      throw new TypeError("Custom type error");
    };

    render(
      <ErrorBoundary>
        <CustomError />
      </ErrorBoundary>
    );

    expect(screen.getByText(/wystąpił nieoczekiwany błąd/i)).toBeInTheDocument();
    expect(screen.getByText(/przepraszamy, wystąpił błąd/i)).toBeInTheDocument();
  });

      it("handles multiple errors correctly", () => {
      const { rerender } = render(
        <ErrorBoundary>
          <ThrowError shouldThrow={false} />
        </ErrorBoundary>
      );

      // No error initially
      expect(screen.getByText("No error")).toBeInTheDocument();

      // Throw error
      rerender(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      expect(screen.getByText(/wystąpił nieoczekiwany błąd/i)).toBeInTheDocument();

      // Fix error - ErrorBoundary doesn't recover from errors
      rerender(
        <ErrorBoundary>
          <ThrowError shouldThrow={false} />
        </ErrorBoundary>
      );

      expect(screen.getByText(/wystąpił nieoczekiwany błąd/i)).toBeInTheDocument();
    });
});
