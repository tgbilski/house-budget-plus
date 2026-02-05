 import React, { useEffect, useRef, useState } from 'react';
 import mapboxgl from 'mapbox-gl';
 import 'mapbox-gl/dist/mapbox-gl.css';
 import { Card } from '@/components/ui/card';
 import { supabase } from '@/integrations/supabase/client';
 import type { VacationOption } from '@/hooks/useVacationPlanner';
 
 
 interface VacationMapProps {
   options: VacationOption[];
   onMarkerClick?: (optionId: string) => void;
 }
 
 export const VacationMap: React.FC<VacationMapProps> = ({ options, onMarkerClick }) => {
   const mapContainer = useRef<HTMLDivElement>(null);
   const map = useRef<mapboxgl.Map | null>(null);
   const markersRef = useRef<mapboxgl.Marker[]>([]);
   const [mapLoaded, setMapLoaded] = useState(false);
   const [mapError, setMapError] = useState<string | null>(null);
 
   // Initialize map
   useEffect(() => {
     if (!mapContainer.current || map.current) return;
 
     const initMap = async () => {
       try {
         // Fetch token from edge function
         const { data, error } = await supabase.functions.invoke('geocode-places', {
           body: { getToken: true }
         });
         
         if (error || !data?.token) {
           setMapError('Map configuration unavailable');
           return;
         }
         
         mapboxgl.accessToken = data.token;
         
         map.current = new mapboxgl.Map({
           container: mapContainer.current!,
           style: 'mapbox://styles/mapbox/streets-v12', // Vector streets style
           center: [0, 20],
           zoom: 1.5,
           projection: 'mercator'
         });
 
         map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');
 
         map.current.on('load', () => {
           setMapLoaded(true);
         });
         
         map.current.on('error', (e) => {
           console.error('Map error:', e);
           setMapError('Failed to load map');
         });
       } catch (err) {
         console.error('Map init error:', err);
         setMapError('Failed to initialize map');
       }
     };
     
     initMap();
 
     return () => {
       map.current?.remove();
       map.current = null;
     };
   }, []);
 
   // Update markers when options change
   useEffect(() => {
     if (!map.current || !mapLoaded) return;
 
     // Clear existing markers
     markersRef.current.forEach(marker => marker.remove());
     markersRef.current = [];
 
     // Filter options with valid coordinates
     const optionsWithCoords = options.filter(
       opt => opt.destination_lat && opt.destination_lng && opt.destination
     );
 
     if (optionsWithCoords.length === 0) return;
 
     // Add markers for each option
    optionsWithCoords.forEach((option) => {
       const optionIndex = options.findIndex(o => o.id === option.id) + 1;
       
       // Create custom marker element
       const el = document.createElement('div');
       el.className = 'vacation-marker';
       el.innerHTML = `
         <div style="
           width: 32px;
           height: 32px;
           background: linear-gradient(135deg, hsl(175 65% 45%), hsl(280 55% 50%));
           border: 3px solid white;
           border-radius: 50%;
           display: flex;
           align-items: center;
           justify-content: center;
           color: white;
           font-weight: bold;
           font-size: 14px;
           box-shadow: 0 2px 8px rgba(0,0,0,0.3);
           cursor: pointer;
           transition: transform 0.2s;
         ">${optionIndex}</div>
       `;
       
       el.addEventListener('mouseenter', () => {
         el.firstElementChild?.setAttribute('style', 
           el.firstElementChild.getAttribute('style') + 'transform: scale(1.2);'
         );
       });
       el.addEventListener('mouseleave', () => {
         el.firstElementChild?.setAttribute('style', 
           el.firstElementChild.getAttribute('style')?.replace('transform: scale(1.2);', '') || ''
         );
       });
       
       if (onMarkerClick) {
         el.addEventListener('click', () => onMarkerClick(option.id));
       }
 
       const marker = new mapboxgl.Marker({ element: el })
         .setLngLat([option.destination_lng!, option.destination_lat!])
         .setPopup(
           new mapboxgl.Popup({ offset: 25, closeButton: false })
             .setHTML(`
               <div style="font-weight: 600; font-size: 14px;">${option.destination}</div>
             `)
         )
         .addTo(map.current!);
 
       markersRef.current.push(marker);
     });
 
     // Fit map to show all markers
     if (optionsWithCoords.length > 0) {
       const bounds = new mapboxgl.LngLatBounds();
       optionsWithCoords.forEach(opt => {
         bounds.extend([opt.destination_lng!, opt.destination_lat!]);
       });
       
       map.current.fitBounds(bounds, {
         padding: 80,
         maxZoom: 8,
         duration: 1000
       });
     }
   }, [options, mapLoaded, onMarkerClick]);
 
   return (
     <Card className="overflow-hidden">
       <div className="relative">
         {/* Fun header */}
         <div className="absolute top-3 left-3 z-10 bg-card/90 backdrop-blur-sm rounded-lg px-3 py-1.5 border border-border shadow-sm">
           <span className="text-sm font-semibold flex items-center gap-1.5">
             🗺️ Your Adventure Map
           </span>
         </div>
         
         <div 
           ref={mapContainer} 
           className="w-full h-[280px] sm:h-[320px]"
           style={{ minHeight: '280px' }}
         />
         
         {/* Empty state overlay */}
           {!mapError && options.every(opt => !opt.destination_lat) && (
           <div className="absolute inset-0 flex items-center justify-center bg-card/50 backdrop-blur-[2px]">
             <div className="text-center p-4">
               <p className="text-muted-foreground text-sm">
                 Search for destinations below to see them on the map! 📍
               </p>
             </div>
           </div>
         )}
           
           {/* Error state */}
           {mapError && (
             <div className="absolute inset-0 flex items-center justify-center bg-muted">
               <div className="text-center p-4">
                 <p className="text-muted-foreground text-sm">
                   🗺️ {mapError}
                 </p>
               </div>
             </div>
           )}
       </div>
     </Card>
   );
 };