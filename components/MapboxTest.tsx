'use client';

import { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

export default function MapboxTest() {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);

  useEffect(() => {
    if (map.current) return;

    console.log('MapboxTest: Initializing test map...');
    console.log('MapboxTest: Token available:', !!mapboxgl.accessToken);
    console.log('MapboxTest: Container element:', mapContainer.current);

    mapboxgl.accessToken = 'pk.eyJ1IjoicmVuZGFuaS1kZXYiLCJhIjoiY21kM2c3OXQ4MDJ6MjJqczlqbzNwcDZvaCJ9.6skTnPcXqD7h24o9mfuQnw';

    try {
      map.current = new mapboxgl.Map({
        container: mapContainer.current!,
        style: 'mapbox://styles/mapbox/streets-v11',
        center: [28.0473, -26.2041], // Johannesburg
        zoom: 12
      });

      map.current.on('load', () => {
        console.log('MapboxTest: Map loaded successfully!');
      });

      map.current.on('error', (e) => {
        console.error('MapboxTest: Map error:', e);
      });

    } catch (error) {
      console.error('MapboxTest: Error creating map:', error);
    }
  }, []);

  return (
    <div className="p-4">
      <h2 className="mb-4 font-bold text-xl">Mapbox Test</h2>
      <div 
        ref={mapContainer} 
        style={{ width: '100%', height: '400px', border: '1px solid #ccc', borderRadius: '8px' }}
      />
    </div>
  );
}
