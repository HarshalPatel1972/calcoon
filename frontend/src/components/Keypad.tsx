"use client";

import React from "react";
import { Button } from "./Button";
import { Delete } from "lucide-react"; // Using lucide-react for the backspace icon

interface KeypadProps {
  onKeyPress: (key: string) => void;
  onAction: (action: "clear" | "backspace" | "evaluate") => void;
}

export function Keypad({ onKeyPress, onAction }: KeypadProps) {
  return (
    <div className="grid grid-cols-4 gap-3 p-4 bg-surface rounded-b-3xl">
      {/* Row 1 */}
      <Button label="AC" variant="action" onClick={() => onAction("clear")} />
      <Button label={<Delete size={24} />} variant="action" onClick={() => onAction("backspace")} />
      <Button label="%" variant="operator" onClick={() => onKeyPress("%")} />
      <Button label="÷" variant="operator" onClick={() => onKeyPress("/")} />

      {/* Row 2 */}
      <Button label="7" variant="number" onClick={() => onKeyPress("7")} />
      <Button label="8" variant="number" onClick={() => onKeyPress("8")} />
      <Button label="9" variant="number" onClick={() => onKeyPress("9")} />
      <Button label="×" variant="operator" onClick={() => onKeyPress("*")} />

      {/* Row 3 */}
      <Button label="4" variant="number" onClick={() => onKeyPress("4")} />
      <Button label="5" variant="number" onClick={() => onKeyPress("5")} />
      <Button label="6" variant="number" onClick={() => onKeyPress("6")} />
      <Button label="−" variant="operator" onClick={() => onKeyPress("-")} />

      {/* Row 4 */}
      <Button label="1" variant="number" onClick={() => onKeyPress("1")} />
      <Button label="2" variant="number" onClick={() => onKeyPress("2")} />
      <Button label="3" variant="number" onClick={() => onKeyPress("3")} />
      <Button label="+" variant="operator" onClick={() => onKeyPress("+")} />

      {/* Row 5 */}
      <Button label="0" className="col-span-2" variant="number" onClick={() => onKeyPress("0")} />
      <Button label="." variant="number" onClick={() => onKeyPress(".")} />
      <Button label="=" variant="accent" onClick={() => onAction("evaluate")} />
    </div>
  );
}
