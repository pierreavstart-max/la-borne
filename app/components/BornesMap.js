'use client';
import { useEffect, useRef } from 'react';

export default function BornesMap({ bornes }) {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (mapInstanceRef.current) return;
    if (!mapRef.current) return;
    if (!bornes || bornes.length === 0) return;

    import('leaflet').then(L => {
      L = L.default || L;

// Assure que la carte reste derrière les modals
mapRef.current.style.zIndex = '0';

      // Fix icônes
      delete L.Icon.Default.prototype._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      });

      const iconOnline = L.icon({
        iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
        iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34],
      });

      const iconOffline = L.icon({
        iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
        iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34],
      });

      // Charge le CSS
      if (!document.querySelector('link[href*="leaflet"]')) {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
        document.head.appendChild(link);
      }

      const center = [bornes[0].lat, bornes[0].lon];
      if (mapRef.current._leaflet_id) return;
const map = L.map(mapRef.current).setView(center, 6);
      mapInstanceRef.current = map;

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap',
      }).addTo(map);

      bornes.forEach(b => {
        L.marker([b.lat, b.lon], { icon: b.isOnline ? iconOnline : iconOffline })
          .addTo(map)
          .bindPopup(`
            <div style="font-size:12px">
              <div style="font-weight:600;margin-bottom:4px">${b.nom}</div>
              <div style="color:#6B6860">${b.client || ''}</div>
              <div style="margin-top:4px;color:${b.isOnline ? '#18865A' : '#C02B2B'};font-weight:500">
                ${b.isOnline ? '● En ligne' : '● Hors ligne'}
              </div>
            </div>
          `);
      });
    });

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [bornes]);

  if (!bornes || bornes.length === 0) {
    return (
      <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#A8A69F', fontSize: '12px' }}>
        Aucune borne avec position GPS
      </div>
    );
  }

  return <div ref={mapRef} style={{ height: '100%', width: '100%' }} />;
}