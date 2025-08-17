import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { AuthContainer } from '@/components/auth/AuthContainer';

describe('AuthContainer', () => {
  it('renders children correctly', () => {
    render(
      <AuthContainer>
        <div data-testid="test-content">Test Content</div>
      </AuthContainer>
    );

    expect(screen.getByTestId('test-content')).toBeInTheDocument();
    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });

  it('renders with default styling classes', () => {
    render(
      <AuthContainer>
        <div>Content</div>
      </AuthContainer>
    );

    const container = screen.getByText('Content').closest('div');
    expect(container).toHaveClass('min-h-screen', 'flex', 'items-center', 'justify-center');
  });

  it('applies custom className when provided', () => {
    render(
      <AuthContainer className="custom-class">
        <div>Content</div>
      </AuthContainer>
    );

    const card = screen.getByText('Content').closest('[data-slot="card"]');
    expect(card).toHaveClass('custom-class');
  });

  it('uses default maxWidth when not provided', () => {
    render(
      <AuthContainer>
        <div>Content</div>
      </AuthContainer>
    );

    const card = screen.getByText('Content').closest('[data-slot="card"]');
    expect(card).toHaveClass('max-w-md');
  });

  it('applies custom maxWidth when provided', () => {
    render(
      <AuthContainer maxWidth="max-w-lg">
        <div>Content</div>
      </AuthContainer>
    );

    const card = screen.getByText('Content').closest('[data-slot="card"]');
    expect(card).toHaveClass('max-w-lg');
  });

  it('renders with proper card structure', () => {
    render(
      <AuthContainer>
        <div>Content</div>
      </AuthContainer>
    );

    const card = screen.getByText('Content').closest('[data-slot="card"]');
    const cardContent = screen.getByText('Content').closest('[data-slot="card-content"]');
    
    expect(card).toBeInTheDocument();
    expect(cardContent).toBeInTheDocument();
  });

  it('applies backdrop blur and transparency effects', () => {
    render(
      <AuthContainer>
        <div>Content</div>
      </AuthContainer>
    );

    const card = screen.getByText('Content').closest('[data-slot="card"]');
    expect(card).toHaveClass('bg-white/80', 'dark:bg-slate-800/80', 'backdrop-blur-sm');
  });

  it('renders with proper shadow and border styling', () => {
    render(
      <AuthContainer>
        <div>Content</div>
      </AuthContainer>
    );

    const card = screen.getByText('Content').closest('[data-slot="card"]');
    expect(card).toHaveClass('shadow-xl', 'border-0');
  });

  it('handles multiple children correctly', () => {
    render(
      <AuthContainer>
        <div data-testid="child1">Child 1</div>
        <div data-testid="child2">Child 2</div>
        <div data-testid="child3">Child 3</div>
      </AuthContainer>
    );

    expect(screen.getByTestId('child1')).toBeInTheDocument();
    expect(screen.getByTestId('child2')).toBeInTheDocument();
    expect(screen.getByTestId('child3')).toBeInTheDocument();
  });

  it('renders with proper padding and spacing', () => {
    render(
      <AuthContainer>
        <div>Content</div>
      </AuthContainer>
    );

    const container = screen.getByText('Content').closest('div');
    expect(container).toHaveClass('p-4');
    
    const cardContent = screen.getByText('Content').closest('[data-slot="card-content"]');
    expect(cardContent).toHaveClass('p-8');
  });

  it('applies gradient background correctly', () => {
    render(
      <AuthContainer>
        <div>Content</div>
      </AuthContainer>
    );

    const container = screen.getByText('Content').closest('div');
    expect(container).toHaveClass('bg-gradient-to-br', 'from-slate-50', 'to-slate-100', 'dark:from-slate-900', 'dark:to-slate-800');
  });
});
