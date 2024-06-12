import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import { useState, useEffect } from "react";
import "leaflet/dist/leaflet.css";

const MapComponent = ({ region, handleAddMarker }) => {
  const map = useMap();

  useEffect(() => {
    map.panTo([region.latitude, region.longitude], 13);
  }, [region]);

  return null;
};

const MapView = () => {
  const [region, setRegion] = useState({
    latitude: 21.0285,
    longitude: 105.8542,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });

  useEffect(() => {
    console.log("new Region", region);
  }, [region]);

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
        } else if (message.type === "searchLocation") {
          const query = message.query;
          if (query) {
            const response = await fetch(
              `http://171.247.47.0/nominatim/search?q=${query}&format=json`,
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
                  latitudeDelta: 0.0922,
                  longitudeDelta: 0.0421,
                };

                // Set the new region
                setRegion(newRegion);
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
  }, []);

  // const handleAddMarker = (newRegion) => {
  //   setRegion(newRegion);
  // };

  return (
    <>
      {console.log( "nnn",region)}
      <MapContainer
        center={[region.latitude, region.longitude]}
        zoom={13}
        style={{ height: "100vh", width: "100%" }}
        scrollWheelZoom={true}
        zoomControl={false}
      >
        <TileLayer
          url="http://171.247.47.0/map/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        <Marker position={[region.latitude, region.longitude]} />
        <MapComponent region={region} />
      </MapContainer>
    </>
  );
};

export default MapView;
