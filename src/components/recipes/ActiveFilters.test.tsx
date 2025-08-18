import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ActiveFilters } from './ActiveFilters';

// Mock the preferences data
vi.mock('@/data/preferences', () => ({
  DIET_PREFERENCES: [
    { id: 'high-protein', label: 'Wysokobiałkowa', category: 'diet', icon: '💪' },
    { id: 'vegetarian', label: 'Wegetariańska', category: 'diet', icon: '🥬' },
  ],
  CUISINE_PREFERENCES: [
    { id: 'italian', label: 'Włoska', category: 'cuisine', icon: '🍝' },
    { id: 'polish', label: 'Polska', category: 'cuisine', icon: '🥟' },
  ],
  ALLERGY_PREFERENCES: [
    { id: 'nuts', label: 'Orzechy', category: 'allergy', icon: '🥜', severity: 'severe' },
    { id: 'gluten', label: 'Gluten', category: 'allergy', icon: '🌾', severity: 'severe' },
  ],
}));

// Mock the onEditProfile function
const mockOnEditProfile = vi.fn();

describe('ActiveFilters', () => {
  it('should categorize preferences correctly', () => {
    const preferences = ['high-protein', 'italian', 'nuts'];
    
    render(
      <ActiveFilters 
        preferences={preferences} 
        onEditProfile={mockOnEditProfile} 
      />
    );

    // Check if categories are displayed correctly
    expect(screen.getByText('Dieta')).toBeInTheDocument();
    expect(screen.getByText('Kuchnia')).toBeInTheDocument();
    expect(screen.getByText('Alergie')).toBeInTheDocument();

    // Check if preferences are displayed with correct labels
    expect(screen.getByText('Wysokobiałkowa')).toBeInTheDocument();
    expect(screen.getByText('Włoska')).toBeInTheDocument();
    expect(screen.getByText('Orzechy')).toBeInTheDocument();
  });

  it('should show allergy warning when allergies are present', () => {
    const preferences = ['nuts', 'gluten'];
    
    render(
      <ActiveFilters 
        preferences={preferences} 
        onEditProfile={mockOnEditProfile} 
      />
    );

    // Check if allergy warning is displayed
    expect(screen.getByText(/Alergie są preferencjami wykluczającymi/)).toBeInTheDocument();
    expect(screen.getByText('Uwaga:')).toBeInTheDocument();
  });

  it('should not show allergy warning when no allergies are present', () => {
    const preferences = ['high-protein', 'italian'];
    
    render(
      <ActiveFilters 
        preferences={preferences} 
        onEditProfile={mockOnEditProfile} 
      />
    );

    // Check that allergy warning is not displayed
    expect(screen.queryByText(/Alergie są preferencjami wykluczającymi/)).not.toBeInTheDocument();
    expect(screen.queryByText('Uwaga:')).not.toBeInTheDocument();
  });

  it('should show empty state when no preferences are present', () => {
    render(
      <ActiveFilters 
        preferences={[]} 
        onEditProfile={mockOnEditProfile} 
      />
    );

    expect(screen.getByText('Brak aktywnych preferencji')).toBeInTheDocument();
    expect(screen.getByText('Ustaw preferencje')).toBeInTheDocument();
  });
});
