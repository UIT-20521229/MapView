import React from "react";
import MapView from "./components/MapView";

export default function App() {
  const waypoints = [
    { location: [105.99963, 9.999341] },
    { location: [106.498959, 10.500212] },
  ];
  return <MapView waypoints={waypoints} />;
}
