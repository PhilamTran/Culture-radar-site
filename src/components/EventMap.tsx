"use client";

import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

type EventMapProps = {
  latitude: number;
  longitude: number;
  title: string;
  address?: string | null;
};

const markerIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

export default function EventMap({
  latitude,
  longitude,
  title,
  address,
}: EventMapProps) {
  return (
    <div className="overflow-hidden rounded-3xl border border-gray-200 shadow-sm">
      <MapContainer
        center={[latitude, longitude]}
        zoom={15}
        scrollWheelZoom={false}
        className="h-[360px] w-full"
      >
        <TileLayer
          attribution='&copy; OpenStreetMap contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <Marker position={[latitude, longitude]} icon={markerIcon}>
          <Popup>
            <div className="text-sm">
              <p className="font-semibold">{title}</p>
              {address ? <p>{address}</p> : null}
            </div>
          </Popup>
        </Marker>
      </MapContainer>
    </div>
  );
}