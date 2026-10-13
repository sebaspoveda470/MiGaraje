import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';

interface NumberInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange' | 'type' | 'min' | 'max'> {
  value: number;
  /** An empty box reports 0 */
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  /** Shows thousands separators while typing ("75.000.000"): for prices and kilometers, not for years */
  grouped?: boolean;
}

const digitsOf = (text: string) => text.replace(/\D/g, '');
// Colombian style: a dot every three digits
const group = (digits: string) => digits.replace(/\B(?=(\d{3})+(?!\d))/g, '.');

/**
 * Number box that can be left empty while typing: clearing it shows nothing (not a "0"),
 * so the next digits don't end up after a leftover zero.
 */
export const NumberInput: React.FC<NumberInputProps> = ({ value, onChange, grouped, min, max, ...rest }) => {
  const show = (digits: string) => (grouped ? group(digits) : digits);
  const [text, setText] = useState(value ? show(String(value)) : '');
  const inputRef = useRef<HTMLInputElement>(null);
  // Digits left of the cursor after an edit: the separators move, the cursor must not jump to the end
  const caretDigits = useRef<number | null>(null);

  // The number changed from outside (form reset, editing another vehicle): show it
  useEffect(() => {
    setText((current) => (Number(digitsOf(current)) === value ? current : value ? show(String(value)) : ''));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  useLayoutEffect(() => {
    const el = inputRef.current;
    if (!el || !grouped) return;
    if (caretDigits.current !== null && document.activeElement === el) {
      let pos = 0;
      for (let seen = 0; pos < text.length && seen < caretDigits.current; pos++) {
        if (/\d/.test(text[pos])) seen++;
      }
      el.setSelectionRange(pos, pos);
      caretDigits.current = null;
    }
    // A text box has no min/max of its own: same messages the browser gives for number boxes
    const n = Number(digitsOf(text));
    const fmt = (limit: number) => limit.toLocaleString('es-CO');
    el.setCustomValidity(
      text === '' ? '' : min !== undefined && n < min ? `El valor debe ser ${fmt(min)} o más.` : max !== undefined && n > max ? `El valor debe ser ${fmt(max)} o menos.` : ''
    );
  }, [text, grouped, min, max]);

  if (!grouped) {
    return (
      <input
        {...rest}
        type="number"
        inputMode="numeric"
        min={min}
        max={max}
        value={text}
        onChange={(e) => {
          setText(e.target.value);
          onChange(Number(e.target.value));
        }}
      />
    );
  }

  return (
    <input
      {...rest}
      ref={inputRef}
      type="text"
      inputMode="numeric"
      autoComplete="off"
      value={text}
      onChange={(e) => {
        // Up to 12 digits; leading zeros go ("007" → "7"), a lone "0" stays
        const digits = digitsOf(e.target.value).slice(0, 12).replace(/^0+(?=\d)/, '');
        caretDigits.current = digitsOf(e.target.value.slice(0, e.target.selectionStart ?? e.target.value.length)).length;
        setText(group(digits));
        onChange(Number(digits));
      }}
    />
  );
};
