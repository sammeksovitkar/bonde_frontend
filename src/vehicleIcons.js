import L from 'leaflet';

export const vehicleMarkers = {
  car: new L.Icon({ iconUrl: '/assets/car.png', iconSize: [40, 40], iconAnchor: [20, 40] }),
  truck: new L.Icon({ iconUrl: '/assets/truck.png', iconSize: [40, 40], iconAnchor: [20, 40] }),
  bike: new L.Icon({ iconUrl: '/assets/bike.png', iconSize: [40, 40], iconAnchor: [20, 40] }),
  scooter: new L.Icon({ iconUrl: '/assets/scooter.png', iconSize: [40, 40], iconAnchor: [20, 40] }),
};
