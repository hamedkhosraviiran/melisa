import React, { useState } from 'react';

interface CounterProps {
  initialValue?: number;
}

export const Counter: React.FC<CounterProps> = ({ initialValue = 0 }) => {
  const [count, setCount] = useState(initialValue);

  const increment = () => setCount(count + 1);
  const decrement = () => setCount(count - 1);
  const reset = () => setCount(initialValue);

  return (
    <div className="counter" data-testid="counter">
      <h2>Counter: {count}</h2>
      <div className="counter-buttons">
        <button onClick={increment} data-testid="increment-btn">
          Increment
        </button>
        <button onClick={decrement} data-testid="decrement-btn">
          Decrement
        </button>
        <button onClick={reset} data-testid="reset-btn">
          Reset
        </button>
      </div>
      <p data-testid="count-display">Current count: {count}</p>
      {count > 10 && (
        <p data-testid="warning-message" className="warning">
          Count is getting high!
        </p>
      )}
    </div>
  );
};