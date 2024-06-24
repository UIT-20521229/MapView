import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import { useState, useEffect } from "react";
import "leaflet/dist/leaflet.css";
import '../index.css'

const MapComponent = ({ region, markerTo }) => {
  const map = useMap();

  useEffect(() => {
    map.panTo([region.latitude, region.longitude], 20);
  }, [region]);

  useEffect(() => {
    map.panTo([markerTo.latitude, markerTo.longitude], 20);
  }, [markerTo]);

  return null;
};

const MapView = () => {
  const [region, setRegion] = useState({
    longitude: 105.8540,
    latitude: 21.0285,
  });
  const [markerTo, setMarkerTo] = useState({
    longitude: 105.8540,
    latitude: 21.0285,
  });

  useEffect(() => {
    const handleMessage = async (event) => {
      console.log(region);
      try {
        const message = JSON.parse(event.data);
        if (message.type === "currentLocation") {
          const newRegion = {
            latitude: message.data.latitude,
            longitude: message.data.longitude,
            latitudeDelta: message.data.latitudeDelta,
            longitudeDelta: message.data.longitudeDelta,
          };
          console.log("handleCurrentLocation", newRegion);
          setRegion(newRegion);
        }
        else if (message.type === "searchLocation") {
          const query = message.query;
          if (query) {
            const response = await fetch(
              `http://171.247.51.237/nominatim/search?q=${query}&format=json`,
              {
                method: "GET",
                headers: { "Content-Type": "application/json" },
              }
            );

            if (response.status === 200) {
              const data = await response.json();
              const firstItem = data[0];

              if (firstItem) {
                const lat = parseFloat(firstItem.lat);
                const lon = parseFloat(firstItem.lon);

                const newRegion = {
                  latitude: lat,
                  longitude: lon,
                };

                // Set the new region
                // setRegion(newRegion);
                console.log("searchLocation", newRegion);
                setMarkerTo(newRegion)
              } else {
                console.error("No data returned from the API");
              }
            } else if (response.status === 500) {
              console.error("Server error");
            } else {
              console.error("Unexpected status code", response.status);
            }
          }
        }
      } catch (error) {
        console.error("Failed to parse message data", error);
      }
    };

    window.addEventListener("message", handleMessage);
    // Cleanup function
    return () => {
      window.removeEventListener("message", handleMessage);
    };
  }, [markerTo, region]);

  return (
    <>
      <MapContainer
        center={[region.latitude, region.longitude]}
        zoom={18}
        style={{ height: "100vh", width: "100%", position: 'absolute', top: 0, left: 0 }}
        scrollWheelZoom={true}
        zoomControl={false}
        className="map"
      >
        <TileLayer
          url="http://171.247.51.237/map/{z}/{x}/{y}.png"
        />
        <Marker position={[region.latitude, region.longitude]} />
        {markerTo && (
          <Marker position={[markerTo.latitude, markerTo.longitude]} />
        )}
        <MapComponent region={region} markerTo={markerTo} />
      </MapContainer>
    </>
  );
};

export default MapView;
