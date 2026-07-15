
import { useEffect, useState } from "react";
import useAuth from "../hooks/useAuth";

const DISTRICT_COORDS: Record<string, { lat: number; lon: number }> = {
  Ampara:           { lat: 7.2972,  lon: 81.6747 },
  Anuradhapura:     { lat: 8.3114,  lon: 80.4037 },
  Badulla:          { lat: 6.9934,  lon: 81.0550 },
  Batticaloa:       { lat: 7.7170,  lon: 81.7000 },
  Colombo:          { lat: 6.9271,  lon: 79.8612 },
  Galle:            { lat: 6.0535,  lon: 80.2210 },
  Gampaha:          { lat: 7.0873,  lon: 80.0144 },
  Hambantota:       { lat: 6.1241,  lon: 81.1185 },
  Jaffna:           { lat: 9.6615,  lon: 80.0255 },
  Kalutara:         { lat: 6.5854,  lon: 79.9607 },
  Kandy:            { lat: 7.2906,  lon: 80.6337 },
  Kegalle:          { lat: 7.2513,  lon: 80.3464 },
  Kilinochchi:      { lat: 9.3803,  lon: 80.3770 },
  Kurunegala:       { lat: 7.4818,  lon: 80.3609 },
  Mannar:           { lat: 8.9810,  lon: 79.9044 },
  Matale:           { lat: 7.4675,  lon: 80.6234 },
  Matara:           { lat: 5.9549,  lon: 80.5550 },
  Monaragala:       { lat: 6.8728,  lon: 81.3507 },
  Mullaitivu:       { lat: 9.2671,  lon: 80.8128 },
  "Nuwara Eliya":   { lat: 6.9497,  lon: 80.7891 },
  Polonnaruwa:      { lat: 7.9403,  lon: 81.0188 },
  Puttalam:         { lat: 8.0362,  lon: 79.8283 },
  Ratnapura:        { lat: 6.6828,  lon: 80.4003 },
  Trincomalee:      { lat: 8.5874,  lon: 81.2152 },
  Vavuniya:         { lat: 8.7514,  lon: 80.4971 },
};

const getWeatherInfo = (code: number, isDay: number) => {
  if (code === 0)    return { icon: isDay ? "☀️" : "🌙", label: "Clear sky" };
  if (code <= 2)     return { icon: "⛅", label: "Partly cloudy" };
  if (code === 3)    return { icon: "☁️", label: "Overcast" };
  if (code <= 48)    return { icon: "🌫️", label: "Foggy" };
  if (code <= 57)    return { icon: "🌦️", label: "Drizzle" };
  if (code <= 67)    return { icon: "🌧️", label: "Rain" };
  if (code <= 77)    return { icon: "❄️", label: "Snow" };
  if (code <= 82)    return { icon: "🌧️", label: "Showers" };
  if (code <= 99)    return { icon: "⛈️", label: "Thunderstorm" };
  return { icon: "🌤️", label: "Unknown" };
};

interface WeatherData {
  temp:        number;
  humidity:    number;
  rain:        number;
  windSpeed:   number;
  weatherCode: number;
  isDay:       number;
}

const WeatherWidget = () => {
 
  const { farmer } = useAuth();

  const [weather, setWeather]     = useState<WeatherData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError]         = useState("");

  
  const district = farmer?.district || "Colombo";
  const coords   = DISTRICT_COORDS[district] ?? DISTRICT_COORDS["Colombo"];

  useEffect(() => {
    const fetchWeather = async () => {
      setIsLoading(true);
      setError("");
      try {
        const url =
          `https://api.open-meteo.com/v1/forecast` +
          `?latitude=${coords.lat}` +
          `&longitude=${coords.lon}` +
          `&current=temperature_2m,relative_humidity_2m,rain,weather_code,wind_speed_10m,is_day` +
          `&timezone=Asia%2FColombo`;

        const res  = await fetch(url);
        const data = await res.json();
        const c    = data.current;

        setWeather({
          temp:        c.temperature_2m,
          humidity:    c.relative_humidity_2m,
          rain:        c.rain,
          windSpeed:   c.wind_speed_10m,
          weatherCode: c.weather_code,
          isDay:       c.is_day,
        });
      } catch {
        setError("Could not load weather data");
      } finally {
        setIsLoading(false);
      }
    };

    fetchWeather();
  }, [coords.lat, coords.lon]); // refetches if district changes

  
  if (isLoading) return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 animate-pulse">
      <div className="h-3 bg-gray-100 rounded w-1/3 mb-3" />
      <div className="h-8 bg-gray-100 rounded w-1/4 mb-3" />
      <div className="grid grid-cols-3 gap-2">
        <div className="h-12 bg-gray-100 rounded-xl" />
        <div className="h-12 bg-gray-100 rounded-xl" />
        <div className="h-12 bg-gray-100 rounded-xl" />
      </div>
    </div>
  );

  // ── error ──
  if (error) return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
      <p className="text-xs text-red-400">{error}</p>
    </div>
  );

  if (!weather) return null;

  const { icon, label } = getWeatherInfo(weather.weatherCode, weather.isDay);

  return (
    <div className="bg-gradient-to-br from-sky-50 to-blue-50 rounded-2xl border border-sky-100 shadow-sm p-4">

      {/* header */}
      <div className="flex items-center justify-between mb-3">
        <div>
          <p className="text-xs text-sky-500 uppercase tracking-wide font-medium">
            Current Weather
          </p>
          <p className="text-xs text-gray-400 mt-0.5">
            📍 {district} District
          </p>
        </div>
        <span className="text-4xl">{icon}</span>
      </div>

      {/* main temperature */}
      <div className="flex items-end gap-2 mb-4">
        <p className="text-4xl font-bold text-gray-800">
          {Math.round(weather.temp)}°
          <span className="text-lg font-normal text-gray-400">C</span>
        </p>
        <p className="text-sm text-gray-500 mb-1">{label}</p>
      </div>

      {/* detail cards */}
      <div className="grid grid-cols-3 gap-2">
        <div className="bg-white/70 rounded-xl p-2.5 text-center">
          <p className="text-xs text-gray-400 mb-1">💧 Humidity</p>
          <p className="text-sm font-semibold text-gray-700">{weather.humidity}%</p>
        </div>
        <div className="bg-white/70 rounded-xl p-2.5 text-center">
          <p className="text-xs text-gray-400 mb-1">🌧️ Rain</p>
          <p className="text-sm font-semibold text-gray-700">{weather.rain} mm</p>
        </div>
        <div className="bg-white/70 rounded-xl p-2.5 text-center">
          <p className="text-xs text-gray-400 mb-1">💨 Wind</p>
          <p className="text-sm font-semibold text-gray-700">
            {Math.round(weather.windSpeed)} km/h
          </p>
        </div>
      </div>

      {/* no district warning */}
      {!farmer?.district && (
        <p className="text-xs text-amber-500 mt-3">
          Showing Colombo weather. <a href="/profile" className="underline">Set your district</a> for local weather.
        </p>
      )}

      {/* attribution — required by Open-Meteo CC BY 4.0 */}
      <p className="text-xs text-gray-300 mt-2 text-right">Open-Meteo</p>
    </div>
  );
};

export default WeatherWidget;