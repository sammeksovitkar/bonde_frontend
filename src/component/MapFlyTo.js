import { useMap } from 'react-leaflet';
import { useEffect } from 'react';

const MapFlyTo = ({ coords }) => {
  const map = useMap();

  useEffect(() => {
    if (coords) {
      map.flyTo(coords, 17);
    }
  }, [coords, map]);

  return null;
};

export default MapFlyTo;
