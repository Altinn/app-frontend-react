import Marker from 'leaflet/dist/images/marker-icon.png';
import RetinaMarker from 'leaflet/dist/images/marker-icon-2x.png';
import MarkerShadow from 'leaflet/dist/images/marker-shadow.png';
import type { IconOptions } from 'leaflet';

export const markerIcon: IconOptions = {
  iconUrl: Marker,
  iconRetinaUrl: RetinaMarker,
  shadowUrl: MarkerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
};
