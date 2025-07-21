// MapTracker.js
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { MapContainer, TileLayer, Marker, Polyline, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix default icon issue in Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

const MapTracker = () => {
  const [positions, setPositions] = useState([]);

  const fetchLocations = async () => {
    try {
      const res = await axios.get('https://trackeazy-backend-ius7.vercel.app/get-sheet-data');
      const data = res.data;

      // Convert lat/long strings to numbers
      const cleaned = data
        .map((item) => {
          const lat = parseFloat(item.latlong.lat);
          const lng = parseFloat(item.latlong.long);
          return isNaN(lat) || isNaN(lng) ? null : [lat, lng];
        })
        .filter((point) => point !== null);

      setPositions(cleaned);
    } catch (error) {
      console.error('❌ Failed to fetch locations:', error.message);
    }
  };

  // Run once on mount and then every 30 seconds
  useEffect(() => {
    fetchLocations(); // initial load

    const interval = setInterval(fetchLocations, 30000); // every 30 sec

    return () => clearInterval(interval); // cleanup
  }, []);

  if (positions.length === 0) return <p>Loading map...</p>;

  const latest = positions[positions.length - 1];

  return (
    <div style={{ height: '100vh' }}>
      <MapContainer center={latest} zoom={18} scrollWheelZoom={true} style={{ height: '100%' }}>
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="&copy; OpenStreetMap contributors"
        />

        {/* Start point marker */}
        <Marker
          position={positions[0]}
          icon={L.divIcon({
            className: 'custom-div-icon',
            html: `<div class="marker-label">End</div><img src="https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png"/>`,
            iconSize: [25, 41],
            iconAnchor: [12, 41],
          })}
        >
          <Popup>
            🔴 End Point<br />
            Lat: {positions[0][0]} <br />Lng: {positions[0][1]}
          </Popup>
        </Marker>

        {/* End point marker */}
        <Marker
          position={latest}
          icon={L.divIcon({
            className: 'custom-div-icon',
            html: `<div class="marker-label">Start</div><img src="https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png"/>`,
            iconSize: [25, 41],
            iconAnchor: [12, 41],
          })}
        >
          <Popup>
              🟢Start Point<br />
            Lat: {latest[0]} <br />Lng: {latest[1]}
          </Popup>
        </Marker>

        {/* Full tracking path */}
        <Polyline positions={positions} color="blue" />
      </MapContainer>
    </div>
  );
};

export default MapTracker;
