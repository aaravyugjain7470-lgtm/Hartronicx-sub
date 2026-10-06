"use client";

import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

type MapComponentProps = {
  latitude: number;
  longitude: number;
  location: string;
  temperature: number;
  rain: number;
  humidity: number;
};

export default function MapComponent({
  latitude,
  longitude,
  location,
  temperature,
  rain,
  humidity,
}: MapComponentProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<L.Map | null>(null);
  const layersRef = useRef<L.LayerGroup | null>(null);

  const [filter, setFilter] = useState("ALL");

  useEffect(() => {
    if (!mapRef.current) return;

    // Prevent duplicate map initialization
    if (mapInstance.current) {
      mapInstance.current.remove();
      mapInstance.current = null;
    }

    const map = L.map(mapRef.current).setView(
      [latitude, longitude],
      12
    );

    mapInstance.current = map;

    // 🛰️ Esri World Imagery Satellite Layer
    L.tileLayer(
      "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
      {
        maxZoom: 19,
        attribution:
          "© Esri, Maxar, Earthstar Geographics, and the GIS User Community",
      }
    ).addTo(map);

    // Location marker
    const marker = L.marker([latitude, longitude])
      .addTo(map)
      .bindPopup(
        `<b>${location}</b><br/>
        Temperature: ${temperature}°C<br/>
        Rain: ${rain} mm<br/>
        Humidity: ${humidity}%`
      )
      .openPopup();

    layersRef.current = L.layerGroup().addTo(map);

    return () => {
      marker.remove();
      map.remove();
      mapInstance.current = null;
    };
  }, [latitude, longitude, location, temperature, rain, humidity]);

  useEffect(() => {
    if (!mapInstance.current || !layersRef.current) return;

    const layers = layersRef.current;
    layers.clearLayers();

    // Risk calculations - prototype logic
    const heatRisk = temperature >= 35;
    const rainfallRisk = rain >= 5;
    const floodRisk = rain >= 10 || humidity >= 85;
    const disasterRisk = heatRisk || rainfallRisk || floodRisk;

    const addCircle = (
      color: string,
      radius: number,
      title: string
    ) => {
      L.circle([latitude, longitude], {
        radius,
        color,
        fillColor: color,
        fillOpacity: 0.25,
        weight: 2,
      })
        .bindPopup(`<b>${title}</b>`)
        .addTo(layers);
    };

    if (filter === "ALL" || filter === "HEAT") {
      if (heatRisk) {
        addCircle("#ff7a00", 1500, "🔥 Heat Risk Zone");
      }
    }

    if (filter === "ALL" || filter === "RAIN") {
      if (rainfallRisk) {
        addCircle("#ffd000", 2200, "🌧️ Heavy Rainfall Risk");
      }
    }

    if (filter === "ALL" || filter === "FLOOD") {
      if (floodRisk) {
        addCircle("#008cff", 3000, "🌊 Flood Risk Zone");
      }
    }

    if (filter === "ALL" || filter === "DISASTER") {
      if (disasterRisk) {
        addCircle("#ff1744", 4500, "🚨 Disaster Risk Area");
      }
    }
  }, [
    filter,
    latitude,
    longitude,
    temperature,
    rain,
    humidity,
  ]);

  return (
    <div className="space-y-4">

      {/* Risk Filters */}
      <div className="flex flex-wrap gap-2">
        {[
          ["ALL", "ALL RISKS"],
          ["HEAT", "🔥 HEAT"],
          ["FLOOD", "🌊 FLOOD"],
          ["RAIN", "🌧️ RAIN"],
          ["DISASTER", "🚨 DISASTER"],
        ].map(([value, label]) => (
          <button
            key={value}
            onClick={() => setFilter(value)}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
              filter === value
                ? "bg-white text-black"
                : "border border-white/20 bg-white/5 text-white/70 hover:bg-white/10"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Satellite Map */}
      <div className="relative overflow-hidden rounded-2xl border border-white/10">
        <div
          ref={mapRef}
          style={{
            height: "520px",
            width: "100%",
          }}
        />

        {/* Map Legend */}
        <div className="absolute bottom-4 left-4 z-[1000] rounded-xl border border-white/20 bg-black/80 p-4 text-xs text-white backdrop-blur-md">
          <div className="mb-2 font-semibold">
            NEXUS-AI Risk Zones
          </div>

          <div className="space-y-1">
            <div>🟠 Heat Risk</div>
            <div>🔵 Flood Risk</div>
            <div>🟡 Rainfall Risk</div>
            <div>🔴 Disaster Risk</div>
          </div>
        </div>

        {/* Satellite Badge */}
        <div className="absolute right-4 top-4 z-[1000] rounded-lg border border-white/20 bg-black/80 px-3 py-2 text-xs text-white backdrop-blur-md">
          🛰️ ESRI WORLD IMAGERY
        </div>
      </div>

      <p className="text-xs text-white/40">
        Satellite basemap: Esri World Imagery. Risk zones are
        prototype visualizations based on current weather data.
      </p>
    </div>
  );
}