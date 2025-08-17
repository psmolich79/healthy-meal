import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { LoadingSpinner } from './LoadingSpinner';

describe('LoadingSpinner', () => {
  it('should not render when not visible', () => {
    render(<LoadingSpinner isVisible={false} />);
    
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });

  it('should render when visible', () => {
    render(<LoadingSpinner isVisible={true} />);
    
    const spinner = screen.getByRole('status');
    expect(spinner).toBeInTheDocument();
    expect(spinner).toHaveAttribute('aria-label', 'Ładowanie');
  });

  it('should display status text when provided', () => {
    const statusText = 'Ładowanie preferencji...';
    render(<LoadingSpinner isVisible={true} status={statusText} />);
    
    expect(screen.getByText(statusText)).toBeInTheDocument();
  });

  it('should not display status text when not provided', () => {
    render(<LoadingSpinner isVisible={true} />);
    
    expect(screen.queryByText('Ładowanie preferencji...')).not.toBeInTheDocument();
  });

  it('should apply correct size classes', () => {
    const { rerender } = render(<LoadingSpinner isVisible={true} size="sm" />);
    
    let spinner = screen.getByRole('status');
    expect(spinner).toHaveClass('w-4', 'h-4');

    rerender(<LoadingSpinner isVisible={true} size="md" />);
    spinner = screen.getByRole('status');
    expect(spinner).toHaveClass('w-6', 'h-6');

    rerender(<LoadingSpinner isVisible={true} size="lg" />);
    spinner = screen.getByRole('status');
    expect(spinner).toHaveClass('w-8', 'h-8');
  });

  it('should use default size when not specified', () => {
    render(<LoadingSpinner isVisible={true} />);
    
    const spinner = screen.getByRole('status');
    expect(spinner).toHaveClass('w-6', 'h-6');
  });

  it('should apply custom className', () => {
    const customClass = 'custom-spinner-class';
    render(<LoadingSpinner isVisible={true} className={customClass} />);
    
    const container = screen.getByRole('status').parentElement;
    expect(container).toHaveClass(customClass);
  });

  it('should have proper structure and classes', () => {
    render(<LoadingSpinner isVisible={true} status="Test status" />);
    
    const container = screen.getByRole('status').parentElement;
    expect(container).toHaveClass('flex', 'flex-col', 'items-center', 'justify-center', 'gap-2');
    
    const spinner = screen.getByRole('status');
    expect(spinner).toHaveClass(
      'animate-spin',
      'rounded-full',
      'border-2',
      'border-gray-300',
      'border-t-blue-600'
    );
  });

  it('should be accessible', () => {
    render(<LoadingSpinner isVisible={true} status="Ładowanie danych" />);
    
    const spinner = screen.getByRole('status');
    expect(spinner).toHaveAttribute('aria-label', 'Ładowanie');
    
    const statusText = screen.getByText('Ładowanie danych');
    expect(statusText).toBeInTheDocument();
  });
});
