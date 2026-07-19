export type WeatherLocation = {
  city: string;
  region: string;
  country: string;
  lat: number;
  lon: number;
  source: "ip" | "user";
};

export type WeatherConditions = {
  temperature: number;
  feelsLike: number;
  condition: string;
  conditionCode: number;
  humidity: number;
  windSpeed: number;
  windDirection: number;
};

export type WeatherResponse = {
  location: WeatherLocation;
  weather: WeatherConditions;
};
