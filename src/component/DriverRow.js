import React from 'react';

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

const DriverRow = ({ driver, onSelectLocation }) => {
  const emoji = {
    car: '🚗',
    truck: '🚚',
    bike: '🏍️',
    scooter: '🛵'
  }[driver.vehicleType?.toLowerCase()] || '🚗';

  return (
    <tr style={{ background: '#ffffffcc' }}>
      <td style={{ padding: '8px' }}>{driver.vehicleNo}</td>
      <td style={{ padding: '8px' }}>{driver.driverName}</td>
      <td style={{ fontSize: '24px', textAlign: 'center' }}>{emoji}</td>
      <td style={{ textAlign: 'center' }}>
        <button onClick={() => onSelectLocation(driver.vehicleNo, false)} style={iconButtonStyle}>📍</button>
        <button onClick={() => onSelectLocation(driver.vehicleNo, true)} style={{ ...iconButtonStyle, marginLeft: '8px' }}>🕒</button>
      </td>
    </tr>
  );
};

export default React.memo(DriverRow);
