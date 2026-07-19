import { ApiError } from "../../utils/ApiError";
import type { WeatherConditions, WeatherLocation, WeatherResponse } from "./weather.types";

// ── WMO weather code → English description ──────────────────────────
const WMO_CODES: Record<number, string> = {
  0: "Clear sky",
  1: "Mainly clear",
  2: "Partly cloudy",
  3: "Overcast",
  45: "Foggy",
  48: "Depositing rime fog",
  51: "Light drizzle",
  53: "Moderate drizzle",
  55: "Dense drizzle",
  56: "Light freezing drizzle",
  57: "Dense freezing drizzle",
  61: "Slight rain",
  63: "Moderate rain",
  65: "Heavy rain",
  66: "Light freezing rain",
  67: "Heavy freezing rain",
  71: "Slight snow",
  73: "Moderate snow",
  75: "Heavy snow",
  77: "Snow grains",
  80: "Slight rain showers",
  81: "Moderate rain showers",
  82: "Violent rain showers",
  85: "Slight snow showers",
  86: "Heavy snow showers",
  95: "Thunderstorm",
  96: "Thunderstorm with slight hail",
  99: "Thunderstorm with heavy hail",
};

function weatherCodeDescription(code: number): string {
  return WMO_CODES[code] ?? "Unknown";
}

// ── IP geolocation via ip-api.com ────────────────────────────────────
async function locateByIp(ip: string): Promise<WeatherLocation> {
  const res = await fetch(`http://ip-api.com/json/${ip}?fields=status,country,regionName,city,lat,lon`);

  if (!res.ok) {
    throw new ApiError("Failed to determine location from IP address", 502);
  }

  const body = await res.json() as {
    status: string;
    country: string;
    regionName: string;
    city: string;
    lat: number;
    lon: number;
  };

  if (body.status !== "success") {
    throw new ApiError("Could not geolocate your IP address", 404);
  }

  return {
    city: body.city || "Unknown",
    region: body.regionName || "",
    country: body.country || "Unknown",
    lat: body.lat,
    lon: body.lon,
    source: "ip",
  };
}

// ── Open‑Meteo weather fetch ─────────────────────────────────────────
async function fetchWeather(lat: number, lon: number): Promise<WeatherConditions> {
  const params = new URLSearchParams({
    latitude: lat.toString(),
    longitude: lon.toString(),
    current: "temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m,wind_direction_10m",
    timezone: "auto",
  });

  const res = await fetch(`https://api.open-meteo.com/v1/forecast?${params}`);

  if (!res.ok) {
    const msg = await res.text().catch(() => "Unknown error");
    throw new ApiError(`Weather API error: ${msg}`, 502);
  }

  const body = (await res.json()) as {
    current: {
      temperature_2m: number;
      relative_humidity_2m: number;
      apparent_temperature: number;
      weather_code: number;
      wind_speed_10m: number;
      wind_direction_10m: number;
    };
  };

  const c = body.current;

  return {
    temperature: c.temperature_2m,
    feelsLike: c.apparent_temperature,
    condition: weatherCodeDescription(c.weather_code),
    conditionCode: c.weather_code,
    humidity: c.relative_humidity_2m,
    windSpeed: c.wind_speed_10m,
    windDirection: c.wind_direction_10m,
  };
}

// ── Public service function ──────────────────────────────────────────
export async function getWeather(
  lat: number | undefined,
  lon: number | undefined,
  clientIp: string,
): Promise<WeatherResponse> {
  // 1. Resolve location
  let location: WeatherLocation;

  if (lat !== undefined && lon !== undefined) {
    location = {
      city: "—", // we don't reverse-geocode; user provided coordinates
      region: "",
      country: "—",
      lat,
      lon,
      source: "user",
    };
  } else {
    location = await locateByIp(clientIp);
  }

  // 2. Fetch weather
  const weather = await fetchWeather(location.lat, location.lon);

  return { location, weather };
}
