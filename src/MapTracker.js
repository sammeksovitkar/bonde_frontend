import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { MapContainer, TileLayer, Marker, Polyline, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix Leaflet marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

const MapTracker = () => {
  const [positions, setPositions] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchLocations = async () => {
    try {
      const res = await axios.get('https://trackeazy-backend-kse1.vercel.app/get-sheet-data');
      const data = res.data;

      const cleaned = data
        .map((item) => {
          const lat = parseFloat(item?.latlong?.lat);
          const lng = parseFloat(item?.latlong?.long);
          return !isNaN(lat) && !isNaN(lng) ? [lat, lng] : null;
        })
        .filter(Boolean);

      if (cleaned.length > 0) {
        setPositions(cleaned);
      } else {
        setPositions([]);
      }
    } catch (error) {
      console.error('❌ Failed to fetch locations:', error.message);
    }
  };

  const clearData = async () => {
    try {
      setLoading(true);
      await axios.get('https://trackeazy-backend-gk2v.vercel.app/clear-data');
      setPositions([]);
      alert("✅ Location data cleared!");
    } catch (error) {
      console.error('❌ Failed to clear data:', error.message);
      alert("❌ Failed to clear data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLocations();
    const interval = setInterval(fetchLocations, 30000);
    return () => clearInterval(interval);
  }, []);

  const first = positions[0];
  const latest = positions[positions.length - 1];

  return (
    <div style={{ height: '100vh', position: 'relative' }}>
      <button
        onClick={clearData}
        disabled={loading}
        style={{
          position: 'absolute',
          top: 10,
          left: 10,
          zIndex: 1000,
          padding: '10px 16px',
          backgroundColor: '#f44336',
          color: 'white',
          border: 'none',
          borderRadius: 6,
          cursor: 'pointer',
        }}
      >
        {loading ? 'Clearing...' : 'Clear Data'}
      </button>

      {positions.length === 0 ? (
        <p style={{ textAlign: 'center', marginTop: 60 }}>📍 Loading map or no data...</p>
      ) : (
        <MapContainer center={first} zoom={18} scrollWheelZoom={true} style={{ height: '100%' }}>
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution="&copy; OpenStreetMap contributors"
          />

          {/* Start Marker */}
          <Marker position={first}>
            <Popup>
              🟢 Start Point<br />
              Lat: {first[0]} <br />Lng: {first[1]}
            </Popup>
          </Marker>

          {/* End Marker */}
          <Marker position={latest}>
            <Popup>
              🔴 End Point<br />
              Lat: {latest[0]} <br />Lng: {latest[1]}
            </Popup>
          </Marker>

          {/* Route */}
          <Polyline positions={positions} color="blue" />
        </MapContainer>
      )}
    </div>
  );
};

export default MapTracker;
