import React, { useEffect, useState } from 'react';
import LoginScreen from './component/LoginScreen';
import TrackingPage from './TrackingPage';

const App = () => {
  const [admin, setAdmin] = useState(null);

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      setAdmin({ token: storedToken });
    }
  }, []);

  const handleLoginSuccess = (adminData) => {
    localStorage.setItem('token', adminData.token); // Store token
    setAdmin(adminData);
  };

  return admin ? (
    <TrackingPage token={admin.token} />
  ) : (
    <LoginScreen onLoginSuccess={handleLoginSuccess} />
  );
};

export default App;
