import React, { useEffect, useRef } from "react";

export default function MapView({ sites=[] }) {
  const ref = useRef(null);
  const mapRef = useRef(null);

  useEffect(() => {
    if (!window.L || !ref.current || mapRef.current) return;
    const L = window.L;
    const map = L.map(ref.current).setView([39.5, -98.35], 4); // USA
    mapRef.current = map;
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 18,
      attribution: "&copy; OpenStreetMap"
    }).addTo(map);
  }, []);

  useEffect(() => {
    const L = window.L;
    const map = mapRef.current;
    if (!L || !map) return;

    // clear old markers
    if (map._layers) {
      Object.values(map._layers).forEach((l) => {
        if (l instanceof L.Marker) map.removeLayer(l);
      });
    }

    sites.forEach((s) => {
      const color = s.status === "online" ? "green" : s.status === "pending" ? "yellow" : "red";
      const icon = L.divIcon({
        className: "",
        html: `<div style="width:14px;height:14px;border-radius:50%;background:${color};border:2px solid white;box-shadow:0 0 0 2px rgba(0,0,0,.2)"></div>`
      });
      const m = L.marker([s.lat, s.lng], { icon }).addTo(map);
      m.bindPopup(`<b>${s.name}</b><br/>Status: ${s.status}`);
    });

  }, [sites]);

  return <div className="map" ref={ref} />;
}
