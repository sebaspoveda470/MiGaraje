import React, { useState } from 'react';
import { Camera, Loader2, X, Link as LinkIcon } from 'lucide-react';
import { compressImageFile } from '../utils/media';

interface PhotoPickerProps {
  label: string;
  images: string[];
  onChange: (images: string[]) => void;
  /** Photos are stored inside a Firestore document (1 MB max), so keep this small */
  max?: number;
  onProcessingChange?: (isProcessing: boolean) => void;
}

/**
 * Multi-photo uploader: files (compressed) or links. The first photo is the main one.
 */
export const PhotoPicker: React.FC<PhotoPickerProps> = ({ label, images, onChange, max = 4, onProcessingChange }) => {
  const [urlInput, setUrlInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const setProcessing = (value: boolean) => {
    setIsProcessing(value);
    onProcessingChange?.(value);
  };

  const handleFiles = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from<File>(e.target.files || []).slice(0, max - images.length);
    e.target.value = '';
    if (files.length === 0) return;
    setProcessing(true);
    try {
      const compressed = await Promise.all(files.map((file) => compressImageFile(file, 800, 0.7)));
      onChange([...images, ...compressed].slice(0, max));
    } catch (err) {
      console.error('Error optimizando foto', err);
    } finally {
      setProcessing(false);
    }
  };

  const addUrl = () => {
    const url = urlInput.trim();
    if (!/^https?:\/\//.test(url) || images.length >= max) return;
    onChange([...images, url]);
    setUrlInput('');
  };

  const remove = (index: number) => onChange(images.filter((_, i) => i !== index));
  const makeMain = (index: number) => onChange([images[index], ...images.filter((_, i) => i !== index)]);

  return (
    <div className="space-y-3 border border-slate-200 rounded-2xl p-3.5 bg-slate-50/60 text-xs">
      <div className="flex items-center justify-between">
        <span className="block font-bold text-slate-800">{label}</span>
        <span className="text-[11px] text-slate-500">{images.length} de {max}</span>
      </div>

      {images.length > 0 && (
        <div className="grid grid-cols-4 gap-2">
          {images.map((src, idx) => (
            <div key={idx} className={`relative aspect-square rounded-xl overflow-hidden border-2 ${idx === 0 ? 'border-blue-600' : 'border-slate-200'}`}>
              <img src={src} alt={`Foto ${idx + 1}`} className="w-full h-full object-cover" />
              {idx === 0 ? (
                <span className="absolute bottom-0 inset-x-0 bg-blue-600 text-white text-[9px] font-black text-center py-0.5">Principal</span>
              ) : (
                <button
                  type="button"
                  onClick={() => makeMain(idx)}
                  className="absolute bottom-0 inset-x-0 bg-black/60 hover:bg-black/80 text-white text-[9px] font-bold text-center py-0.5 cursor-pointer"
                >
                  Hacer principal
                </button>
              )}
              <button
                type="button"
                onClick={() => remove(idx)}
                aria-label={`Quitar foto ${idx + 1}`}
                className="absolute top-1 right-1 w-5 h-5 bg-black/70 hover:bg-red-600 text-white rounded-full flex items-center justify-center cursor-pointer"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      {images.length < max && (
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          <label className="flex items-center justify-center gap-2 bg-white hover:bg-slate-100 border border-slate-300 text-slate-800 font-bold px-4 py-2 rounded-xl cursor-pointer shadow-xs shrink-0">
            {isProcessing ? <Loader2 className="w-4 h-4 animate-spin text-blue-600" /> : <Camera className="w-4 h-4 text-blue-600" />}
            <span>{isProcessing ? 'Procesando...' : 'Subir Fotos'}</span>
            <input type="file" accept="image/*" multiple className="hidden" onChange={handleFiles} />
          </label>

          <div className="flex flex-1 items-center gap-1.5">
            <input
              type="url"
              placeholder="o pega el enlace de una foto (https://...)"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addUrl();
                }
              }}
              className="flex-1 min-w-0 bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-slate-400"
            />
            <button
              type="button"
              onClick={addUrl}
              aria-label="Agregar foto desde enlace"
              className="shrink-0 w-9 h-9 rounded-xl bg-white border border-slate-300 hover:bg-slate-100 flex items-center justify-center cursor-pointer"
            >
              <LinkIcon className="w-4 h-4 text-slate-600" />
            </button>
          </div>
        </div>
      )}

      <p className="text-[11px] text-slate-500">
        Puedes elegir varias fotos a la vez. La marcada como "Principal" es la que se ve primero.
      </p>
    </div>
  );
};

/**
 * Main photo with clickable thumbnails.
 */
export const PhotoGallery: React.FC<{
  images: string[];
  alt: string;
  aspectClass?: string;
  overlay?: React.ReactNode;
}> = ({ images, alt, aspectClass = 'aspect-square', overlay }) => {
  const [active, setActive] = useState(0);
  const current = images[active] || images[0];

  return (
    <div className="space-y-2">
      <div className={`${aspectClass} rounded-2xl bg-slate-100 overflow-hidden relative border border-slate-200`}>
        <img src={current} alt={alt} className="w-full h-full object-cover" />
        {overlay}
        {images.length > 1 && (
          <div className="absolute bottom-3 right-3 bg-black/60 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
            {active + 1} / {images.length}
          </div>
        )}
      </div>
      {images.length > 1 && (
        <div className="grid grid-cols-5 gap-2">
          {images.map((src, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setActive(idx)}
              aria-label={`Ver foto ${idx + 1}`}
              className={`aspect-square rounded-xl overflow-hidden border-2 cursor-pointer transition-all ${
                idx === active ? 'border-blue-600' : 'border-transparent opacity-70 hover:opacity-100'
              }`}
            >
              <img src={src} alt="" className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
