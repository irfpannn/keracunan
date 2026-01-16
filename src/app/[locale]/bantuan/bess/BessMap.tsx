'use client';

import { useEffect, useRef, useCallback, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Loader2, Search } from 'lucide-react';
import { Button } from '@/components/ui';

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
  coordinates?: [number, number];
  isActive: boolean;
}

interface BessMapProps {
  data: BessData[];
  selectedPremise: BessData | null;
  onSelectPremise: (premise: BessData | null) => void;
  locale: string;
}

// Geocoding cache to avoid repeated API calls
const geocodeCache = new Map<string, [number, number] | null>();

// Rate limiter for Nominatim (max 1 request per second)
let lastGeocodingTime = 0;
const GEOCODING_DELAY = 1100; // ms between requests

async function geocodeAddress(address: string): Promise<[number, number] | null> {
  // Check cache first
  const cacheKey = address.toLowerCase().trim();
  if (geocodeCache.has(cacheKey)) {
    return geocodeCache.get(cacheKey) || null;
  }

  // Rate limiting
  const now = Date.now();
  const timeSinceLastRequest = now - lastGeocodingTime;
  if (timeSinceLastRequest < GEOCODING_DELAY) {
    await new Promise(resolve => setTimeout(resolve, GEOCODING_DELAY - timeSinceLastRequest));
  }
  lastGeocodingTime = Date.now();

  try {
    // Clean and format address for better geocoding
    const cleanAddress = address
      .replace(/\n/g, ', ')
      .replace(/\s+/g, ' ')
      .trim();
    
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(cleanAddress)}&countrycodes=my&limit=1`,
      {
        headers: {
          'User-Agent': 'KeracunanApp/1.0',
        },
      }
    );

    if (!response.ok) {
      geocodeCache.set(cacheKey, null);
      return null;
    }

    const results = await response.json();
    
    if (results && results.length > 0) {
      const coords: [number, number] = [
        parseFloat(results[0].lat),
        parseFloat(results[0].lon)
      ];
      geocodeCache.set(cacheKey, coords);
      return coords;
    }
    
    geocodeCache.set(cacheKey, null);
    return null;
  } catch (error) {
    console.error('Geocoding error:', error);
    geocodeCache.set(cacheKey, null);
    return null;
  }
}

// Fix for default marker icons in Leaflet with Next.js
const activeIcon = L.icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const expiredIcon = L.icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

export default function BessMap({ data, selectedPremise, onSelectPremise, locale }: BessMapProps) {
  const mapRef = useRef<L.Map | null>(null);
  const markerLayerRef = useRef<L.LayerGroup | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const isInitializedRef = useRef(false);
  
  const [isLoading, setIsLoading] = useState(false);
  const [loadedCount, setLoadedCount] = useState(0);
  const [totalInView, setTotalInView] = useState(0);
  const [showSearchButton, setShowSearchButton] = useState(true);

  // Initialize map only once
  useEffect(() => {
    if (!containerRef.current || isInitializedRef.current) return;
    isInitializedRef.current = true;

    mapRef.current = L.map(containerRef.current, {
      preferCanvas: true,
    }).setView([4.2105, 108.9758], 6);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(mapRef.current);

    markerLayerRef.current = L.layerGroup().addTo(mapRef.current);

    // Show search button when map moves
    mapRef.current.on('moveend', () => {
      setShowSearchButton(true);
    });

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
        markerLayerRef.current = null;
        isInitializedRef.current = false;
      }
    };
  }, []);

  // Create popup content
  const createPopupContent = useCallback((item: BessData) => {
    return `
      <div style="max-width: 280px; font-family: system-ui, sans-serif;">
        <h3 style="margin: 0 0 8px; font-size: 14px; font-weight: 600; color: #1a1a1a;">
          ${item.namaSyarikat}
        </h3>
        <div style="display: flex; align-items: center; gap: 4px; margin-bottom: 8px;">
          <span style="
            display: inline-flex;
            align-items: center;
            padding: 2px 8px;
            border-radius: 9999px;
            font-size: 11px;
            font-weight: 500;
            ${item.isActive 
              ? 'background: #dcfce7; color: #166534;' 
              : 'background: #fee2e2; color: #991b1b;'
            }
          ">
            ${item.isActive ? '✓ Aktif' : '✗ Tamat'}
          </span>
        </div>
        <p style="margin: 0 0 6px; font-size: 12px; color: #444; line-height: 1.4;">
          📍 ${item.alamatPerniagaan.replace(/\n/g, ', ')}
        </p>
        ${item.telefon ? `
          <p style="margin: 0 0 6px; font-size: 12px; color: #444;">
            📞 <a href="tel:${item.telefon}" style="color: #2563eb;">${item.telefon}</a>
          </p>
        ` : ''}
        <div style="margin-top: 8px; padding-top: 8px; border-top: 1px solid #e5e5e5; font-size: 11px; color: #666;">
          <p style="margin: 0 0 2px;">Sijil: ${item.tarikhSijil} - ${item.tarikhTamat}</p>
          <p style="margin: 0;">No: ${item.noSiri}</p>
        </div>
      </div>
    `;
  }, []);

  // Search this area - geocode and load markers
  const handleSearchArea = useCallback(async () => {
    if (!mapRef.current || !markerLayerRef.current) return;

    const bounds = mapRef.current.getBounds();
    setIsLoading(true);
    setShowSearchButton(false);
    markerLayerRef.current.clearLayers();
    setLoadedCount(0);

    // Filter data by state that might be in the visible area
    // Get the center state first for filtering
    const center = bounds.getCenter();
    
    // Find premises that could be in this area (rough filter by state based on map center)
    const statesInView = getStatesInBounds(bounds);
    const potentialPremises = data.filter(item => {
      const itemState = item.negeri.toUpperCase();
      return statesInView.some(state => itemState.includes(state));
    });
    
    // Limit to first 50 for geocoding (to avoid rate limiting issues)
    const premisesToGeocode = potentialPremises.slice(0, 50);
    setTotalInView(premisesToGeocode.length);

    let loadedMarkers = 0;
    
    for (const item of premisesToGeocode) {
      // First try business address, then permanent address
      const address = item.alamatPerniagaan || item.alamatTetap;
      const coords = await geocodeAddress(address);
      
      if (coords && bounds.contains(coords)) {
        const icon = item.isActive ? activeIcon : expiredIcon;
        const marker = L.marker(coords, { icon });
        
        marker.bindPopup(createPopupContent(item), {
          maxWidth: 300,
        });

        marker.on('click', () => {
          onSelectPremise(item);
        });

        markerLayerRef.current!.addLayer(marker);
        loadedMarkers++;
        setLoadedCount(loadedMarkers);
      }
    }

    setIsLoading(false);
  }, [data, createPopupContent, onSelectPremise]);

  // Pan to selected premise
  useEffect(() => {
    if (!mapRef.current || !selectedPremise) return;

    const address = selectedPremise.alamatPerniagaan || selectedPremise.alamatTetap;
    
    geocodeAddress(address).then((coords) => {
      if (coords && mapRef.current) {
        mapRef.current.setView(coords, 15, { animate: true });
        
        // Add marker for selected premise
        if (markerLayerRef.current) {
          const icon = selectedPremise.isActive ? activeIcon : expiredIcon;
          const marker = L.marker(coords, { icon });
          marker.bindPopup(createPopupContent(selectedPremise), { maxWidth: 300 });
          marker.addTo(markerLayerRef.current);
          marker.openPopup();
        }
      }
    });
  }, [selectedPremise, createPopupContent]);

  return (
    <div className="relative">
      <div 
        ref={containerRef} 
        className="h-[500px] w-full"
        style={{ zIndex: 0 }}
      />
      
      {/* Search this area button */}
      {showSearchButton && !isLoading && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[1000]">
          <Button 
            onClick={handleSearchArea}
            className="shadow-lg"
            size="sm"
          >
            <Search className="w-4 h-4 mr-2" />
            {locale === 'ms' ? 'Cari kawasan ini' : 'Search this area'}
          </Button>
        </div>
      )}

      {/* Loading indicator */}
      {isLoading && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[1000] bg-background/90 backdrop-blur-sm rounded-lg px-4 py-2 shadow-lg flex items-center gap-2">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span className="text-sm">
            {locale === 'ms' 
              ? `Memuatkan... ${loadedCount}/${totalInView}` 
              : `Loading... ${loadedCount}/${totalInView}`
            }
          </span>
        </div>
      )}

      {/* Instructions */}
      <div className="absolute bottom-4 left-4 z-[1000] bg-background/90 backdrop-blur-sm rounded-lg px-3 py-2 text-xs text-muted-foreground max-w-[200px]">
        {locale === 'ms' 
          ? 'Zum ke lokasi dan klik "Cari kawasan ini" untuk memuatkan premis.'
          : 'Zoom to a location and click "Search this area" to load premises.'
        }
      </div>
    </div>
  );
}

// Helper function to determine which states are visible in the map bounds
function getStatesInBounds(bounds: L.LatLngBounds): string[] {
  const stateCoords: Record<string, [number, number]> = {
    'JOHOR': [1.4854, 103.7618],
    'KEDAH': [6.1184, 100.3685],
    'KELANTAN': [6.1254, 102.2381],
    'MELAKA': [2.1896, 102.2501],
    'NEGERI SEMBILAN': [2.7258, 101.9424],
    'PAHANG': [3.8126, 103.3256],
    'PERAK': [4.5921, 101.0901],
    'PERLIS': [6.4449, 100.1986],
    'PULAU PINANG': [5.4164, 100.3327],
    'SABAH': [5.9788, 116.0753],
    'SARAWAK': [1.5533, 110.3592],
    'SELANGOR': [3.0738, 101.5183],
    'TERENGGANU': [5.3117, 103.1324],
    'KUALA LUMPUR': [3.1390, 101.6869],
    'PUTRAJAYA': [2.9264, 101.6964],
    'LABUAN': [5.2831, 115.2308],
  };

  const visibleStates: string[] = [];
  
  // Expand bounds slightly to catch nearby states
  const expandedBounds = bounds.pad(0.5);
  
  for (const [state, coords] of Object.entries(stateCoords)) {
    if (expandedBounds.contains(coords)) {
      visibleStates.push(state);
    }
  }
  
  // If no states found, return all (user might be viewing a specific area)
  if (visibleStates.length === 0) {
    return Object.keys(stateCoords);
  }
  
  return visibleStates;
}
