import React from 'react';

interface MapViewProps {
  mapQuery: string;
}

export const MapView: React.FC<MapViewProps> = ({ mapQuery }) => {
  const mapUrl = `https://maps.google.com/maps?q=${encodeURIComponent(mapQuery)}&t=&z=15&ie=UTF8&iwloc=&output=embed`;

  return (
    <div className="mb-6 rounded-lg overflow-hidden shadow-xl border-2 border-slate-700">
      <iframe
        key={mapQuery}
        width="100%"
        height="350"
        style={{ border: 0 }}
        loading="lazy"
        allowFullScreen
        referrerPolicy="no-referrer-when-downgrade"
        src={mapUrl}
      >
      </iframe>
    </div>
  );
};
