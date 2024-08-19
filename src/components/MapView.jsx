/* eslint-disable react/prop-types */
/* eslint-disable react-hooks/exhaustive-deps */
import { MapContainer, TileLayer, Marker, useMap, Polyline } from "react-leaflet";
import { useState, useEffect } from "react";
import "leaflet/dist/leaflet.css";
import "../index.css";

const MapComponent = ({ region, markerTo, setPoliLine }) => {
  const map = useMap();
  useEffect(() => {
    map.panTo([region.latitude, region.longitude], 20);
  }, [region, markerTo]);

  useEffect(() => {
    if (!markerTo) return;
    const fetchRoute = async () => {
      await fetch(`http://171.244.143.125:5000/route/v1/driving/${region.longitude},${region.latitude};${markerTo.longitude},${markerTo.latitude}?geometries=geojson&alternatives=true&overview=full`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      })
        .then((res) => res.json())
        .then((data) => {
          const { coordinates } = data.routes[0].geometry;
          const newCoordinates = coordinates.map((coordinate) => [coordinate[1], coordinate[0]]);
          setPoliLine(newCoordinates);
        });
    };
    fetchRoute();
    map.fitBounds([
      [region.latitude, region.longitude],
      [markerTo.latitude, markerTo.longitude],
    ]);
  }, [markerTo, region]);

  return null;
};

const MapView = () => {
  const [region, setRegion] = useState({
    longitude: 105.854,
    latitude: 21.0285,
  });
  const [markerTo, setMarkerTo] = useState(null);
  const [poliLine, setPoliLine] = useState([]);

  useEffect(() => {
    const handleMessage = async (event) => {
      try {
        const message = JSON.parse(event.data);
        if (message.type === "currentLocation") {
          const newRegion = {
            latitude: message.data.latitude,
            longitude: message.data.longitude,
          };
          console.log("handleCurrentLocation", newRegion);
          setRegion(newRegion);
        } else if (message.type === "searchLocation") {
          const query = message.query;
          const queryType = message.queryType
          if (query) {
            const response = await fetch(`https://nominatim.openstreetmap.org/search?q=${query}&format=json`, {
              method: "GET",
              headers: { "Content-Type": "application/json" },
            });

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
                if (queryType === "from") {
                  setRegion(newRegion);

                }
                else {
                  setMarkerTo(newRegion);

                }

                console.log("searchLocation", newRegion);
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
        style={{ height: "100vh", width: "100%", position: "absolute", top: 0, left: 0 }}
        scrollWheelZoom={true}
        zoomControl={false}
        className="map"
      >
        <TileLayer url="https://tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <Marker position={[region.latitude, region.longitude]} />
        {markerTo && (
          <>
            <Marker position={[markerTo.latitude, markerTo.longitude]} />
            <Polyline positions={poliLine} />
          </>
        )}
        <MapComponent region={region} markerTo={markerTo} setPoliLine={setPoliLine} />
      </MapContainer>
    </>
  );
};

export default MapView;
