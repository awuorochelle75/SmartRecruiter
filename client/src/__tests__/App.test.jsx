import { render, screen } from '@testing-library/react';
test('renders placeholder', () => {
  render(<div>Hello, Jest!</div>);
  expect(screen.getByText('Hello, Jest!')).toBeInTheDocument();
}); 