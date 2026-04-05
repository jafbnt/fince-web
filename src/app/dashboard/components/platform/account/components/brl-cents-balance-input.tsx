import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";

const MAX_DIGITS = 18;

const brlFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

export function reaisToCentsDigitString(reais: number): string {
  if (!Number.isFinite(reais) || reais === 0) return "";
  const cents = Math.round(reais * 100);
  return cents <= 0 ? "" : String(cents);
}

export function centsDigitStringToReais(digits: string): number {
  if (!digits) return 0;
  const cents = parseInt(digits, 10);
  if (!Number.isFinite(cents)) return 0;
  return cents / 100;
}

export function formatBrlReais(reais: number): string {
  return brlFormatter.format(Number.isFinite(reais) ? reais : 0);
}

type BrlCentsBalanceInputProps = {
  id: string;
  value: number;
  onChange: (reais: number) => void;
  onBlur: () => void;
  disabled?: boolean;
  "aria-invalid"?: boolean;
};

export function BrlCentsBalanceInput({
  id,
  value,
  onChange,
  onBlur,
  disabled,
  "aria-invalid": ariaInvalid,
}: BrlCentsBalanceInputProps) {
  const [digits, setDigits] = useState(() => reaisToCentsDigitString(value));

  useEffect(() => {
    setDigits(reaisToCentsDigitString(value));
  }, [value]);

  const display = formatBrlReais(centsDigitStringToReais(digits));

  const applyDigits = (next: string): void => {
    const trimmed = next.slice(0, MAX_DIGITS);
    setDigits(trimmed);
    onChange(centsDigitStringToReais(trimmed));
  };

  const appendDigit = (d: string): void => {
    if (digits.length >= MAX_DIGITS) return;
    applyDigits(digits + d);
  };

  const backspace = (): void => {
    if (digits.length === 0) return;
    applyDigits(digits.slice(0, -1));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>): void => {
    if (disabled) return;
    if (e.ctrlKey || e.metaKey || e.altKey) return;

    if (e.key >= "0" && e.key <= "9") {
      e.preventDefault();
      appendDigit(e.key);
      return;
    }
    if (e.key === "Backspace") {
      e.preventDefault();
      backspace();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>): void => {
    if (disabled) return;
    e.preventDefault();
    const text = e.clipboardData.getData("text").replace(/\D/g, "");
    if (!text) return;
    const next = (digits + text).slice(0, MAX_DIGITS);
    applyDigits(next);
  };

  return (
    <Input
      id={id}
      type="text"
      inputMode="numeric"
      autoComplete="off"
      spellCheck={false}
      disabled={disabled}
      aria-invalid={ariaInvalid}
      className="tabular-nums"
      value={display}
      onKeyDown={handleKeyDown}
      onPaste={handlePaste}
      onBlur={onBlur}
      onChange={() => {}}
    />
  );
}
