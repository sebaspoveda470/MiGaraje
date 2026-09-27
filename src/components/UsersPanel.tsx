import React, { useEffect, useMemo, useState } from 'react';
import { X, Users, Search, Loader2, Mail, MessageCircle, MapPin, Car, Download, RefreshCw, Tag } from 'lucide-react';
import { VehicleListing } from '../types';
import { getRegisteredUsers, RegisteredUser } from '../services/adminService';
import { toWhatsAppNumber } from '../utils/media';

interface UsersPanelProps {
  isOpen: boolean;
  carListings: VehicleListing[];
  onClose: () => void;
  onError: (message: string, err: unknown) => void;
}

const ROLE_LABELS: Record<string, string> = {
  propietario: 'Propietario',
  entusiasta: 'Entusiasta',
  coleccionista: 'Coleccionista',
  mecanico: 'Mecánico',
  tienda_aliada: 'Tienda aliada',
};

// Plain dates (YYYY-MM-DD) are read at midday so the Colombian time zone doesn't show the day before
const formatDate = (iso?: string) =>
  iso
    ? new Date(iso.length === 10 ? `${iso}T12:00:00` : iso).toLocaleDateString('es-CO', { day: 'numeric', month: 'short', year: 'numeric' })
    : '—';

const vehicleLabel = (v: RegisteredUser['vehicles'][number]) => `${v.brand} ${v.model} ${v.year}`;

/** Spreadsheet-friendly CSV (Excel opens it with accents thanks to the BOM) */
function downloadCsv(rows: RegisteredUser[], listingsByOwner: Map<string, number>) {
  const header = ['Nombre', 'Correo', 'Celular', 'Ciudad', 'Perfil', 'Registro', 'Vehículos', 'Placas', 'Anuncios en venta'];
  const escape = (value: string | number) => `"${String(value ?? '').replace(/"/g, '""')}"`;
  const lines = rows.map(({ profile, vehicles }) =>
    [
      profile.fullName,
      profile.email,
      profile.phone || '',
      profile.city || '',
      ROLE_LABELS[profile.role || ''] || '',
      formatDate(profile.joinedDate),
      vehicles.map(vehicleLabel).join(' | '),
      vehicles.map((v) => v.plate || '').filter(Boolean).join(' | '),
      listingsByOwner.get(profile.id) || 0,
    ]
      .map(escape)
      .join(';')
  );
  const blob = new Blob(['﻿' + [header.map(escape).join(';'), ...lines].join('\r\n')], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `usuarios-migaraje-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export const UsersPanel: React.FC<UsersPanelProps> = ({ isOpen, carListings, onClose, onError }) => {
  const [users, setUsers] = useState<RegisteredUser[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [search, setSearch] = useState('');

  const load = async () => {
    setIsLoading(true);
    try {
      setUsers(await getRegisteredUsers());
    } catch (err) {
      onError('No se pudieron cargar los usuarios. ¿Publicaste las nuevas reglas de Firestore?', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Loaded when opened (not live) to keep reads low
  useEffect(() => {
    if (isOpen) load();
  }, [isOpen]);

  const listingsByOwner = useMemo(() => {
    const counts = new Map<string, number>();
    carListings.forEach((l) => {
      if (l.ownerId && l.status !== 'vendido') counts.set(l.ownerId, (counts.get(l.ownerId) || 0) + 1);
    });
    return counts;
  }, [carListings]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!users || !q) return users || [];
    return users.filter(({ profile, vehicles }) =>
      [profile.fullName, profile.email, profile.phone, profile.city, ...vehicles.flatMap((v) => [v.brand, v.model, v.plate])]
        .some((field) => (field || '').toLowerCase().includes(q))
    );
  }, [users, search]);

  const stats = useMemo(() => {
    const all = users || [];
    const vehicles = all.flatMap((u) => u.vehicles);
    const brandCounts = new Map<string, number>();
    vehicles.forEach((v) => brandCounts.set(v.brand, (brandCounts.get(v.brand) || 0) + 1));
    const topBrand = [...brandCounts.entries()].sort((a, b) => b[1] - a[1])[0];
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    return {
      users: all.length,
      vehicles: vehicles.length,
      newThisWeek: all.filter((u) => (u.profile.joinedDate || '') >= weekAgo).length,
      topBrand: topBrand ? `${topBrand[0]} (${topBrand[1]})` : '—',
    };
  }, [users]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex justify-end animate-in fade-in duration-200">
      <div className="bg-slate-50 w-full sm:max-w-2xl h-[100dvh] flex flex-col shadow-2xl animate-in slide-in-from-right duration-200">
        <div className="shrink-0 p-4 sm:p-5 border-b border-slate-200 bg-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-950">Usuarios registrados</h3>
              <p className="text-[11px] text-slate-500">Solo tú ves esta sección • datos protegidos (Ley 1581)</p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Cerrar usuarios"
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-950 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Summary */}
        <div className="shrink-0 grid grid-cols-2 sm:grid-cols-4 gap-2 px-4 sm:px-5 py-3 bg-white border-b border-slate-200">
          {[
            { label: 'Usuarios', value: stats.users },
            { label: 'Nuevos (7 días)', value: stats.newThisWeek },
            { label: 'Vehículos', value: stats.vehicles },
            { label: 'Marca más común', value: stats.topBrand },
          ].map((s) => (
            <div key={s.label} className="rounded-xl bg-slate-50 border border-slate-200 px-3 py-2">
              <div className="text-base font-black text-slate-950 truncate">{users ? s.value : '…'}</div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Search & actions */}
        <div className="shrink-0 px-4 sm:px-5 py-3 bg-white border-b border-slate-200 flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar nombre, correo, ciudad, marca o placa…"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-slate-400 focus:bg-white"
            />
          </div>
          <button
            onClick={load}
            disabled={isLoading}
            title="Actualizar"
            aria-label="Actualizar"
            className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 cursor-pointer disabled:opacity-60"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={() => downloadCsv(filtered, listingsByOwner)}
            disabled={!filtered.length}
            className="px-3 py-2 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">Descargar Excel</span>
          </button>
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto p-4 sm:p-5 space-y-3">
          {!users && isLoading && (
            <div className="flex items-center justify-center gap-2 py-16 text-xs text-slate-500">
              <Loader2 className="w-4 h-4 animate-spin" /> Cargando usuarios…
            </div>
          )}

          {users && filtered.length === 0 && (
            <div className="text-center py-16 text-xs text-slate-500">
              {search ? 'Nadie coincide con la búsqueda.' : 'Aún no hay usuarios registrados.'}
            </div>
          )}

          {filtered.map(({ profile, vehicles }) => {
            const wa = toWhatsAppNumber(profile.phone);
            const listings = listingsByOwner.get(profile.id) || 0;
            return (
              <div key={profile.id} className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs space-y-3 text-xs">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-xl bg-slate-950 text-white font-bold flex items-center justify-center shrink-0">
                      {(profile.fullName || '?').charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <div className="font-black text-slate-950 text-sm truncate">{profile.fullName || 'Sin nombre'}</div>
                      <div className="text-[11px] text-slate-500">
                        {ROLE_LABELS[profile.role || ''] || 'Propietario'} • se registró el {formatDate(profile.joinedDate)}
                      </div>
                    </div>
                  </div>
                  {listings > 0 && (
                    <span className="shrink-0 text-[10px] font-black px-2 py-0.5 rounded-full bg-blue-50 text-blue-800 border border-blue-200 flex items-center gap-1">
                      <Tag className="w-3 h-3" /> {listings} en venta
                    </span>
                  )}
                </div>

                <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-slate-700">
                  <a href={`mailto:${profile.email}`} className="inline-flex items-center gap-1.5 hover:text-blue-700 break-all">
                    <Mail className="w-3.5 h-3.5 shrink-0 text-slate-400" /> {profile.email}
                  </a>
                  {profile.phone && (
                    wa ? (
                      <a
                        href={`https://wa.me/${wa}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 hover:text-emerald-700"
                      >
                        <MessageCircle className="w-3.5 h-3.5 shrink-0 text-emerald-600" /> {profile.phone}
                      </a>
                    ) : (
                      <span className="inline-flex items-center gap-1.5">
                        <MessageCircle className="w-3.5 h-3.5 shrink-0 text-slate-400" /> {profile.phone}
                      </span>
                    )
                  )}
                  {profile.city && (
                    <span className="inline-flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 shrink-0 text-slate-400" /> {profile.city}
                    </span>
                  )}
                </div>

                {vehicles.length === 0 ? (
                  <div className="text-[11px] text-slate-400 italic">Sin vehículos registrados</div>
                ) : (
                  <div className="space-y-1.5">
                    {vehicles.map((v) => (
                      <div key={v.id} className="flex items-center gap-2.5 p-2 rounded-xl bg-slate-50 border border-slate-200">
                        {v.image ? (
                          <img src={v.image} alt="" className="w-12 h-9 rounded-lg object-cover shrink-0 bg-slate-200" />
                        ) : (
                          <div className="w-12 h-9 rounded-lg bg-slate-200 flex items-center justify-center shrink-0">
                            <Car className="w-4 h-4 text-slate-500" />
                          </div>
                        )}
                        <div className="min-w-0 flex-1">
                          <div className="font-bold text-slate-900 truncate">
                            {vehicleLabel(v)}
                            {v.plate && <span className="ml-1.5 text-[10px] font-black px-1.5 py-0.5 rounded bg-yellow-300 text-slate-950">{v.plate}</span>}
                          </div>
                          <div className="text-[11px] text-slate-500 truncate">
                            {v.mileage.toLocaleString('es-CO')} km • {v.transmission} • {v.fuelType}
                            {v.soatExpiry && ` • SOAT ${formatDate(v.soatExpiry)}`}
                            {v.tecnoExpiry && ` • Tecno ${formatDate(v.tecnoExpiry)}`}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}

          {users && (
            <p className="text-[10px] text-slate-400 text-center pt-2 leading-relaxed">
              Aquí aparecen quienes completaron el formulario de bienvenida. Úsalos solo para atender a tus clientes,
              como indica tu Política de Privacidad.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
