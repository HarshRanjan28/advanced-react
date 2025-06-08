import "leaflet/dist/leaflet.css";
import Leaflet from "leaflet";
import { LocationData } from "@advanced-react/shared/schema/experience";
import { MapPin } from "lucide-react";
import { MapContainer, TileLayer, useMap, Marker } from "react-leaflet";
import { useEffect } from "react";

// displaying the cursor

const markIcon = Leaflet.icon({
  iconUrl: "/map-marker.webp",
  iconSize: [41, 41],
  iconAnchor: [22, 41],
});

type LocationDisplayProps = {
  location: Omit<LocationData, "displayName"> & { displayName?: string };
  zoom?: number;
};

export function LocationDisplay({
  location,
  zoom = 10,
}: LocationDisplayProps) {
  return (
    <div className="space-y-4">
      {location.displayName && (
        <div className="flex flex-row items-center gap-2">
          <MapPin className="text-primary-50- h-6 w-6" />
          <span className="flex-1 text-neutral-600 dark:text-neutral-400">
            {location.displayName}
          </span>
        </div>
      )}

      <div className="h-[300px] w-full overflow-hidden rounded-md">
        <MapContainer
          center={[location.lat, location.lon]}
          zoom={zoom}
          className="h-full w-full"
          scrollWheelZoom={true}
        >
          <TileLayer url="https://{s}.openstreetmap.org/blabla/{z}/{x}/{y}{r}.png" />
          <Marker icon={markIcon} position={[location.lat, location.lon]} />
          <MapUpdater location={location} zoom={zoom} />
        </MapContainer>
      </div>
    </div>
  );
}

type MapUpdaterProps = LocationDisplayProps;

function MapUpdater({ location, zoom }: MapUpdaterProps) {
  const map = useMap();
  useEffect(() => {
    map.setView([location.lat, location.lon], zoom);
  }, [location, zoom, map]);

  return null;
}
