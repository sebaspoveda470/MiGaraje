import React, { useEffect, useState } from 'react';

interface NumberInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange' | 'type'> {
  value: number;
  /** An empty box reports 0 */
  onChange: (value: number) => void;
}

/**
 * Number box that can be left empty while typing: clearing it shows nothing (not a "0"),
 * so the next digits don't end up after a leftover zero.
 */
export const NumberInput: React.FC<NumberInputProps> = ({ value, onChange, ...rest }) => {
  const [text, setText] = useState(value ? String(value) : '');

  // The number changed from outside (form reset, editing another vehicle): show it
  useEffect(() => {
    setText((current) => (Number(current) === value ? current : value ? String(value) : ''));
  }, [value]);

  return (
    <input
      {...rest}
      type="number"
      inputMode="numeric"
      value={text}
      onChange={(e) => {
        setText(e.target.value);
        onChange(Number(e.target.value));
      }}
    />
  );
};
