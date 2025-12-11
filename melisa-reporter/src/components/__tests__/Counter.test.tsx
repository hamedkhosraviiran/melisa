import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Counter } from '../Counter';

describe('Counter Component', () => {
  test('renders with initial value', () => {
    render(<Counter initialValue={5} />);
    
    expect(screen.getByTestId('count-display')).toHaveTextContent('Current count: 5');
    expect(screen.getByText('Counter: 5')).toBeInTheDocument();
  });

  test('increments count when increment button is clicked', () => {
    render(<Counter />);
    const incrementButton = screen.getByTestId('increment-btn');
    fireEvent.click(incrementButton);
    expect(screen.getByTestId('count-display')).toHaveTextContent('Current count: 1');
  });

  test('decrements count when decrement button is clicked', () => {
    render(<Counter initialValue={5} />);
    
    const decrementButton = screen.getByTestId('decrement-btn');
    fireEvent.click(decrementButton);
    
    expect(screen.getByTestId('count-display')).toHaveTextContent('Current count: 4');
  });

  test('resets count when reset button is clicked', () => {
    render(<Counter initialValue={5} />);
    
    const incrementButton = screen.getByTestId('increment-btn');
    fireEvent.click(incrementButton);
    fireEvent.click(incrementButton);
    
    const resetButton = screen.getByTestId('reset-btn');
    fireEvent.click(resetButton);
    
    expect(screen.getByTestId('count-display')).toHaveTextContent('Current count: 5');
  });

  test('shows warning message when count exceeds 10', () => {
    render(<Counter initialValue={9} />);
    
    expect(screen.queryByTestId('warning-message')).not.toBeInTheDocument();
    const incrementButton = screen.getByTestId('increment-btn');
    fireEvent.click(incrementButton);
    fireEvent.click(incrementButton);
    expect(screen.getByTestId('warning-message')).toBeInTheDocument();
    expect(screen.getByTestId('warning-message')).toHaveTextContent('Count is getting high!');
  });
});