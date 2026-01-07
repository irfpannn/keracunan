'use client';

import { useState, useEffect } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import Papa from 'papaparse';
import { Card, CardContent } from '@/components/ui/Card';
import { Input } from '@/components/ui';
import { Button } from '@/components/ui/Button';
import { MapPin, Search, Navigation, Phone, Building2 } from 'lucide-react';
import Link from 'next/link';

type Facility = {
  state: string;
  district: string;
  sector: string;
  type: string;
  name: string;
  address: string;
  phone: string;
  lat: string;
  lon: string;
};

const CSV_URL = 'https://raw.githubusercontent.com/MoH-Malaysia/data-resources-public/main/facilities_master.csv';

export default function FindClinicPage() {
  const t = useTranslations('findClinic');
  const tCommon = useTranslations('common');
  
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedState, setSelectedState] = useState('All');
  const [selectedType, setSelectedType] = useState('All');

  useEffect(() => {
    fetch(CSV_URL)
      .then(response => response.text())
      .then(csvText => {
        Papa.parse<Facility>(csvText, {
          header: true,
          skipEmptyLines: true,
          complete: (results) => {
            setFacilities(results.data);
            setLoading(false);
          },
          error: () => {
            setError(true);
            setLoading(false);
          }
        });
      })
      .catch(() => {
        setError(true);
        setLoading(false);
      });
  }, []);

  const states = Array.from(new Set(facilities.map(f => f.state))).sort();
  const types = Array.from(new Set(facilities.map(f => f.type))).sort();

  const filteredFacilities = facilities.filter(f => {
    const matchesSearch = 
      f.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      f.district.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesState = selectedState === 'All' || f.state === selectedState;
    const matchesType = selectedType === 'All' || f.type === selectedType;
    return matchesSearch && matchesState && matchesType;
  });

  // Limit display to 50 items to prevent rendering lag
  const displayFacilities = filteredFacilities.slice(0, 50);

  return (
    <div className="min-h-screen py-8 bg-muted/30">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold mb-2">{t('title')}</h1>
            <p className="text-muted-foreground">{t('subtitle')}</p>
        </div>

        {/* Search & Filters */}
        <div className="bg-card p-4 rounded-xl shadow-sm border mb-8 space-y-4 md:space-y-0 md:flex gap-4">
            <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input 
                    placeholder={t('search')} 
                    className="pl-9" 
                    value={searchTerm}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
                />
            </div>
            <select 
                className="h-10 px-3 rounded-md border bg-background text-sm"
                value={selectedState}
                onChange={(e) => setSelectedState(e.target.value)}
            >
                <option value="All">{t('filter.state')}</option>
                {states.map(state => <option key={state} value={state}>{state}</option>)}
            </select>
            <select 
                className="h-10 px-3 rounded-md border bg-background text-sm"
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
            >
                <option value="All">{t('filter.type')}</option>
                {types.map(type => (
                    <option key={type} value={type}>
                        {type.replace(/\b\w/g, c => c.toUpperCase())}
                    </option>
                ))}
            </select>
        </div>

        {/* List */}
        {loading ? (
            <div className="text-center py-12 text-muted-foreground">{t('loading')}</div>
        ) : error ? (
            <div className="text-center py-12 text-destructive">{t('error')}</div>
        ) : displayFacilities.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">{t('noResults')}</div>
        ) : (
            <div className="grid gap-4">
                {displayFacilities.map((facility, index) => (
                    <Card key={index} className="hover:shadow-md transition-shadow">
                        <CardContent className="p-6">
                            <div className="flex flex-col md:flex-row gap-4 justify-between items-start">
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2">
                                        <Building2 className="w-5 h-5 text-primary" />
                                        <h3 className="font-semibold text-lg">{facility.name}</h3>
                                        <span className="text-xs bg-secondary px-2 py-0.5 rounded capitalize">
                                            {facility.type}
                                        </span>
                                    </div>
                                    <div className="flex items-start gap-2 text-muted-foreground text-sm">
                                        <MapPin className="w-4 h-4 shrink-0 mt-0.5" />
                                        <p>{facility.address}</p>
                                    </div>
                                    <div className="flex items-center gap-2 text-muted-foreground text-sm">
                                        <Phone className="w-4 h-4 shrink-0" />
                                        <p>{facility.phone || '-'}</p>
                                    </div>
                                </div>
                                <Button size="sm" asChild className="shrink-0 gap-2">
                                    <a 
                                        href={`https://www.google.com/maps/dir/?api=1&destination=${facility.lat},${facility.lon}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    >
                                        <Navigation className="w-4 h-4" />
                                        {t('table.directions')}
                                    </a>
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        )}
         {!loading && filteredFacilities.length > 50 && (
            <div className="text-center mt-6 text-sm text-muted-foreground">
                Showing first 50 results. Please refine your search.
            </div>
         )}
      </div>
    </div>
  );
}
