import { LocationData } from "@advanced-react/shared/schema/experience";
import { LatLngTuple } from "leaflet";
import { useEffect, useState } from "react";
import { RawInput } from "./ui/Input";
import { useDebounce } from "@/features/experiences/hooks/useDebounce";
import { Button } from "./ui/Button";
import { ScrollArea, ScrollBar } from "./ui/ScrollArea";
import { LocationDisplay } from "./LocationDisplay";

const DEFAULT_LOCATION = {
  lat: 51.505,
  lon: -0.09,
};

type Venue = {
  display_name: string;
  lat: string;
  lon: string;
};

type LocationPickerProps = {
  value?: LocationData;
  onChange: (location: LocationData | null) => void;
};

export function LocationPicker({ value, onChange }: LocationPickerProps) {
  const [venues, setVenues] = useState<Venue[]>([]);
  const [zoom, setZoom] = useState(value ? 18 : 13);
  const [center, setCenter] = useState<LatLngTuple>(
    value
      ? [value.lat, value.lon]
      : [DEFAULT_LOCATION.lat, DEFAULT_LOCATION.lon],
  );

  // searching and getting the location venues
  async function handleSearch(query: string) {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${query}&format=json`,
    );
    const responseData = await response.json();

    setVenues(responseData);
  }

  // when user selects a venue
  function handleVenueSelect(venue: Venue) {
    const lat = parseFloat(venue.lat);
    const lon = parseFloat(venue.lon);
    setCenter([lat, lon]);
    setZoom(18);
    onChange({ displayName: venue.display_name, lat, lon });
  }

  // when user clears the venue
  function handleVenueClear() {
    setCenter([DEFAULT_LOCATION.lat, DEFAULT_LOCATION.lon]);
    setZoom(13);
    onChange(null);
  }

  return (
    <div className="flex flex-col gap-4">
      <div>
        {!value && (
          <>
            <LocationSearch onSearch={handleSearch} />
            {venues.length > 0 && (
              <VenueList venues={venues} onSelect={handleVenueSelect} />
            )}
          </>
        )}
        {value && (
          <SelectedLocation
            name={value.displayName}
            onClear={handleVenueClear}
          />
        )}
      </div>
      <LocationDisplay
        location={{
          lat: center[0],
          lon: center[1],
        }}
        zoom={zoom}
      />
    </div>
  );
}

// input field for user to search for a location
type LocationSearchProps = {
  onSearch: (query: string) => Promise<void>;
};

function LocationSearch({ onSearch }: LocationSearchProps) {
  const [search, setSearch] = useState("");
  const debouncedValue = useDebounce(search, 500);

  useEffect(() => {
    if (debouncedValue) {
      onSearch(debouncedValue);
    }
  }, [onSearch, debouncedValue]);
  return (
    <RawInput
      placeholder="Select location..."
      value={search}
      onChange={(e) => setSearch(e.target.value)}
    />
  );
}

// showing the selected location and allowing the user to clear it

type SelectedLocationProps = {
  name: string;
  onClear: () => void;
};

function SelectedLocation({ name, onClear }: SelectedLocationProps) {
  return (
    <div className="mb-4 space-y-2 rounded border border-neutral-100 p-2 dark:border-neutral-800">
      <div>{name}</div>
      <Button type="button" variant="destructive-link" onClick={onClear}>
        Clear Location
      </Button>
    </div>
  );
}

// showing all the venue list with options to select a venue
type VenueListProps = {
  venues: Venue[];
  onSelect: (venue: Venue) => void;
};

function VenueList({ venues, onSelect }: VenueListProps) {
  return (
    <ScrollArea className="h-[160px]">
      <div className="space-y-2 pr-4">
        {venues.map((venue, index) => (
          <div
            key={index}
            className="cursor-pointer rounded border border-neutral-100 p-2 text-neutral-600 hover:bg-neutral-100 dark:border-neutral-800 dark:text-neutral-400 dark:hover:bg-neutral-800"
            onClick={() => onSelect(venue)}
          >
            {venue.display_name}
          </div>
        ))}
      </div>
      <ScrollBar />
    </ScrollArea>
  );
}
