import React, { useEffect, useState, useCallback, useMemo } from 'react';
import axios from 'axios';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import MapFlyTo from './MapFlyTo';

// Vehicle marker icons
const vehicleMarkers = {
  car: createVehicleIcon('🚗'),
  truck: createVehicleIcon('🚚'),
  bike: createVehicleIcon('🏍️'),
  scooter: createVehicleIcon('🛵'),
};

function createVehicleIcon(emoji) {
  return L.divIcon({
    html: `<div style="font-size: 34px; user-select: none;">${emoji}</div>`,
    className: '',
    iconSize: [34, 34],
    iconAnchor: [17, 17],
  });
}

const defaultCenter = [22.9734, 78.6569];

const iconButtonStyle = {
  background: '#007BFF',
  color: 'white',
  border: 'none',
  borderRadius: '6px',
  padding: '6px 10px',
  fontSize: '16px',
  cursor: 'pointer',
  transition: '0.3s',
};

const DriverRow = React.memo(({ driver, onSelectLocation }) => {
  const type = driver.vehicleType?.toLowerCase();
  const emoji = { car: '🚗', truck: '🚚', bike: '🏍️', scooter: '🛵' }[type] || '🚗';

  return (
    <tr style={{ background: '#ffffffcc' }}>
      <td style={{ padding: '8px', textAlign: 'left' }}>{driver.vehicleNo}</td>
      <td style={{ padding: '8px', textAlign: 'left' }}>{driver.driverName}</td>
      <td style={{ padding: '8px', fontSize: '24px', textAlign: 'center' }}>{emoji}</td>
      <td style={{ textAlign: 'center' }}>
        <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
          <button title="Current Location" onClick={() => onSelectLocation(driver.vehicleNo, false)} style={iconButtonStyle}>📍</button>
          <button title="Location History" onClick={() => onSelectLocation(driver.vehicleNo, true)} style={iconButtonStyle}>🕒</button>
        </div>
      </td>
    </tr>
  );
});

// 🚀 Main Component
const TrackingPage = ({ token }) => {
  const [drivers, setDrivers] = useState([]);
  const [pathCoords, setPathCoords] = useState([]);
  const [latestLocation, setLatestLocation] = useState(null);
  const [locationName, setLocationName] = useState('');
  const [vehicleType, setVehicleType] = useState('car');
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    driverName: '',
    vehicleNo: '',
    vehicleType: 'Car',
    password: '',
  });

  const fetchDrivers = useCallback(() => {
    axios.get('https://final-backend-trackeazy.vercel.app/api/auth/getDrivers', {
      headers: { Authorization: `Bearer ${token}` },
    })
    .then((res) => setDrivers(res.data))
    .catch((err) => console.error('Error fetching drivers:', err));
  }, [token]);

  useEffect(() => {
    fetchDrivers();
  }, [fetchDrivers]);

  const fetchLocationName = useCallback(async (lat, lng) => {
    try {
      const res = await axios.get(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`);
      setLocationName(res.data.display_name || '');
    } catch {
      setLocationName('');
    }
  }, []);

  const fetchAndSetLocation = useCallback(
    async (vehicleNo, isHistory = false) => {
      setLoading(true);
      try {
        const res = await axios.get(
          `https://final-backend-trackeazy.vercel.app/api/auth/getVehicleLocations/${vehicleNo}`
        );

        const { locations } = res.data;
        const driver = drivers.find((d) => d.vehicleNo === vehicleNo);
        const type = driver?.vehicleType?.toLowerCase() || 'car';
        setVehicleType(type);

        if (!locations?.length) {
          alert('No location data found.');
          setLatestLocation(null);
          setPathCoords([]);
          setLoading(false);
          return;
        }

        const last = locations[locations.length - 1];
        const lat = parseFloat(last.latlong?.lat);
        const lng = parseFloat(last.latlong?.long);
        const offset = isHistory ? calculateOffset(locations) : { lat, lng };

        setLatestLocation({ ...last, latlong: { lat: offset.lat, long: offset.lng } });
        fetchLocationName(offset.lat, offset.lng);

        setPathCoords(
          isHistory
            ? locations.map((loc) => {
                const lt = parseFloat(loc.latlong?.lat);
                const ln = parseFloat(loc.latlong?.long);
                return !isNaN(lt) && !isNaN(ln) ? [lt, ln] : null;
              }).filter(Boolean)
            : []
        );
      } catch {
        alert('Failed to load data.');
      }
      setLoading(false);
    },
    [drivers, fetchLocationName]
  );

  const calculateOffset = (locations) => {
    const last = locations[locations.length - 1];
    const secondLast = locations[locations.length - 2] || last;
    const lat1 = parseFloat(secondLast.latlong?.lat);
    const lng1 = parseFloat(secondLast.latlong?.long);
    const lat2 = parseFloat(last.latlong?.lat);
    const lng2 = parseFloat(last.latlong?.long);
    const offsetFactor = 0.001;
    const dx = lat2 - lat1;
    const dy = lng2 - lng1;
    return {
      lat: lat2 + dx * offsetFactor,
      lng: lng2 + dy * offsetFactor,
    };
  };

  const latestCoords = useMemo(() => {
    if (latestLocation?.latlong?.lat && latestLocation?.latlong?.long) {
      return [
        parseFloat(latestLocation.latlong.lat),
        parseFloat(latestLocation.latlong.long),
      ];
    }
    return null;
  }, [latestLocation]);

  const vehicleIcon = useMemo(() => {
    return vehicleMarkers[vehicleType] || new L.Icon.Default();
  }, [vehicleType]);

  const handleRegister = async () => {
    try {
      await axios.post('https://final-backend-trackeazy.vercel.app/api/auth/register', formData);
      alert('Vehicle registered successfully!');
      setFormData({ driverName: '', vehicleNo: '', vehicleType: 'Car', password: '' });
      setShowForm(false);
      fetchDrivers();
    } catch (err) {
      console.error(err);
      alert('Failed to register vehicle.');
    }
  };

  return (
    <div style={{ display: 'flex', height: '100vh' }}>
      {/* Sidebar */}
      <div
        style={{
          width: '35%',
          backgroundImage: 'url("/assets/bg-tracking.jpg")',
          backgroundSize: 'cover',
          padding: '1rem',
          overflowY: 'auto',
          color: '#000',
        }}
      >
        <h2>🚘 Vehicle Tracking</h2>

        <div style={{ marginBottom: '1rem' }}>
          <button onClick={() => setShowForm(true)} style={{ ...iconButtonStyle, background: 'green' }}>➕ Add Vehicle</button>
          <button onClick={() => window.location.reload()} style={{ ...iconButtonStyle, marginLeft: '10px', background: 'red' }}>🚪 Logout</button>
        </div>

        {/* Vehicle Register Modal */}
        {showForm && (
          <div style={{
            background: '#fff', padding: '1rem', borderRadius: '8px',
            boxShadow: '0 0 10px rgba(0,0,0,0.3)', marginBottom: '1rem'
          }}>
            <h3>Register Vehicle</h3>
            <input
              placeholder="Driver Name"
              value={formData.driverName}
              onChange={(e) => setFormData({ ...formData, driverName: e.target.value })}
              style={{ width: '100%', padding: '6px', marginBottom: '10px' }}
            />
            <input
              placeholder="Vehicle No"
              value={formData.vehicleNo}
              onChange={(e) => setFormData({ ...formData, vehicleNo: e.target.value })}
              style={{ width: '100%', padding: '6px', marginBottom: '10px' }}
            />
            <select
              value={formData.vehicleType}
              onChange={(e) => setFormData({ ...formData, vehicleType: e.target.value })}
              style={{ width: '100%', padding: '6px', marginBottom: '10px' }}
            >
              <option value="Car">Car</option>
              <option value="Truck">Truck</option>
              <option value="Bike">Bike</option>
              <option value="Scooter">Scooter</option>
            </select>
            <input
              placeholder="Password"
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              style={{ width: '100%', padding: '6px', marginBottom: '10px' }}
            />
            <button style={{ ...iconButtonStyle, marginBottom: '10px' }} onClick={handleRegister}>✅ Register</button>
            <button style={{ ...iconButtonStyle, background: 'gray' }} onClick={() => setShowForm(false)}>🔙 Back</button>
          </div>
        )}

        {/* Driver Table */}
        {!showForm && (
          <>
            <table style={{ width: '100%', borderCollapse: 'collapse', backgroundColor: '#ffffffcc' }}>
              <thead>
                <tr style={{ background: '#ddd' }}>
                  <th style={{ textAlign: 'left', padding: '8px' }}>Vehicle</th>
                  <th style={{ textAlign: 'left', padding: '8px' }}>Driver</th>
                  <th style={{ textAlign: 'center', padding: '8px' }}>Type</th>
                  <th style={{ textAlign: 'center', padding: '8px' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {drivers.map((driver) => (
                  <DriverRow
                    key={driver.vehicleNo}
                    driver={driver}
                    onSelectLocation={fetchAndSetLocation}
                  />
                ))}
              </tbody>
            </table>
            {loading && <p>Loading...</p>}
          </>
        )}
      </div>

      {/* Map Section */}
      <div style={{ flex: 1 }}>
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
      </div>
    </div>
  );
};

export default TrackingPage;
