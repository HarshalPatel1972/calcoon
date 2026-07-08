// Complex tokens that indicate we should route to SymPy backend
// e.g. integrals, derivatives, limits, trigonometric functions, logs, exponents with variables.
const COMPLEX_TOKENS = [
  "∫", "d/dx", "sin", "cos", "tan", "log", "lim", "pi", "e",
  "^", "sqrt", "cbrt", "abs"
];

// In a real scenario, we might also use a regex to look for algebraic variables like 'x', 'y'
const COMPLEX_REGEX = /[a-zA-Z]/; 

export function isComplexExpression(expression: string): boolean {
  if (!expression) return false;
  
  const lowerExpr = expression.toLowerCase();
  
  for (const token of COMPLEX_TOKENS) {
    if (lowerExpr.includes(token)) return true;
  }
  
  // If there are alphabetical characters not matched above, it might be an algebraic variable
  if (COMPLEX_REGEX.test(lowerExpr)) return true;

  return false;
}
