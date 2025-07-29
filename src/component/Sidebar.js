import React from 'react';
import DriverRow from './DriverRow';
import RegisterVehicleForm from './RegisterVehicleForm';

const Sidebar = ({ showForm, setShowForm, formData, setFormData, handleRegister, drivers, fetchAndSetLocation, loading }) => {
  return (
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
        <button onClick={() => setShowForm(true)} style={{ background: 'green', color: '#fff', padding: '8px' }}>➕ Add Vehicle</button>
        <button onClick={() => window.location.reload()} style={{ marginLeft: '10px', background: 'red', color: '#fff', padding: '8px' }}>🚪 Logout</button>
      </div>

      {showForm ? (
        <RegisterVehicleForm
          formData={formData}
          setFormData={setFormData}
          onSubmit={handleRegister}
          onClose={() => setShowForm(false)}
        />
      ) : (
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
                <DriverRow key={driver.vehicleNo} driver={driver} onSelectLocation={fetchAndSetLocation} />
              ))}
            </tbody>
          </table>
          {loading && <p>Loading...</p>}
        </>
      )}
    </div>
  );
};

export default Sidebar;
