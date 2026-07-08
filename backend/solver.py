import multiprocessing
import traceback
from typing import Dict, Any, Tuple

# Safe transformations for SymPy
from sympy.parsing.sympy_parser import (
    parse_expr,
    standard_transformations,
    implicit_multiplication_application,
    convert_xor
)

def _worker(expression: str, return_dict: Dict[str, Any]):
    try:
        # Strict security constraint: No locals, empty globals except for whitelist if needed.
        # We rely on sympy's parser with restricted capabilities.
        transformations = (
            standard_transformations +
            (implicit_multiplication_application, convert_xor)
        )
        
        # Parse securely
        # SymPy's parse_expr by default only allows mathematical operations and SymPy objects in its global_dict
        expr = parse_expr(
            expression,
            local_dict={},
            transformations=transformations,
            evaluate=True
        )
        
        # Simply return the string representation of the simplified expression
        return_dict["result"] = str(expr.evalf(10) if expr.is_number else expr.simplify())
    except Exception as e:
        return_dict["error"] = str(e)

def solve_expression_safe(expression: str, timeout: int = 3) -> Tuple[bool, str]:
    """
    Evaluates an expression safely using SymPy in a subprocess with a timeout.
    Returns (success, result_or_error_message).
    """
    manager = multiprocessing.Manager()
    return_dict = manager.dict()
    
    p = multiprocessing.Process(target=_worker, args=(expression, return_dict))
    p.start()
    p.join(timeout)
    
    if p.is_alive():
        p.terminate()
        p.join()
        return False, "Evaluation timed out."
    
    if "error" in return_dict:
        return False, return_dict["error"]
        
    return True, return_dict.get("result", "")

if __name__ == "__main__":
    # Test cases
    print(solve_expression_safe("2 + 2"))
    print(solve_expression_safe("sin(pi/2)"))
    print(solve_expression_safe("d/dx(x^2)")) # Might need special handling for derivative syntax
