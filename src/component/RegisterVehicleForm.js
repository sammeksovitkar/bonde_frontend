import React from 'react';

const inputStyle = {
  width: '100%',
  padding: '6px',
  marginBottom: '10px',
};

const RegisterVehicleForm = ({ formData, setFormData, onSubmit, onClose }) => (
  <div style={{
    background: '#fff', padding: '1rem', borderRadius: '8px',
    boxShadow: '0 0 10px rgba(0,0,0,0.3)', marginBottom: '1rem'
  }}>
    <h3>Register Vehicle</h3>
    <input placeholder="Driver Name" value={formData.driverName} onChange={(e) => setFormData({ ...formData, driverName: e.target.value })} style={inputStyle} />
    <input placeholder="Vehicle No" value={formData.vehicleNo} onChange={(e) => setFormData({ ...formData, vehicleNo: e.target.value })} style={inputStyle} />
    <select value={formData.vehicleType} onChange={(e) => setFormData({ ...formData, vehicleType: e.target.value })} style={inputStyle}>
      <option value="Car">Car</option>
      <option value="Truck">Truck</option>
      <option value="Bike">Bike</option>
      <option value="Scooter">Scooter</option>
    </select>
    <input type="password" placeholder="Password" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} style={inputStyle} />
    <button onClick={onSubmit} style={{ ...inputStyle, background: '#007BFF', color: '#fff', cursor: 'pointer' }}>✅ Register</button>
    <button onClick={onClose} style={{ ...inputStyle, background: 'gray', color: '#fff', cursor: 'pointer' }}>🔙 Back</button>
  </div>
);

export default RegisterVehicleForm;
