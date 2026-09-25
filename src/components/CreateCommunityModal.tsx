import React, { useState } from 'react';
import { X, Users, Camera, Loader2 } from 'lucide-react';
import { CommunityClub, CommunityCategory } from '../types';
import { compressImageFile } from '../utils/media';

interface CreateCommunityModalProps {
  isOpen: boolean;
  defaultBrand?: string;
  onClose: () => void;
  onCreate: (community: Omit<CommunityClub, 'id' | 'memberIds' | 'createdBy' | 'createdAt'>) => Promise<void>;
}

const CATEGORY_OPTIONS: { id: CommunityCategory; label: string }[] = [
  { id: 'marca', label: 'Club de marca' },
  { id: 'clasicos', label: 'Clásicos & restauración' },
  { id: 'offroad', label: '4x4 & Off-road' },
  { id: 'rendimiento', label: 'Deportivos & rendimiento' },
  { id: 'region', label: 'Ciudad / región' },
];

const DEFAULT_LOGO = 'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?auto=format&fit=crop&w=200&q=80';

const inputClass =
  'w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 focus:outline-none focus:border-slate-400 focus:bg-white';

const splitList = (text: string, separator: RegExp) =>
  text
    .split(separator)
    .map((item) => item.trim())
    .filter(Boolean);

export const CreateCommunityModal: React.FC<CreateCommunityModalProps> = ({ isOpen, defaultBrand, onClose, onCreate }) => {
  const [name, setName] = useState('');
  const [brand, setBrand] = useState(defaultBrand || '');
  const [category, setCategory] = useState<CommunityCategory>('marca');
  const [description, setDescription] = useState('');
  const [modelsText, setModelsText] = useState('');
  const [rulesText, setRulesText] = useState('Respeto entre miembros.\nNada de ventas de repuestos de dudosa procedencia.');
  const [logo, setLogo] = useState('');
  const [isProcessingImage, setIsProcessingImage] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsProcessingImage(true);
    try {
      setLogo(await compressImageFile(file, 300, 0.8));
    } catch (err) {
      console.error('Error procesando imagen', err);
    } finally {
      setIsProcessingImage(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !brand.trim()) return;
    setIsSaving(true);
    setError(null);
    try {
      await onCreate({
        name: name.trim(),
        brand: brand.trim(),
        category,
        description: description.trim(),
        models: splitList(modelsText, /,/).slice(0, 40),
        rules: splitList(rulesText, /\n/).slice(0, 20),
        logo: logo || DEFAULT_LOGO,
      });
      setName('');
      setDescription('');
      setModelsText('');
      setLogo('');
      onClose();
    } catch (err) {
      console.error(err);
      setError('No se pudo crear la comunidad. Revisa tu conexión e inténtalo de nuevo.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white border border-slate-200 rounded-3xl max-w-lg w-full shadow-2xl p-6 relative max-h-[92dvh] overflow-y-auto">
        <button onClick={onClose} aria-label="Cerrar" className="absolute top-4 right-4 text-slate-400 hover:text-slate-800 cursor-pointer">
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-5 pr-6">
          <div className="p-2.5 rounded-2xl bg-slate-100">
            <Users className="w-6 h-6 text-slate-900" />
          </div>
          <div>
            <h3 className="text-lg font-black text-slate-950">Crear una Comunidad</h3>
            <p className="text-xs text-slate-500">Reúne a los propietarios de tu marca, modelo o ciudad</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs text-slate-700">
          <div className="flex items-center gap-3">
            <label className="w-16 h-16 rounded-2xl bg-slate-100 border border-dashed border-slate-300 flex items-center justify-center overflow-hidden cursor-pointer shrink-0 hover:border-slate-400">
              {logo ? (
                <img src={logo} alt="Logo de la comunidad" className="w-full h-full object-cover" />
              ) : isProcessingImage ? (
                <Loader2 className="w-5 h-5 text-slate-400 animate-spin" />
              ) : (
                <Camera className="w-5 h-5 text-slate-400" />
              )}
              <input type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />
            </label>
            <div className="flex-1">
              <label className="block font-semibold text-slate-900 mb-1">Nombre de la comunidad *</label>
              <input
                type="text"
                required
                maxLength={80}
                placeholder="Ej: Club Renault 4 Medellín"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={inputClass}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-900 mb-1">Marca o tema *</label>
              <input
                type="text"
                required
                maxLength={60}
                placeholder="Ej: Renault"
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-900 mb-1">Tipo</label>
              <select value={category} onChange={(e) => setCategory(e.target.value as CommunityCategory)} className={inputClass}>
                {CATEGORY_OPTIONS.map((c) => (
                  <option key={c.id} value={c.id}>{c.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-900 mb-1">Descripción</label>
            <textarea
              rows={3}
              maxLength={1000}
              placeholder="¿De qué trata la comunidad? ¿Quiénes pueden unirse?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className={`${inputClass} resize-none`}
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-900 mb-1">Modelos (separados por coma)</label>
            <input
              type="text"
              placeholder="Ej: Renault 4, Renault 6, Twingo"
              value={modelsText}
              onChange={(e) => setModelsText(e.target.value)}
              className={inputClass}
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-900 mb-1">Normas (una por línea)</label>
            <textarea rows={3} value={rulesText} onChange={(e) => setRulesText(e.target.value)} className={`${inputClass} resize-none`} />
          </div>

          {error && <p className="text-xs text-red-700 bg-red-50 border border-red-200 rounded-xl px-3 py-2 font-semibold">{error}</p>}

          <div className="pt-1 flex justify-end gap-2">
            <button type="button" onClick={onClose} className="px-4 py-2 text-slate-600 hover:text-slate-900 font-semibold cursor-pointer">
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSaving || isProcessingImage}
              className="bg-slate-950 hover:bg-slate-800 text-white font-bold px-5 py-2.5 rounded-xl shadow-xs cursor-pointer flex items-center gap-1.5 disabled:opacity-60"
            >
              {isSaving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              Crear Comunidad
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
