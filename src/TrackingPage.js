import React, { useEffect, useState } from 'react';
import Sidebar from './component/Sidebar';
import MapSection from './component/MapSection';
import axios from 'axios';
import L from 'leaflet';
import vehicleIconImg from './car.png';
import 'leaflet/dist/leaflet.css';

const vehicleIcon = new L.Icon({
  iconUrl: vehicleIconImg,
  iconSize: [40, 40],
  iconAnchor: [20, 40],
});

const TrackingPage = ({ token }) => {
  const [drivers, setDrivers] = useState([]);
  const [latestCoords, setLatestCoords] = useState(null);
  const [pathCoords, setPathCoords] = useState([]);
  const [locationName, setLocationName] = useState('');
  const [latestLocation, setLatestLocation] = useState(null);

  const [formData, setFormData] = useState({
    driverName: '',
    vehicleNo: '',
    vehicleType: 'Car',
    password: '',
  });

  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);

  const fetchDrivers = async () => {
    try {
      const res = await axios.get(
        'https://final-backend-trackeazy.vercel.app/api/auth/getDrivers',
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setDrivers(res.data);
    } catch (err) {
      console.error('Error fetching drivers:', err.response?.data || err.message);
    }
  };

  const handleRegister = async () => {
    try {
      await axios.post(
        'https://final-backend-trackeazy.vercel.app/api/auth/register',
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setFormData({ driverName: '', vehicleNo: '', vehicleType: 'Car', password: '' });
      setShowForm(false);
      fetchDrivers();
    } catch (err) {
      console.error('Error registering driver:', err.response?.data || err.message);
    }
  };

const fetchAndSetLocation = async (vehicleNo, isHistory) => {
  console.log(vehicleNo, "vehicle No");
  try {
    setLoading(true);
    const endpoint = `https://final-backend-trackeazy.vercel.app/api/auth/getVehicleLocations/${vehicleNo}`;
    const res = await axios.get(endpoint);
    const locations = res.data;

    const path = locations.locations
      .map(loc => loc.latlong?.lat && loc.latlong?.long
        ? [parseFloat(loc.latlong.lat), parseFloat(loc.latlong.long)]
        : null)
      .filter(Boolean);

    if (path.length === 0) {
      setPathCoords([]);
      setLatestCoords(null);
      setLoading(false);
      return;
    }

    if (isHistory) {
      setPathCoords(path);
      setLatestCoords(path[path.length - 1]);
    } else {
      setPathCoords([]);
      setLatestCoords(path[path.length - 1]);
    }

    setLocationName(vehicleNo);
    setLatestLocation(locations[locations.length - 1] || locations);
    setLoading(false);
  } catch (err) {
    console.error(err);
    setLoading(false);
  }
};


  useEffect(() => {
    fetchDrivers();
  }, []);

  return (
    <div style={{ display: 'flex', height: '100vh' }}>
      <Sidebar
        showForm={showForm}
        setShowForm={setShowForm}
        formData={formData}
        setFormData={setFormData}
        handleRegister={handleRegister}
        drivers={drivers}
        fetchAndSetLocation={fetchAndSetLocation}
        loading={loading}
        fetchDrivers={fetchDrivers}
      />
      <div style={{ flex: 1 }}>
        <MapSection
          latestCoords={latestCoords}
          pathCoords={pathCoords}
          vehicleIcon={vehicleIcon}
          locationName={locationName}
          latestLocation={latestLocation}
        />
      </div>
    </div>
  );
};

export default TrackingPage;
