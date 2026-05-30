'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Loading from '@/components/ui/loading';
import EmptyState from '@/components/ui/empty-state';
import { Home, MapPin, Search, ChevronLeft, ChevronRight } from 'lucide-react';

interface HouseData {
  id: number;
  name: string;
  town: string;
  rent: number;
  size: number;
  beds: number;
  owner?: string;
  status: 'rented' | 'available' | 'auctioned';
}

export default function HousesPage() {
  const [houses, setHouses] = useState<HouseData[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [townFilter, setTownFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    let cancelled = false;
    const params = new URLSearchParams({ page: page.toString(), limit: '25' });
    if (townFilter !== 'all') params.set('town', townFilter);
    fetch(`/api/houses?${params}`)
      .then(r => r.json())
      .then(data => {
        if (cancelled) return;
        if (data.success) {
          setHouses(data.data || []);
          if (data.pagination) setTotalPages(data.pagination.totalPages || 1);
        }
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [page, townFilter]);

  const towns = [...new Set(houses.map(h => h.town))];

  const filtered = filter
    ? houses.filter(h => h.name.toLowerCase().includes(filter.toLowerCase()))
    : houses;

  if (loading) return <Loading text="Cargando casas..." />;

  return (
    <div className="mx-auto max-w-5xl px-4 py-6 space-y-4">
      <Card className="border-amber-500/20 bg-[#12121f]">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
            <Home className="h-5 w-5 text-amber-500" />
            Casas del Servidor
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Buscar casa..."
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="w-full rounded-md border border-amber-500/20 bg-[#1a1a2e] px-3 py-2 pl-10 text-sm text-foreground placeholder:text-muted-foreground/50 focus:border-amber-500/40 focus:outline-none"
              />
            </div>
            {towns.length > 0 && (
              <div className="flex gap-2 flex-wrap">
                <button
                  onClick={() => setTownFilter('all')}
                  className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                    townFilter === 'all'
                      ? 'bg-amber-500/20 text-amber-400'
                      : 'bg-[#1a1a2e] text-muted-foreground hover:text-foreground'
                  }`}
                >
                  Todas
                </button>
                {towns.map(town => (
                  <button
                    key={town}
                    onClick={() => { setTownFilter(town); setPage(1); }}
                    className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                      townFilter === town
                        ? 'bg-amber-500/20 text-amber-400'
                        : 'bg-[#1a1a2e] text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {town}
                  </button>
                ))}
              </div>
            )}
          </div>

          {filtered.length === 0 ? (
            <EmptyState
              icon={<Home className="h-12 w-12" />}
              title="No se encontraron casas"
              description="No hay casas que coincidan con tu búsqueda."
            />
          ) : (
            <>
              <div className="space-y-2">
                {filtered.map(house => (
                  <div
                    key={house.id}
                    className="flex items-center justify-between rounded-md bg-[#1a1a2e] px-4 py-3 transition-colors hover:bg-amber-500/5"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${
                        house.status === 'available' ? 'bg-green-500/10' :
                        house.status === 'auctioned' ? 'bg-amber-500/10' :
                        'bg-[#12121f]'
                      }`}>
                        <Home className={`h-4 w-4 ${
                          house.status === 'available' ? 'text-green-400' :
                          house.status === 'auctioned' ? 'text-amber-400' :
                          'text-muted-foreground'
                        }`} />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">{house.name}</p>
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {house.town} • {house.beds} camas • {house.size} sqm
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <p className="text-xs text-muted-foreground">{house.status === 'available' ? 'Disponible' : house.status === 'auctioned' ? 'Subasta' : 'Alquilada'}</p>
                        <p className="text-sm font-medium text-amber-400">{house.rent.toLocaleString('es-ES')} gp/mes</p>
                        {house.owner && (
                          <p className="text-xs text-muted-foreground">Dueño: {house.owner}</p>
                        )}
                      </div>
                      {house.status === 'available' && (
                        <Badge className="bg-green-500/20 text-green-400 border-green-500/30 text-[10px]">
                          Disponible
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {totalPages > 1 && (
                <div className="mt-4 flex items-center justify-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="border-amber-500/20"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <span className="text-sm text-muted-foreground">Página {page} de {totalPages}</span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="border-amber-500/20"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
