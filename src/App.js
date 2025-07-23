import React, { useState } from 'react';
import LoginScreen from './component/LoginScreen';
import TrackingPage from './TrackingPage';

const App = () => {
  const [admin, setAdmin] = useState(null);

  const handleLoginSuccess = (adminData) => {
    setAdmin(adminData); // adminData includes token
  };

  return admin ? (
    <TrackingPage token={admin.token} />
  ) : (
    <LoginScreen onLoginSuccess={handleLoginSuccess} />
  );
};

export default App;