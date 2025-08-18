import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { SearchInput } from "../../components/ui/SearchInput";

// Mock funkcji
const mockOnChange = vi.fn();
const mockOnSearch = vi.fn();

describe("SearchInput", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders correctly with default props", () => {
    render(<SearchInput value="" onChange={mockOnChange} />);

    expect(screen.getByPlaceholderText("Szukaj...")).toBeInTheDocument();
    expect(screen.getByRole("textbox")).toBeInTheDocument();
  });

  it("displays input value correctly", () => {
    const testValue = "Test query";
    render(<SearchInput value={testValue} onChange={mockOnChange} />);

    const input = screen.getByRole("textbox");
    expect(input).toHaveValue(testValue);
  });

  it("calls onChange when input value changes", () => {
    render(<SearchInput value="" onChange={mockOnChange} onSearch={mockOnSearch} />);

    const input = screen.getByRole("textbox");
    fireEvent.change(input, { target: { value: "New value" } });

    expect(mockOnChange).toHaveBeenCalledWith("New value");
  });

  it("shows character count correctly", () => {
    render(<SearchInput value="Test" onChange={mockOnChange} showCharacterCount={true} />);

    expect(screen.getByText("4/500")).toBeInTheDocument();
  });

  it("shows clear button when there is text", () => {
    render(<SearchInput value="Test query" onChange={mockOnChange} />);

    expect(screen.getByRole("button")).toBeInTheDocument();
  });

  it("does not show clear button when input is empty", () => {
    render(<SearchInput value="" onChange={mockOnChange} />);

    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  it("clears input when clear button is clicked", () => {
    render(<SearchInput value="Test query" onChange={mockOnChange} />);

    const clearButton = screen.getByRole("button");
    fireEvent.click(clearButton);

    expect(mockOnChange).toHaveBeenCalledWith("");
  });

  it("respects custom placeholder", () => {
    const customPlaceholder = "Custom placeholder";
    render(<SearchInput value="" onChange={mockOnChange} placeholder={customPlaceholder} />);

    expect(screen.getByPlaceholderText(customPlaceholder)).toBeInTheDocument();
  });

  it("respects custom maxLength", () => {
    render(<SearchInput value="" onChange={mockOnChange} />);

    const input = screen.getByRole("textbox");
    expect(input).toHaveAttribute("maxLength", "500");
  });
});
