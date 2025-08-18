import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";

describe("LoadingSpinner", () => {
  describe("visibility", () => {
    it("should not render when isVisible is false", () => {
      const { container } = render(<LoadingSpinner isVisible={false} />);
      expect(container.firstChild).toBeNull();
    });

    it("should render when isVisible is true", () => {
      render(<LoadingSpinner isVisible={true} />);
      expect(screen.getByText("Ładowanie...")).toBeInTheDocument();
    });
  });

  describe("default props", () => {
    it("should render with default status text", () => {
      render(<LoadingSpinner isVisible={true} />);
      expect(screen.getByText("Ładowanie...")).toBeInTheDocument();
    });

    it("should render with default size (md)", () => {
      render(<LoadingSpinner isVisible={true} />);
      const mainContainer = screen.getByText("Ładowanie...").closest("div")?.parentElement;
      expect(mainContainer).toHaveClass("p-6");
    });

    it("should render without progress bar by default", () => {
      render(<LoadingSpinner isVisible={true} />);
      expect(screen.queryByText(/ukończone/)).not.toBeInTheDocument();
    });
  });

  describe("custom props", () => {
    it("should render with custom status text", () => {
      const customStatus = "Generowanie przepisu...";
      render(<LoadingSpinner isVisible={true} status={customStatus} />);
      expect(screen.getByText(customStatus)).toBeInTheDocument();
    });

    it("should render with custom className", () => {
      const customClass = "custom-loading-class";
      render(<LoadingSpinner isVisible={true} className={customClass} />);
      const mainContainer = screen.getByText("Ładowanie...").closest("div")?.parentElement;
      expect(mainContainer).toHaveClass(customClass);
    });
  });

  describe("size variants", () => {
    it("should render with small size", () => {
      render(<LoadingSpinner isVisible={true} size="sm" />);
      const mainContainer = screen.getByText("Ładowanie...").closest("div")?.parentElement;
      expect(mainContainer).toHaveClass("p-4");
    });

    it("should render with medium size (default)", () => {
      render(<LoadingSpinner isVisible={true} size="md" />);
      const mainContainer = screen.getByText("Ładowanie...").closest("div")?.parentElement;
      expect(mainContainer).toHaveClass("p-6");
    });

    it("should render with large size", () => {
      render(<LoadingSpinner isVisible={true} size="lg" />);
      const mainContainer = screen.getByText("Ładowanie...").closest("div")?.parentElement;
      expect(mainContainer).toHaveClass("p-8");
    });
  });

  describe("progress bar", () => {
    it("should render progress bar when progress is provided", () => {
      render(<LoadingSpinner isVisible={true} progress={50} />);
      expect(screen.getByText("50% ukończone")).toBeInTheDocument();
    });

    it("should render progress bar with 0% progress", () => {
      render(<LoadingSpinner isVisible={true} progress={0} />);
      expect(screen.getByText("0% ukończone")).toBeInTheDocument();
    });

    it("should render progress bar with 100% progress", () => {
      render(<LoadingSpinner isVisible={true} progress={100} />);
      expect(screen.getByText("100% ukończone")).toBeInTheDocument();
    });

    it("should render progress bar with decimal progress", () => {
      render(<LoadingSpinner isVisible={true} progress={75.7} />);
      expect(screen.getByText("76% ukończone")).toBeInTheDocument();
    });
  });

  describe("accessibility", () => {
    it("should have proper text content for screen readers", () => {
      render(<LoadingSpinner isVisible={true} status="Ładowanie przepisów..." />);
      expect(screen.getByText("Ładowanie przepisów...")).toBeInTheDocument();
    });

    it("should show progress information when available", () => {
      render(<LoadingSpinner isVisible={true} progress={25} />);
      expect(screen.getByText("25% ukończone")).toBeInTheDocument();
    });
  });

  describe("edge cases", () => {
    it("should handle undefined progress gracefully", () => {
      render(<LoadingSpinner isVisible={true} progress={undefined} />);
      expect(screen.queryByText(/ukończone/)).not.toBeInTheDocument();
    });

    it("should handle null progress gracefully", () => {
      render(<LoadingSpinner isVisible={true} progress={null as any} />);
      expect(screen.queryByText(/ukończone/)).not.toBeInTheDocument();
    });

    it("should handle negative progress values", () => {
      render(<LoadingSpinner isVisible={true} progress={-10} />);
      expect(screen.getByText("-10% ukończone")).toBeInTheDocument();
    });

    it("should handle progress values over 100%", () => {
      render(<LoadingSpinner isVisible={true} progress={150} />);
      expect(screen.getByText("150% ukończone")).toBeInTheDocument();
    });
  });
});
