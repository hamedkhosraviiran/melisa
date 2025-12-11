import { multiply, divide } from '../math';

describe('Math functions', () => {
  test('multiplies two numbers correctly', () => {
    expect(multiply(2, 3)).toBe(6);
    expect(multiply(0, 5)).toBe(0);
    expect(multiply(-2, 3)).toBe(-6);
  });

  test('divides two numbers correctly', () => {
    expect(divide(6, 2)).toBe(3);
    expect(divide(5, 2)).toBe(2.5);
  });

  test('throws error when dividing by zero', () => {
    expect(() => divide(5, 0)).toThrow('Division by zero');
  });
});