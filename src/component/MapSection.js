import React from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import MapFlyTo from './MapFlyTo';
import 'leaflet/dist/leaflet.css';

const defaultCenter = [22.9734, 78.6569];

const MapSection = ({ latestCoords, pathCoords, vehicleIcon, locationName, latestLocation }) => {
  return (
    <MapContainer center={latestCoords || defaultCenter} zoom={6} style={{ height: '100%' }}>
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      <MapFlyTo coords={latestCoords} />
      {latestCoords && (
        <Marker position={latestCoords} icon={vehicleIcon}>
          <Popup>
            <strong>{locationName || 'Location'}</strong>
            <br />
            {new Date(latestLocation?.time).toLocaleString()}
          </Popup>
        </Marker>
      )}
      {pathCoords.length > 0 && (
        <Polyline positions={pathCoords} color="blue" opacity={0.7} />
      )}
    </MapContainer>
  );
};

export default MapSection;
