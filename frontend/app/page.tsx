"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";

const MapComponent = dynamic(
  () => import("./MapComponent"),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-[520px] items-center justify-center rounded-2xl bg-[#07111f] text-slate-400">
        <div className="text-center">
          <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-2 border-cyan-400 border-t-transparent" />
          Loading satellite intelligence...
        </div>
      </div>
    ),
  }
);

type WeatherData = {
  location: {
    name: string;
    country: string;
    latitude: number;
    longitude: number;
  };

  current: {
    temperature_2m: number;
    relative_humidity_2m: number;
    precipitation: number;
    rain: number;
    wind_speed_10m: number;
    weather_code: number;
  };

  source: string;
};

export default function Home() {
  const [location, setLocation] = useState("Indore");
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchWeather("Indore");
  }, []);

  async function fetchWeather(city: string) {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        `http://127.0.0.1:8000/api/analyze?city=${encodeURIComponent(city)}`
      );

      if (!response.ok) {
        throw new Error("Unable to analyze location");
      }

      const data = await response.json();

      setWeather({
        location: {
          name: data.location.name,
          country: data.location.country,
          latitude: data.location.latitude,
          longitude: data.location.longitude,
        },

        current: {
          temperature_2m: data.current.temperature,
          relative_humidity_2m: data.current.humidity,
          precipitation: data.current.precipitation,
          rain: data.current.rain,
          wind_speed_10m: data.current.wind_speed,
          weather_code: data.current.weather_code,
        },

        source: data.source,
      });
    } catch (err) {
      console.error(err);
      setError(
        "Location analysis failed. Please check the city name."
      );
    } finally {
      setLoading(false);
    }
  }

  function analyzeLocation() {
    if (!location.trim()) return;
    fetchWeather(location.trim());
  }

  function getWeatherText(code: number) {
    if (code === 0) return "Clear Sky";
    if (code <= 3) return "Partly Cloudy";
    if (code <= 48) return "Foggy";
    if (code <= 67) return "Rain";
    if (code <= 77) return "Snow";
    if (code <= 82) return "Rain Showers";
    if (code <= 99) return "Thunderstorm";
    return "Unknown";
  }

  const temperature =
    weather?.current.temperature_2m ?? 0;

  const humidity =
    weather?.current.relative_humidity_2m ?? 0;

  const rain =
    weather?.current.rain ?? 0;

  const wind =
    weather?.current.wind_speed_10m ?? 0;

  /* --------------------------------
     PROTOTYPE RISK ENGINE
  -------------------------------- */

  const heatScore = Math.min(
    100,
    Math.max(0, ((temperature - 30) / 10) * 100)
  );

  const rainScore = Math.min(
    100,
    (rain / 10) * 100
  );

  const floodScore = Math.min(
    100,
    rainScore * 0.7 +
      Math.max(0, (humidity - 60) / 40) * 30
  );

  const overallRisk = Math.round(
    Math.max(heatScore, rainScore, floodScore)
  );

  const riskLevel =
    overallRisk >= 70
      ? "HIGH"
      : overallRisk >= 40
      ? "MODERATE"
      : "LOW";

  const riskColor =
    riskLevel === "HIGH"
      ? "text-red-400"
      : riskLevel === "MODERATE"
      ? "text-amber-400"
      : "text-cyan-400";

  const riskBg =
    riskLevel === "HIGH"
      ? "bg-red-500/10 border-red-500/30"
      : riskLevel === "MODERATE"
      ? "bg-amber-500/10 border-amber-500/30"
      : "bg-cyan-500/10 border-cyan-500/30";

  const riskMessage =
    riskLevel === "HIGH"
      ? "Elevated environmental conditions detected. Immediate attention recommended."
      : riskLevel === "MODERATE"
      ? "Some environmental indicators require monitoring."
      : "Current environmental conditions indicate relatively low immediate risk.";

  return (
    <main className="min-h-screen bg-[#050b14] text-white">

      {/* =========================================
          BACKGROUND GLOW
      ========================================= */}

      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute left-[-200px] top-[-200px] h-[500px] w-[500px] rounded-full bg-cyan-500/10 blur-[140px]" />
        <div className="absolute right-[-200px] top-[300px] h-[500px] w-[500px] rounded-full bg-blue-600/10 blur-[140px]" />
      </div>

      {/* =========================================
          HEADER
      ========================================= */}

      <header className="sticky top-0 z-50 border-b border-white/10 bg-[#050b14]/90 backdrop-blur-xl">

        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 lg:px-8">

          <div className="flex items-center gap-3">

            <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-cyan-400/30 bg-cyan-400/10 text-xl shadow-[0_0_25px_rgba(34,211,238,0.12)]">
              ◈
            </div>

            <div>
              <h1 className="text-xl font-bold tracking-tight sm:text-2xl">
                NEXUS<span className="text-cyan-400">-AI</span>
              </h1>

              <p className="hidden text-[11px] tracking-[0.18em] text-slate-500 sm:block">
                DISASTER INTELLIGENCE PLATFORM
              </p>
            </div>

          </div>

          <div className="flex items-center gap-2 sm:gap-4">

            <div className="hidden rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 text-xs text-slate-400 md:block">
              AI COMMAND CENTER
            </div>

            <div className="flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-2 text-xs font-medium text-cyan-300">
              <span className="h-2 w-2 animate-pulse rounded-full bg-cyan-400 shadow-[0_0_10px_#22d3ee]" />
              SYSTEM ONLINE
            </div>

          </div>

        </div>

      </header>

      {/* =========================================
          MAIN
      ========================================= */}

      <section className="relative mx-auto max-w-7xl space-y-6 px-5 py-7 lg:px-8 lg:py-10">

        {/* =====================================
            HERO
        ===================================== */}

        <section className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-[#0b1a2d] via-[#081321] to-[#050b14] p-7 shadow-2xl sm:p-10">

          <div className="absolute right-[-80px] top-[-100px] h-[320px] w-[320px] rounded-full bg-cyan-400/10 blur-[90px]" />

          <div className="relative max-w-4xl">

            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1.5 text-xs font-semibold tracking-[0.18em] text-cyan-300">
              <span>✦</span>
              REAL-TIME DISASTER INTELLIGENCE
            </div>

            <h2 className="text-4xl font-bold leading-tight tracking-tight sm:text-6xl">
              Understand Risk.
              <br />
              <span className="bg-gradient-to-r from-cyan-300 via-blue-400 to-cyan-500 bg-clip-text text-transparent">
                Respond Faster.
              </span>
            </h2>

            <p className="mt-5 max-w-2xl text-sm leading-7 text-slate-400 sm:text-base">
              NEXUS-AI combines live environmental data,
              geospatial intelligence and explainable risk
              analysis to support faster emergency response.
            </p>

            <div className="mt-7 flex flex-wrap gap-3">

              <div className="rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3">
                <p className="text-[10px] uppercase tracking-widest text-slate-500">
                  Data
                </p>
                <p className="mt-1 text-sm font-medium">
                  Live Weather
                </p>
              </div>

              <div className="rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3">
                <p className="text-[10px] uppercase tracking-widest text-slate-500">
                  Intelligence
                </p>
                <p className="mt-1 text-sm font-medium">
                  Explainable AI
                </p>
              </div>

              <div className="rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3">
                <p className="text-[10px] uppercase tracking-widest text-slate-500">
                  Mapping
                </p>
                <p className="mt-1 text-sm font-medium">
                  Satellite GIS
                </p>
              </div>

            </div>

          </div>

        </section>

        {/* =====================================
            SEARCH
        ===================================== */}

        <section className="rounded-2xl border border-white/10 bg-white/[0.025] p-5 shadow-xl backdrop-blur-xl sm:p-6">

          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">

            <div>
              <p className="text-[11px] font-bold tracking-[0.2em] text-cyan-400">
                LOCATION INTELLIGENCE
              </p>

              <h3 className="mt-2 text-xl font-semibold">
                Analyze Any Location
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                Search a city to retrieve live environmental conditions.
              </p>
            </div>

            <div className="flex w-full gap-2 sm:max-w-xl">

              <div className="relative flex-1">

                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">
                  ⌕
                </span>

                <input
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      analyzeLocation();
                    }
                  }}
                  className="h-12 w-full rounded-xl border border-white/10 bg-[#070e19] pl-11 pr-4 text-sm outline-none transition placeholder:text-slate-600 focus:border-cyan-400/50 focus:ring-2 focus:ring-cyan-400/10"
                  placeholder="Enter city e.g. Mumbai"
                />

              </div>

              <button
                onClick={analyzeLocation}
                disabled={loading}
                className="h-12 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 px-5 text-sm font-bold text-[#03101a] shadow-[0_0_25px_rgba(34,211,238,0.15)] transition hover:scale-[1.02] hover:shadow-[0_0_35px_rgba(34,211,238,0.25)] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading ? "Analyzing..." : "Analyze"}
              </button>

            </div>

          </div>

        </section>

        {/* =====================================
            KPI CARDS
        ===================================== */}

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">

          {/* Risk */}

          <div className={`group rounded-2xl border p-5 transition hover:-translate-y-1 hover:bg-white/[0.04] ${riskBg}`}>

            <div className="flex items-center justify-between">

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-400/10 text-lg">
                ◉
              </div>

              <span className="text-xs text-slate-500">
                AI SCORE
              </span>

            </div>

            <div className="mt-6 flex items-end justify-between">

              <div>
                <p className="text-xs text-slate-500">
                  Overall Risk
                </p>

                <h3 className={`mt-1 text-3xl font-bold ${riskColor}`}>
                  {loading ? "--" : `${overallRisk}%`}
                </h3>
              </div>

              <span className={`text-xs font-bold ${riskColor}`}>
                {loading ? "..." : riskLevel}
              </span>

            </div>

            <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-white/10">
              <div
                className={`h-full rounded-full transition-all duration-700 ${
                  riskLevel === "HIGH"
                    ? "bg-red-400"
                    : riskLevel === "MODERATE"
                    ? "bg-amber-400"
                    : "bg-cyan-400"
                }`}
                style={{
                  width: `${loading ? 0 : overallRisk}%`,
                }}
              />
            </div>

          </div>

          {/* Temperature */}

          <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-5 transition hover:-translate-y-1 hover:bg-white/[0.04]">

            <div className="flex items-center justify-between">

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-400/10">
                🌡️
              </div>

              <span className="text-xs text-slate-500">
                CURRENT
              </span>

            </div>

            <p className="mt-6 text-xs text-slate-500">
              Temperature
            </p>

            <h3 className="mt-1 text-3xl font-bold">
              {loading ? "--" : `${temperature}°C`}
            </h3>

            <p className="mt-2 text-xs text-slate-500">
              Live environmental data
            </p>

          </div>

          {/* Humidity */}

          <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-5 transition hover:-translate-y-1 hover:bg-white/[0.04]">

            <div className="flex items-center justify-between">

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-400/10">
                💧
              </div>

              <span className="text-xs text-slate-500">
                CURRENT
              </span>

            </div>

            <p className="mt-6 text-xs text-slate-500">
              Humidity
            </p>

            <h3 className="mt-1 text-3xl font-bold">
              {loading ? "--" : `${humidity}%`}
            </h3>

            <p className="mt-2 text-xs text-slate-500">
              Relative humidity
            </p>

          </div>

          {/* System */}

          <div className="rounded-2xl border border-cyan-400/10 bg-cyan-400/[0.025] p-5 transition hover:-translate-y-1 hover:bg-cyan-400/[0.05]">

            <div className="flex items-center justify-between">

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-400/10">
                ◈
              </div>

              <span className="text-xs text-cyan-500">
                API STATUS
              </span>

            </div>

            <p className="mt-6 text-xs text-slate-500">
              System
            </p>

            <h3 className="mt-1 text-3xl font-bold text-cyan-400">
              ONLINE
            </h3>

            <p className="mt-2 text-xs text-slate-500">
              Services connected
            </p>

          </div>

        </section>

        {/* =====================================
            ENVIRONMENT + AI
        ===================================== */}

        <section className="grid gap-5 lg:grid-cols-5">

          {/* Environment */}

          <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-6 lg:col-span-3">

            <div className="flex items-start justify-between">

              <div>

                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 animate-pulse rounded-full bg-cyan-400" />
                  <p className="text-[11px] font-bold tracking-[0.2em] text-cyan-400">
                    LIVE ENVIRONMENT
                  </p>
                </div>

                <h3 className="mt-2 text-xl font-semibold">
                  Current Conditions
                </h3>

                <p className="mt-1 text-sm text-slate-500">
                  {weather?.location.name || location}
                  {weather?.location.country
                    ? `, ${weather.location.country}`
                    : ""}
                </p>

              </div>

              <div className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-[10px] text-slate-400">
                {weather?.source || "Open-Meteo"}
              </div>

            </div>

            {error ? (

              <div className="mt-6 rounded-xl border border-red-400/20 bg-red-400/5 p-5 text-sm text-red-300">
                ⚠️ {error}
              </div>

            ) : (

              <div className="mt-7 grid grid-cols-2 gap-3 sm:grid-cols-4">

                {[
                  ["Temperature", loading ? "--" : `${temperature}°C`, "🌡️"],
                  ["Humidity", loading ? "--" : `${humidity}%`, "💧"],
                  ["Rain", loading ? "--" : `${rain} mm`, "🌧️"],
                  ["Wind", loading ? "--" : `${wind} km/h`, "💨"],
                ].map(([label, value, icon]) => (

                  <div
                    key={label}
                    className="rounded-xl border border-white/5 bg-[#070e19] p-4"
                  >
                    <div className="text-lg">{icon}</div>

                    <p className="mt-4 text-[11px] uppercase tracking-wider text-slate-600">
                      {label}
                    </p>

                    <p className="mt-1 text-lg font-bold">
                      {value}
                    </p>
                  </div>

                ))}

              </div>

            )}

            <div className="mt-5 rounded-xl border border-white/5 bg-white/[0.02] p-4">

              <div className="flex items-center justify-between">

                <span className="text-xs text-slate-500">
                  Weather condition
                </span>

                <span className="text-sm font-medium text-slate-200">
                  {weather
                    ? getWeatherText(
                        weather.current.weather_code
                      )
                    : "--"}
                </span>

              </div>

            </div>

          </div>

          {/* AI */}

          <div className={`rounded-2xl border p-6 ${riskBg} lg:col-span-2`}>

            <div className="flex items-center justify-between">

              <div>
                <p className="text-[11px] font-bold tracking-[0.2em] text-cyan-400">
                  EXPLAINABLE AI
                </p>

                <h3 className="mt-2 text-xl font-semibold">
                  Risk Assessment
                </h3>
              </div>

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/5">
                ✦
              </div>

            </div>

            <div className="mt-6">

              <div className="flex items-end justify-between">

                <div>
                  <p className="text-xs text-slate-500">
                    Current Risk
                  </p>

                  <p className={`mt-1 text-3xl font-bold ${riskColor}`}>
                    {loading ? "--" : riskLevel}
                  </p>
                </div>

                <p className={`text-2xl font-bold ${riskColor}`}>
                  {loading ? "--" : `${overallRisk}%`}
                </p>

              </div>

              <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/10">
                <div
                  className={`h-full rounded-full transition-all duration-700 ${
                    riskLevel === "HIGH"
                      ? "bg-red-400"
                      : riskLevel === "MODERATE"
                      ? "bg-amber-400"
                      : "bg-cyan-400"
                  }`}
                  style={{
                    width: `${loading ? 0 : overallRisk}%`,
                  }}
                />
              </div>

              <p className="mt-5 text-sm leading-6 text-slate-400">
                {loading
                  ? "Analyzing current environmental conditions..."
                  : riskMessage}
              </p>

            </div>

            <div className="mt-6 space-y-3">

              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <span className="text-sm text-slate-500">
                  Heat indicator
                </span>

                <span className="font-medium text-orange-300">
                  {Math.round(heatScore)}%
                </span>
              </div>

              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <span className="text-sm text-slate-500">
                  Rain indicator
                </span>

                <span className="font-medium text-yellow-300">
                  {Math.round(rainScore)}%
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-500">
                  Flood indicator
                </span>

                <span className="font-medium text-blue-300">
                  {Math.round(floodScore)}%
                </span>
              </div>

            </div>

          </div>

        </section>

        {/* =====================================
            MAP
        ===================================== */}

        <section className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.025] p-5 sm:p-6">

          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

            <div>

              <div className="flex items-center gap-2">

                <span className="rounded-md border border-blue-400/20 bg-blue-400/10 px-2 py-1 text-[10px] font-bold tracking-widest text-blue-300">
                  GIS
                </span>

                <p className="text-[11px] font-bold tracking-[0.2em] text-cyan-400">
                  GEOSPATIAL INTELLIGENCE
                </p>

              </div>

              <h3 className="mt-2 text-xl font-semibold">
                Disaster Monitoring Map
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                Satellite imagery with AI-estimated environmental risk zones.
              </p>

            </div>

            <div className="flex items-center gap-2">

              <div className="flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/5 px-3 py-1.5 text-xs text-cyan-300">
                <span className="h-1.5 w-1.5 rounded-full bg-cyan-400" />
                LIVE
              </div>

              <div className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs text-slate-400">
                🛰️ ESRI SATELLITE
              </div>

            </div>

          </div>

          <div className="mt-5 overflow-hidden rounded-2xl border border-white/10 shadow-2xl">

            {weather ? (

              <MapComponent
                latitude={weather.location.latitude}
                longitude={weather.location.longitude}
                location={weather.location.name}
                temperature={temperature}
                rain={rain}
                humidity={humidity}
              />

            ) : (

              <div className="flex h-[520px] items-center justify-center bg-[#07111f] text-slate-500">
                Waiting for live location data...
              </div>

            )}

          </div>

          {weather && (

            <div className="mt-4 grid gap-3 sm:grid-cols-3">

              <div className="rounded-xl border border-white/5 bg-[#070e19] p-4">

                <p className="text-[10px] uppercase tracking-widest text-slate-600">
                  Latitude
                </p>

                <p className="mt-2 font-mono text-sm text-cyan-300">
                  {weather.location.latitude.toFixed(4)}
                </p>

              </div>

              <div className="rounded-xl border border-white/5 bg-[#070e19] p-4">

                <p className="text-[10px] uppercase tracking-widest text-slate-600">
                  Longitude
                </p>

                <p className="mt-2 font-mono text-sm text-cyan-300">
                  {weather.location.longitude.toFixed(4)}
                </p>

              </div>

              <div className="rounded-xl border border-white/5 bg-[#070e19] p-4">

                <p className="text-[10px] uppercase tracking-widest text-slate-600">
                  Satellite Layer
                </p>

                <p className="mt-2 text-sm text-cyan-300">
                  Esri World Imagery
                </p>

              </div>

            </div>

          )}

        </section>

        {/* =====================================
            EMERGENCY RESPONSE
        ===================================== */}

        <section>

          <div className="mb-4">

            <p className="text-[11px] font-bold tracking-[0.2em] text-cyan-400">
              RESPONSE CENTER
            </p>

            <h3 className="mt-2 text-xl font-semibold">
              Emergency Response
            </h3>

          </div>

          <div className="grid gap-4 md:grid-cols-3">

            {/* Alerts */}

            <div className="group rounded-2xl border border-red-400/10 bg-red-400/[0.025] p-6 transition hover:-translate-y-1 hover:border-red-400/20">

              <div className="flex items-center justify-between">

                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-400/10 text-xl">
                  🚨
                </div>

                <span className="text-[10px] font-bold tracking-widest text-red-300">
                  ALERTS
                </span>

              </div>

              <h4 className="mt-5 font-semibold">
                Emergency Alerts
              </h4>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                Verified disaster alerts and environmental warnings.
              </p>

              <div className="mt-5 rounded-lg border border-cyan-400/10 bg-cyan-400/5 px-3 py-2 text-xs text-cyan-300">
                ● No active alerts
              </div>

            </div>

            {/* Services */}

            <div className="group rounded-2xl border border-blue-400/10 bg-blue-400/[0.025] p-6 transition hover:-translate-y-1 hover:border-blue-400/20">

              <div className="flex items-center justify-between">

                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-400/10 text-xl">
                  🚑
                </div>

                <span className="text-[10px] font-bold tracking-widest text-blue-300">
                  RESPONSE
                </span>

              </div>

              <h4 className="mt-5 font-semibold">
                Emergency Services
              </h4>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                Location-aware emergency resources for rapid response.
              </p>

              <button className="mt-5 rounded-lg border border-white/10 bg-white/[0.03] px-4 py-2 text-xs font-medium transition hover:border-blue-400/40 hover:bg-blue-400/10">
                View Resources →
              </button>

            </div>

            {/* Assistant */}

            <div className="group rounded-2xl border border-purple-400/10 bg-purple-400/[0.025] p-6 transition hover:-translate-y-1 hover:border-purple-400/20">

              <div className="flex items-center justify-between">

                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-purple-400/10 text-xl">
                  🤖
                </div>

                <span className="text-[10px] font-bold tracking-widest text-purple-300">
                  AI ASSIST
                </span>

              </div>

              <h4 className="mt-5 font-semibold">
                AI Emergency Assistant
              </h4>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                Ask questions about preparedness and emergency response.
              </p>

              <button className="mt-5 rounded-lg bg-gradient-to-r from-purple-400 to-blue-500 px-4 py-2 text-xs font-bold text-white transition hover:scale-[1.02]">
                Launch Assistant →
              </button>

            </div>

          </div>

        </section>

        {/* =====================================
            ARCHITECTURE STRIP
        ===================================== */}

        <section className="rounded-2xl border border-white/10 bg-gradient-to-r from-cyan-400/[0.04] to-blue-500/[0.04] p-5">

          <div className="grid gap-4 text-center sm:grid-cols-4">

            <div>
              <p className="text-lg">📡</p>
              <p className="mt-2 text-xs font-semibold">
                LIVE DATA
              </p>
              <p className="mt-1 text-[10px] text-slate-600">
                Environmental feeds
              </p>
            </div>

            <div>
              <p className="text-lg">🧠</p>
              <p className="mt-2 text-xs font-semibold">
                AI ANALYSIS
              </p>
              <p className="mt-1 text-[10px] text-slate-600">
                Explainable risk engine
              </p>
            </div>

            <div>
              <p className="text-lg">🛰️</p>
              <p className="mt-2 text-xs font-semibold">
                GEO INTELLIGENCE
              </p>
              <p className="mt-1 text-[10px] text-slate-600">
                Satellite visualization
              </p>
            </div>

            <div>
              <p className="text-lg">🚨</p>
              <p className="mt-2 text-xs font-semibold">
                RESPONSE
              </p>
              <p className="mt-1 text-[10px] text-slate-600">
                Faster decisions
              </p>
            </div>

          </div>

        </section>

        {/* =====================================
            FOOTER
        ===================================== */}

        <footer className="border-t border-white/10 pt-6 text-center">

          <p className="text-xs text-slate-600">
            NEXUS-AI • Disaster Intelligence & Emergency Response
          </p>

          <p className="mt-2 text-[10px] text-slate-700">
            Hackathon Prototype • Live environmental data • AI-assisted risk visualization
          </p>

        </footer>

      </section>

    </main>
  );
}