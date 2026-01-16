'use client';

import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import Link from 'next/link';
import Papa from 'papaparse';
import { 
  ArrowLeft, 
  Search, 
  MapPin, 
  Building2,
  Phone,
  Calendar,
  Award,
  Info,
  Loader2,
  AlertCircle,
  CheckCircle2,
  XCircle,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  ExternalLink,
  LayoutGrid,
  List,
  Mail
} from 'lucide-react';
import { Button, Card, CardContent, Badge } from '@/components/ui';

interface BessData {
  bil: string;
  negeri: string;
  namaSyarikat: string;
  alamatTetap: string;
  alamatPerniagaan: string;
  telefon: string;
  tarikhSijil: string;
  tarikhTamat: string;
  noSiri: string;
  isActive: boolean;
  district: string;
}

const CSV_URL = 'https://raw.githubusercontent.com/irfpannn/keracunan/main/Senarai%20Pemegang%20Sijil%20Pengiktirafan%20BeSS_12012026.csv';

const ITEMS_PER_PAGE = 20;
const DEBOUNCE_DELAY = 300;

function parseDate(dateStr: string): Date | null {
  if (!dateStr) return null;
  const parts = dateStr.split('/');
  if (parts.length === 3) {
    const day = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1;
    const year = parseInt(parts[2], 10);
    return new Date(year, month, day);
  }
  return null;
}

function isDateActive(dateStr: string): boolean {
  const expiryDate = parseDate(dateStr);
  if (!expiryDate) return false;
  return expiryDate > new Date();
}

function normalizeState(state: string): string {
  return state.replace(/\n/g, ' ').replace(/\s+/g, ' ').trim().toUpperCase();
}

// Extract district from address (usually the area/city name)
function extractDistrict(address: string): string {
  // Clean up the address
  const cleaned = address.replace(/\n/g, ', ').replace(/\s+/g, ' ').trim();
  
  // Try to extract district from address patterns
  // Common pattern: "..., DISTRICT, POSTCODE STATE" or "..., DISTRICT, STATE"
  const parts = cleaned.split(',').map(p => p.trim()).filter(p => p);
  
  if (parts.length >= 2) {
    // Get second-to-last part (usually district/city)
    const potentialDistrict = parts[parts.length - 2] || parts[parts.length - 1];
    // Remove postcodes
    return potentialDistrict.replace(/\d{5}/g, '').trim().toUpperCase();
  }
  
  return 'OTHER';
}

function getGoogleMapsUrl(address: string, companyName: string): string {
  const searchQuery = `${companyName}, ${address.replace(/\n/g, ', ')}`;
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(searchQuery)}`;
}

function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
}

// Card View Component
const PremiseCard = ({ item, t, locale }: { item: BessData; t: (key: string) => string; locale: string }) => {
  const mapsUrl = getGoogleMapsUrl(item.alamatPerniagaan, item.namaSyarikat);
  
  return (
    <Card className="transition-all hover:shadow-lg hover:border-primary/30 group">
      <CardContent className="p-5">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            <div className="p-2.5 bg-gradient-to-br from-primary/20 to-primary/5 rounded-xl flex-shrink-0">
              <Building2 className="w-5 h-5 text-primary" />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="font-semibold text-base mb-1.5 line-clamp-2 group-hover:text-primary transition-colors">
                {item.namaSyarikat}
              </h3>
              <div className="flex flex-wrap items-center gap-2">
                <Badge 
                  variant={item.isActive ? 'default' : 'secondary'}
                  className={item.isActive ? 'bg-green-500/90 hover:bg-green-500' : 'bg-red-500/80 hover:bg-red-500 text-white'}
                >
                  {item.isActive ? (
                    <><CheckCircle2 className="w-3 h-3 mr-1" />{t('filter.active')}</>
                  ) : (
                    <><XCircle className="w-3 h-3 mr-1" />{t('filter.expired')}</>
                  )}
                </Badge>
                <span className="text-xs text-muted-foreground px-2 py-0.5 bg-muted rounded-full">
                  {item.negeri.replace(/\n/g, ' ')}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Details Grid */}
        <div className="space-y-3 text-sm">
          <div className="flex items-start gap-2.5 p-2.5 bg-muted/50 rounded-lg">
            <MapPin className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
            <span className="text-muted-foreground line-clamp-2">{item.alamatPerniagaan.replace(/\n/g, ', ')}</span>
          </div>
          
          <div className="grid grid-cols-2 gap-2">
            {item.telefon && (
              <a href={`tel:${item.telefon}`} className="flex items-center gap-2 p-2 rounded-lg hover:bg-muted transition-colors">
                <Phone className="w-4 h-4 text-primary" />
                <span className="text-primary hover:underline text-sm truncate">{item.telefon}</span>
              </a>
            )}
            <div className="flex items-center gap-2 p-2 text-muted-foreground">
              <Award className="w-4 h-4 text-primary" />
              <span className="text-xs truncate">{item.noSiri}</span>
            </div>
          </div>

          {/* Dates */}
          <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t">
            <div className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" />
              <span>{t('table.certDate')}: {item.tarikhSijil}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" />
              <span className={!item.isActive ? 'text-red-500' : ''}>
                {t('table.expiryDate')}: {item.tarikhTamat}
              </span>
            </div>
          </div>
        </div>

        {/* Action */}
        <div className="mt-4 pt-3 border-t">
          <a href={mapsUrl} target="_blank" rel="noopener noreferrer" className="block">
            <Button variant="outline" size="sm" className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
              <MapPin className="w-4 h-4 mr-2" />
              {locale === 'ms' ? 'Buka dalam Maps' : 'Open in Maps'}
              <ExternalLink className="w-3 h-3 ml-2" />
            </Button>
          </a>
        </div>
      </CardContent>
    </Card>
  );
};

// List View Component (Compact)
const PremiseListItem = ({ item, t, locale }: { item: BessData; t: (key: string) => string; locale: string }) => {
  const mapsUrl = getGoogleMapsUrl(item.alamatPerniagaan, item.namaSyarikat);
  
  return (
    <div className="flex items-center gap-4 p-4 bg-card border rounded-lg hover:shadow-md hover:border-primary/30 transition-all group">
      {/* Status Indicator */}
      <div className={`w-2 h-12 rounded-full flex-shrink-0 ${item.isActive ? 'bg-green-500' : 'bg-red-400'}`} />
      
      {/* Main Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <h3 className="font-medium text-sm truncate group-hover:text-primary transition-colors">
            {item.namaSyarikat}
          </h3>
          <Badge variant="outline" className="text-xs px-1.5 py-0 h-5 flex-shrink-0">
            {item.negeri.replace(/\n/g, ' ')}
          </Badge>
        </div>
        <p className="text-xs text-muted-foreground truncate">
          {item.alamatPerniagaan.replace(/\n/g, ', ')}
        </p>
      </div>

      {/* Contact */}
      <div className="hidden md:flex flex-col items-end gap-1 text-xs text-muted-foreground min-w-[140px]">
        {item.telefon && (
          <a href={`tel:${item.telefon}`} className="flex items-center gap-1 hover:text-primary">
            <Phone className="w-3 h-3" />
            <span>{item.telefon}</span>
          </a>
        )}
        <span className="flex items-center gap-1">
          <Calendar className="w-3 h-3" />
          {t('table.expiryDate')}: {item.tarikhTamat}
        </span>
      </div>

      {/* Action */}
      <a href={mapsUrl} target="_blank" rel="noopener noreferrer">
        <Button variant="ghost" size="sm" className="flex-shrink-0">
          <MapPin className="w-4 h-4" />
          <ExternalLink className="w-3 h-3 ml-1" />
        </Button>
      </a>
    </div>
  );
};

export default function BessLocatorPage() {
  const t = useTranslations('bessLocator');
  const locale = useLocale();
  const localePath = locale === 'ms' ? '' : `/${locale}`;
  
  const [data, setData] = useState<BessData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedState, setSelectedState] = useState<string>('all');
  const [selectedDistrict, setSelectedDistrict] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'expired'>('all');
  const [viewMode, setViewMode] = useState<'card' | 'list'>('card');
  const [currentPage, setCurrentPage] = useState(1);
  const dataFetchedRef = useRef(false);
  
  const debouncedSearchQuery = useDebounce(searchQuery, DEBOUNCE_DELAY);

  // Fetch data
  useEffect(() => {
    if (dataFetchedRef.current) return;
    dataFetchedRef.current = true;
    
    async function fetchData() {
      try {
        setLoading(true);
        const response = await fetch(CSV_URL);
        const csvText = await response.text();
        
        Papa.parse(csvText, {
          header: false,
          skipEmptyLines: true,
          complete: (results) => {
            const rows = results.data as string[][];
            const parsedData: BessData[] = rows.slice(1).map((row) => {
              const tarikhTamat = row[7] || '';
              const alamatPerniagaan = row[4] || '';
              return {
                bil: row[0] || '',
                negeri: row[1] || '',
                namaSyarikat: row[2] || '',
                alamatTetap: row[3] || '',
                alamatPerniagaan,
                telefon: row[5] || '',
                tarikhSijil: row[6] || '',
                tarikhTamat,
                noSiri: row[8] || '',
                isActive: isDateActive(tarikhTamat),
                district: extractDistrict(alamatPerniagaan),
              };
            }).filter(item => item.namaSyarikat);
            
            setData(parsedData);
            setLoading(false);
          },
          error: () => {
            setError(t('error'));
            setLoading(false);
          }
        });
      } catch {
        setError(t('error'));
        setLoading(false);
      }
    }
    
    fetchData();
  }, [t]);

  // Unique states
  const states = useMemo(() => {
    const uniqueStates = [...new Set(data.map(item => normalizeState(item.negeri)))];
    return uniqueStates.sort();
  }, [data]);

  // Districts filtered by selected state
  const districts = useMemo(() => {
    let filtered = data;
    if (selectedState !== 'all') {
      filtered = data.filter(item => normalizeState(item.negeri) === selectedState);
    }
    const uniqueDistricts = [...new Set(filtered.map(item => item.district))].filter(d => d && d !== 'OTHER');
    return uniqueDistricts.sort();
  }, [data, selectedState]);

  // Reset district when state changes
  useEffect(() => {
    setSelectedDistrict('all');
  }, [selectedState]);

  // Filtered data
  const filteredData = useMemo(() => {
    return data.filter(item => {
      const searchLower = debouncedSearchQuery.toLowerCase();
      const matchesSearch = !debouncedSearchQuery || 
        item.namaSyarikat.toLowerCase().includes(searchLower) ||
        item.alamatPerniagaan.toLowerCase().includes(searchLower) ||
        item.negeri.toLowerCase().includes(searchLower) ||
        item.district.toLowerCase().includes(searchLower);

      const matchesState = selectedState === 'all' || normalizeState(item.negeri) === selectedState;
      const matchesDistrict = selectedDistrict === 'all' || item.district === selectedDistrict;
      const matchesStatus = statusFilter === 'all' ||
        (statusFilter === 'active' && item.isActive) ||
        (statusFilter === 'expired' && !item.isActive);

      return matchesSearch && matchesState && matchesDistrict && matchesStatus;
    });
  }, [data, debouncedSearchQuery, selectedState, selectedDistrict, statusFilter]);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearchQuery, selectedState, selectedDistrict, statusFilter]);

  // Pagination
  const totalPages = Math.ceil(filteredData.length / ITEMS_PER_PAGE);
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredData.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredData, currentPage]);

  const activeCount = useMemo(() => filteredData.filter(d => d.isActive).length, [filteredData]);

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 300, behavior: 'smooth' });
  }, []);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <section className="bg-gradient-to-b from-accent to-background py-8 md:py-12">
        <div className="container mx-auto px-4 md:px-6">
          <Link href={`${localePath}/bantuan`} className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4">
            <ArrowLeft className="w-4 h-4 mr-1" />
            {locale === 'ms' ? 'Kembali ke Bantuan' : 'Back to Help'}
          </Link>
          
          <div className="max-w-3xl">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Award className="w-6 h-6 text-primary" />
              </div>
              <h1 className="text-2xl md:text-3xl font-bold">{t('title')}</h1>
            </div>
            <p className="text-muted-foreground">{t('subtitle')}</p>
          </div>
        </div>
      </section>

      {/* Info Card */}
      <section className="container mx-auto px-4 md:px-6 -mt-4">
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="p-4">
            <div className="flex gap-3">
              <Info className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-sm mb-1">{t('info.title')}</h3>
                <p className="text-sm text-muted-foreground">{t('info.description')}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Filters */}
      <section className="container mx-auto px-4 md:px-6 py-6">
        <div className="flex flex-col gap-4 mb-6">
          {/* Search Row */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder={t('search')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          {/* Filters Row */}
          <div className="flex flex-wrap gap-3">
            {/* State Filter */}
            <select
              value={selectedState}
              onChange={(e) => setSelectedState(e.target.value)}
              className="px-4 py-2 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-primary min-w-[160px]"
            >
              <option value="all">{t('filter.state')}</option>
              {states.map(state => (
                <option key={state} value={state}>{state}</option>
              ))}
            </select>

            {/* District Filter */}
            <select
              value={selectedDistrict}
              onChange={(e) => setSelectedDistrict(e.target.value)}
              className="px-4 py-2 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-primary min-w-[160px]"
              disabled={selectedState === 'all'}
            >
              <option value="all">{locale === 'ms' ? 'Semua Daerah' : 'All Districts'}</option>
              {districts.map(district => (
                <option key={district} value={district}>{district}</option>
              ))}
            </select>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as 'all' | 'active' | 'expired')}
              className="px-4 py-2 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="all">{t('filter.status')}</option>
              <option value="active">{t('filter.active')}</option>
              <option value="expired">{t('filter.expired')}</option>
            </select>

            {/* View Toggle */}
            <div className="flex rounded-lg border overflow-hidden ml-auto">
              <button
                onClick={() => setViewMode('card')}
                className={`px-3 py-2 flex items-center gap-2 transition-colors ${
                  viewMode === 'card' ? 'bg-primary text-primary-foreground' : 'bg-background hover:bg-muted'
                }`}
                title={locale === 'ms' ? 'Paparan Kad' : 'Card View'}
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`px-3 py-2 flex items-center gap-2 transition-colors ${
                  viewMode === 'list' ? 'bg-primary text-primary-foreground' : 'bg-background hover:bg-muted'
                }`}
                title={locale === 'ms' ? 'Paparan Senarai' : 'List View'}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-4 mb-6 text-sm text-muted-foreground">
          <span>{t('totalPremises')}: <strong className="text-foreground">{filteredData.length}</strong></span>
          <span className="flex items-center gap-1">
            <CheckCircle2 className="w-4 h-4 text-green-500" />
            {activeCount} {t('filter.active')}
          </span>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
            <span className="ml-2 text-muted-foreground">{t('loading')}</span>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-20">
            <AlertCircle className="w-12 h-12 text-destructive mb-4" />
            <p className="text-muted-foreground">{error}</p>
          </div>
        ) : filteredData.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Building2 className="w-12 h-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">{t('noResults')}</p>
          </div>
        ) : (
          <>
            {/* Card View */}
            {viewMode === 'card' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {paginatedData.map((item, index) => (
                  <PremiseCard key={`${item.bil}-${index}`} item={item} t={t} locale={locale} />
                ))}
              </div>
            ) : (
              /* List View */
              <div className="space-y-2">
                {paginatedData.map((item, index) => (
                  <PremiseListItem key={`${item.bil}-${index}`} item={item} t={t} locale={locale} />
                ))}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex flex-wrap items-center justify-center gap-2 mt-8">
                {/* First Page */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(1)}
                  disabled={currentPage === 1}
                  title={locale === 'ms' ? 'Halaman Pertama' : 'First Page'}
                >
                  <ChevronsLeft className="w-4 h-4" />
                </Button>

                {/* Previous */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                
                {/* Page Numbers */}
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum: number;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }
                    
                    return (
                      <Button
                        key={pageNum}
                        variant={currentPage === pageNum ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => handlePageChange(pageNum)}
                        className="w-10"
                      >
                        {pageNum}
                      </Button>
                    );
                  })}
                </div>

                {/* Next */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>

                {/* Last Page */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(totalPages)}
                  disabled={currentPage === totalPages}
                  title={locale === 'ms' ? 'Halaman Terakhir' : 'Last Page'}
                >
                  <ChevronsRight className="w-4 h-4" />
                </Button>

                <span className="text-sm text-muted-foreground ml-2">
                  {locale === 'ms' 
                    ? `Halaman ${currentPage} daripada ${totalPages}` 
                    : `Page ${currentPage} of ${totalPages}`
                  }
                </span>
              </div>
            )}
          </>
        )}
      </section>
    </div>
  );
}
