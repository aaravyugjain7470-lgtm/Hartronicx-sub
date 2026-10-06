from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import httpx


# ==========================================
# NEXUS-AI FASTAPI APPLICATION
# ==========================================

app = FastAPI(
    title="NEXUS-AI",
    description="Disaster Intelligence & Emergency Response Platform",
    version="1.0.0",
)


# ==========================================
# CORS
# ==========================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ==========================================
# ROOT
# ==========================================

@app.get("/")
def root():
    return {
        "message": "NEXUS-AI Backend is running",
        "status": "online",
    }


# ==========================================
# HEALTH CHECK
# ==========================================

@app.get("/api/health")
def health():
    return {
        "status": "healthy",
        "service": "NEXUS-AI API",
    }


# ==========================================
# CITY → COORDINATES
# Open-Meteo Geocoding API
# ==========================================

def get_coordinates(city: str):

    url = "https://geocoding-api.open-meteo.com/v1/search"

    params = {
        "name": city,
        "count": 1,
        "language": "en",
        "format": "json",
    }

    try:

        with httpx.Client(timeout=5.0) as client:

            response = client.get(
                url,
                params=params,
            )

            response.raise_for_status()

            data = response.json()

        results = data.get("results", [])

        if not results:
            raise HTTPException(
                status_code=404,
                detail=f"Location '{city}' not found.",
            )

        location = results[0]

        return {
            "name": location.get("name"),
            "country": location.get("country"),
            "latitude": location["latitude"],
            "longitude": location["longitude"],
        }

    except httpx.HTTPError as exc:

        raise HTTPException(
            status_code=502,
            detail="Location service is unavailable.",
        ) from exc


# ==========================================
# WEATHER API
# ==========================================

def get_weather(latitude: float, longitude: float):

    url = "https://api.open-meteo.com/v1/forecast"

    params = {
        "latitude": latitude,
        "longitude": longitude,

        "current": (
            "temperature_2m,"
            "relative_humidity_2m,"
            "precipitation,"
            "rain,"
            "wind_speed_10m,"
            "weather_code"
        ),

        "hourly": "precipitation",

        "forecast_days": 1,

        "timezone": "auto",
    }

    try:

        with httpx.Client(timeout=5.0) as client:

            response = client.get(
                url,
                params=params,
            )

            response.raise_for_status()

            data = response.json()

        return data

    except httpx.HTTPError as exc:

        raise HTTPException(
            status_code=502,
            detail="Weather service is unavailable.",
        ) from exc


# ==========================================
# ANALYZE LOCATION
# ==========================================

@app.get("/api/analyze")
def analyze_location(city: str = "Indore"):

    # Step 1: Find coordinates
    location = get_coordinates(city)

    # Step 2: Get weather
    weather = get_weather(
        location["latitude"],
        location["longitude"],
    )

    current = weather["current"]

    return {
        "location": location,

        "current": {
            "temperature": current["temperature_2m"],
            "humidity": current["relative_humidity_2m"],
            "precipitation": current["precipitation"],
            "rain": current["rain"],
            "wind_speed": current["wind_speed_10m"],
            "weather_code": current["weather_code"],
            "time": current["time"],
        },

        "source": "Open-Meteo",
    }

# ============================================
# INDIA STATE LIVE RISK ANALYSIS
# ============================================

INDIA_STATES = {
    "Andhra Pradesh": (16.5062, 80.6480),
    "Arunachal Pradesh": (27.0844, 93.6053),
    "Assam": (26.1445, 91.7362),
    "Bihar": (25.5941, 85.1376),
    "Chhattisgarh": (21.2514, 81.6296),
    "Goa": (15.4909, 73.8278),
    "Gujarat": (23.0225, 72.5714),
    "Haryana": (29.0588, 76.0856),
    "Himachal Pradesh": (31.1048, 77.1734),
    "Jharkhand": (23.3441, 85.3096),
    "Karnataka": (12.9716, 77.5946),
    "Kerala": (8.5241, 76.9366),
    "Madhya Pradesh": (23.2599, 77.4126),
    "Maharashtra": (19.0760, 72.8777),
    "Manipur": (24.8170, 93.9368),
    "Meghalaya": (25.5788, 91.8933),
    "Mizoram": (23.1645, 92.9376),
    "Nagaland": (25.6751, 94.1086),
    "Odisha": (20.2961, 85.8245),
    "Punjab": (30.9010, 75.8573),
    "Rajasthan": (26.9124, 75.7873),
    "Sikkim": (27.3389, 88.6065),
    "Tamil Nadu": (13.0827, 80.2707),
    "Telangana": (17.3850, 78.4867),
    "Tripura": (23.8315, 91.2868),
    "Uttar Pradesh": (26.8467, 80.9462),
    "Uttarakhand": (30.0668, 79.0193),
    "West Bengal": (22.5726, 88.3639),
}


def calculate_risk(
    temperature: float,
    humidity: float,
    rain: float,
):
    # Heat risk
    heat_score = min(
        100,
        max(0, ((temperature - 30) / 10) * 100)
    )

    # Rainfall risk
    rainfall_score = min(
        100,
        (rain / 10) * 100
    )

    # Flood risk
    flood_score = min(
        100,
        rainfall_score * 0.7
        + max(0, (humidity - 60) / 40) * 30
    )

    # Overall risk
    overall_score = round(
        max(
            heat_score,
            rainfall_score,
            flood_score,
        )
    )

    if overall_score >= 70:
        level = "HIGH"
    elif overall_score >= 40:
        level = "MODERATE"
    else:
        level = "LOW"

    return {
        "overall": overall_score,
        "level": level,
        "heat": round(heat_score),
        "rain": round(rainfall_score),
        "flood": round(flood_score),
    }


def get_state_weather(
    latitude: float,
    longitude: float,
):
    url = "https://api.open-meteo.com/v1/forecast"

    params = {
        "latitude": latitude,
        "longitude": longitude,
        "current": (
            "temperature_2m,"
            "relative_humidity_2m,"
            "precipitation,"
            "rain,"
            "wind_speed_10m,"
            "weather_code"
        ),
        "timezone": "auto",
    }

    try:
        with httpx.Client(timeout=8.0) as client:
            response = client.get(
                url,
                params=params,
            )

            response.raise_for_status()

            return response.json()

    except httpx.HTTPError as exc:
        raise HTTPException(
            status_code=502,
            detail="Weather service unavailable.",
        ) from exc


@app.get("/api/india-risk")
def india_risk():

    results = []

    for state, coordinates in INDIA_STATES.items():

        latitude, longitude = coordinates

        try:
            weather = get_state_weather(
                latitude,
                longitude,
            )

            current = weather["current"]

            temperature = current["temperature_2m"]
            humidity = current["relative_humidity_2m"]
            rain = current["rain"]
            wind = current["wind_speed_10m"]

            risk = calculate_risk(
                temperature,
                humidity,
                rain,
            )

            results.append({
                "state": state,

                "coordinates": {
                    "latitude": latitude,
                    "longitude": longitude,
                },

                "weather": {
                    "temperature": temperature,
                    "humidity": humidity,
                    "rain": rain,
                    "wind": wind,
                    "weather_code": current["weather_code"],
                },

                "risk": risk,

                "source": "Open-Meteo",
            })

        except Exception as exc:

            print(
                f"Failed to fetch {state}: {exc}"
            )

            results.append({
                "state": state,

                "coordinates": {
                    "latitude": latitude,
                    "longitude": longitude,
                },

                "weather": None,

                "risk": {
                    "overall": 0,
                    "level": "UNKNOWN",
                    "heat": 0,
                    "rain": 0,
                    "flood": 0,
                },

                "source": "Open-Meteo",
                "error": True,
            })

    return {
        "country": "India",
        "states": results,
        "total_states": len(results),
        "source": "Open-Meteo",
    }