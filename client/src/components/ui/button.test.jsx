import React from 'react';
import { render, screen } from '@testing-library/react';
import { Button } from './button';

//testing the Button component

describe('Button', () => {
  it('renders with default props and displays children', () => {
    render(<Button>Click me</Button>);
    const btn = screen.getByRole('button', { name: /click me/i });
    expect(btn).toBeInTheDocument();
    expect(btn).toHaveClass('inline-flex');
  });



  it('applies the variant and size classes', () => {
    render(<Button variant="destructive" size="lg">Delete</Button>);
    const btn = screen.getByRole('button', { name: /delete/i });
    expect(btn).toHaveClass('bg-destructive');
    expect(btn).toHaveClass('h-11');
  });

  it('is disabled when disabled prop is set', () => {
    render(<Button disabled>Disabled</Button>);
    const btn = screen.getByRole('button', { name: /disabled/i });
    expect(btn).toBeDisabled();
  });
}); 

