import React, { useEffect, useId, useRef, useState } from 'react';
import { MapPin, X } from 'lucide-react';
import { Place, findPlace, resolveTyped, searchPlaces } from '../utils/places';

interface CityPickerProps {
  /** Text in the box: a place's label ("Medellín, Antioquia") or whatever the person typed */
  value: string;
  /** `place` is the municipality when the text matches one (picked from the list or typed exactly), else null */
  onChange: (text: string, place: Place | null) => void;
  placeholder?: string;
  required?: boolean;
  /** Classes for the input itself, so it matches the form it lives in */
  inputClassName?: string;
  /** Shows a clear (×) button; used by the filters, where empty means "all of Colombia" */
  clearable?: boolean;
  id?: string;
}

const DEFAULT_INPUT =
  'w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-slate-400 focus:bg-white';

/**
 * City field with every municipality of Colombia: type a few letters and pick from the suggestions.
 * Each suggestion shows its department, because many names repeat across departments.
 */
export const CityPicker: React.FC<CityPickerProps> = ({ value, onChange, placeholder = 'Escribe tu ciudad o municipio', required, inputClassName = DEFAULT_INPUT, clearable, id }) => {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const boxRef = useRef<HTMLDivElement>(null);
  const listId = useId();

  // While the text is exactly a known place, suggest the main cities instead of repeating it
  const suggestions = searchPlaces(findPlace(value)?.label === value ? '' : value);

  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent) => {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, [open]);

  const pick = (place: Place) => {
    onChange(place.label, place);
    setOpen(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setOpen(true);
      setActive((i) => Math.min(i + 1, suggestions.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActive((i) => Math.max(i - 1, 0));
    } else if (e.key === 'Enter' && open && suggestions[active]) {
      e.preventDefault();
      pick(suggestions[active]);
    } else if (e.key === 'Escape') {
      setOpen(false);
    }
  };

  return (
    <div ref={boxRef} className="relative">
      <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
      <input
        id={id}
        type="text"
        role="combobox"
        aria-expanded={open}
        aria-controls={listId}
        aria-autocomplete="list"
        autoComplete="off"
        required={required}
        placeholder={placeholder}
        value={value}
        onFocus={() => setOpen(true)}
        onChange={(e) => {
          const text = e.target.value;
          // Typed text only counts when it can mean a single municipality; otherwise the person picks from the list
          onChange(text, resolveTyped(text));
          setActive(0);
          setOpen(true);
        }}
        onKeyDown={handleKeyDown}
        className={`${inputClassName} !pl-9 ${clearable && value ? '!pr-9' : ''}`}
      />
      {clearable && value && (
        <button
          type="button"
          onClick={() => {
            onChange('', null);
            setOpen(false);
          }}
          aria-label="Quitar ciudad"
          className="absolute right-2 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full text-slate-400 hover:text-slate-900 hover:bg-slate-200 flex items-center justify-center cursor-pointer"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      )}

      {open && (
        <ul
          id={listId}
          role="listbox"
          className="absolute z-30 left-0 right-0 mt-1 max-h-64 overflow-y-auto bg-white border border-slate-200 rounded-2xl shadow-xl p-1 text-xs"
        >
          {suggestions.length === 0 ? (
            <li className="px-3 py-2.5 text-slate-500">No encontramos ese municipio. Revisa cómo está escrito.</li>
          ) : (
            suggestions.map((place, i) => (
              <li key={place.label} role="option" aria-selected={i === active}>
                <button
                  type="button"
                  // mousedown, so the pick lands before the input loses focus
                  onMouseDown={(e) => {
                    e.preventDefault();
                    pick(place);
                  }}
                  onMouseEnter={() => setActive(i)}
                  className={`w-full text-left px-3 py-2.5 rounded-xl cursor-pointer ${i === active ? 'bg-blue-50' : 'hover:bg-slate-50'}`}
                >
                  <span className="font-semibold text-slate-900">{place.city}</span>
                  {place.label !== place.city && <span className="text-slate-500">, {place.department}</span>}
                </button>
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  );
};
