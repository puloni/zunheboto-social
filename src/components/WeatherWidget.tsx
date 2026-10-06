import React, { useEffect, useState } from 'react';
import { useCms } from '../context/CmsContext';
import {
  CloudSun,
  Wind,
  Droplets,
  ArrowUp,
  ArrowDown,
  Activity,
  Sparkles,
  RefreshCw,
  Sun,
  Cloud,
  CloudRain,
  CloudLightning,
  CloudSnow,
  CloudFog,
  AlertCircle
} from 'lucide-react';
import { HomepageSectionConfig, WeatherData } from '../types';

interface WeatherWidgetProps {
  config?: HomepageSectionConfig;
}

// Map condition text to appropriate Lucide icon
function getWeatherIcon(conditionText?: string, className = 'w-9 h-9 text-amber-600') {
  if (!conditionText) return <CloudSun className={className} />;
  const c = conditionText.toLowerCase();

  if (c.includes('thunder') || c.includes('lightning')) {
    return <CloudLightning className={className.replace('text-amber-600', 'text-amber-500')} />;
  }
  if (c.includes('snow') || c.includes('ice') || c.includes('hail')) {
    return <CloudSnow className={className.replace('text-amber-600', 'text-sky-400')} />;
  }
  if (c.includes('rain') || c.includes('drizzle') || c.includes('shower')) {
    return <CloudRain className={className.replace('text-amber-600', 'text-blue-500')} />;
  }
  if (c.includes('fog') || c.includes('mist') || c.includes('haze')) {
    return <CloudFog className={className.replace('text-amber-600', 'text-slate-400')} />;
  }
  if (c.includes('clear') || c.includes('sunny')) {
    return <Sun className={className.replace('text-amber-600', 'text-amber-500')} />;
  }
  if (c.includes('overcast') || c.includes('cloudy')) {
    return <Cloud className={className.replace('text-amber-600', 'text-slate-500')} />;
  }
  return <CloudSun className={className} />;
}

export const WeatherWidget: React.FC<WeatherWidgetProps> = ({ config }) => {
  const { settings, weather: contextWeather, refreshWeather } = useCms();
  const [weatherData, setWeatherData] = useState<WeatherData | null>(contextWeather);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);

  const fetchLiveWeather = async (force = false) => {
    try {
      setLoading(true);
      setErrorMsg(null);
      const url = force ? '/api/weather?refresh=1' : '/api/weather';
      const res = await fetch(url);
      const json = await res.json();

      if (!res.ok || json.available === false) {
        setWeatherData(json.available === false ? json : null);
        setErrorMsg(json.error || 'Weather data currently unavailable.');
      } else if (json && json.temperature_c !== undefined) {
        setWeatherData(json);
        if (json.updated_at) {
          const d = new Date(json.updated_at);
          setLastUpdated(isNaN(d.getTime()) ? json.updated_at : d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
        }
      }
    } catch {
      // STRICT REQUIREMENT: NEVER fall back to fake or hardcoded numbers!
      setErrorMsg('Weather data currently unavailable.');
      setWeatherData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (contextWeather && contextWeather.available !== false && contextWeather.temperature_c !== undefined) {
      setWeatherData(contextWeather);
      if (contextWeather.updated_at) {
        const d = new Date(contextWeather.updated_at);
        setLastUpdated(isNaN(d.getTime()) ? contextWeather.updated_at : d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
      }
    } else {
      fetchLiveWeather();
    }
  }, [contextWeather]);

  const displayLocation = settings.weather_location_name || config?.weather_location || 'Zunheboto, Nagaland';
  const isFahrenheit = (config?.weather_unit || settings.weather_unit) === 'fahrenheit';
  const toF = (c: number) => Math.round((c * 9) / 5 + 32);

  const formatTemp = (c: number) => (isFahrenheit ? `${toF(c)}°F` : `${c}°C`);
  const rawTemp = (c: number) => (isFahrenheit ? toF(c) : c);

  const showForecast = config?.weather_show_forecast !== false;
  const showHumidity = config?.weather_show_humidity !== false;
  const showWind = config?.weather_show_wind !== false;
  const showAqi = config?.weather_show_air_quality !== false;
  const showPrecip = config?.weather_show_precipitation !== false;

  const forecastDays = config?.weather_days || 4;
  const isDataAvailable = Boolean(weatherData && weatherData.available !== false && weatherData.temperature_c !== undefined);
  const displayedForecast = isDataAvailable ? (weatherData?.forecast || []).slice(0, forecastDays) : [];

  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
      {/* Header bar */}
      <div className="bg-[#0B192C] text-white px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <CloudSun className="w-5 h-5 text-amber-400 shrink-0" />
          <div>
            <h3 className="text-base font-serif font-bold tracking-wide">
              {config?.custom_title || config?.title || 'Zunheboto High-Altitude Weather Desk'}
            </h3>
            {config?.subtitle && (
              <p className="text-[11px] text-slate-400">{config.subtitle}</p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <span className="text-xs bg-slate-800 text-amber-300 px-3 py-1 rounded-full font-medium border border-slate-700">
            {displayLocation}
          </span>
          <button
            type="button"
            onClick={() => fetchLiveWeather(true)}
            disabled={loading}
            className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg transition-colors cursor-pointer disabled:opacity-50"
            title="Refresh real-time weather observations"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-amber-400' : ''}`} />
          </button>
        </div>
      </div>

      {/* Body */}
      {loading && !weatherData ? (
        // Loading State: Clean layout skeleton preserving dimensions
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center animate-pulse">
            <div className="md:col-span-4 flex items-center gap-5 md:border-r border-slate-200 md:pr-6">
              <div className="w-16 h-16 rounded-2xl bg-slate-100 shrink-0" />
              <div className="space-y-2 flex-1">
                <div className="h-8 bg-slate-100 rounded-lg w-24" />
                <div className="h-4 bg-slate-100 rounded w-32" />
                <div className="h-3 bg-slate-100 rounded w-28" />
              </div>
            </div>
            <div className="md:col-span-4 grid grid-cols-2 gap-3 md:border-r border-slate-200 md:pr-6">
              {[1, 2, 3, 4].map((n) => (
                <div key={n} className="bg-slate-50 p-3 rounded-xl border border-slate-100 h-16" />
              ))}
            </div>
            <div className="md:col-span-4 space-y-2">
              <div className="h-3 bg-slate-100 rounded w-28" />
              <div className="grid grid-cols-4 gap-2">
                {[1, 2, 3, 4].map((n) => (
                  <div key={n} className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 h-20" />
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : !isDataAvailable ? (
        // STRICT REQUIREMENT: If real weather cannot be retrieved, show "Weather data currently unavailable."
        <div className="p-8 text-center space-y-3">
          <div className="w-12 h-12 mx-auto rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700">
            <AlertCircle className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-900">
              Weather data currently unavailable.
            </h4>
            <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
              {errorMsg || 'Genuine meteorological observations could not be retrieved from the station.'}
            </p>
          </div>
          <button
            type="button"
            onClick={() => fetchLiveWeather(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#0B192C] hover:bg-slate-800 text-white rounded-xl text-xs font-semibold transition-colors cursor-pointer shadow-2xs"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Retry Connection</span>
          </button>
        </div>
      ) : (
        // Real-Time Genuine Weather Display (Preserving 100% of the UI design)
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
            {/* Main Temp Hero */}
            <div className="md:col-span-4 flex items-center gap-5 md:border-r border-slate-200 md:pr-6">
              <div className="w-16 h-16 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center shrink-0">
                {getWeatherIcon(weatherData?.condition)}
              </div>
              <div>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-extrabold text-[#0B192C]">
                    {rawTemp(weatherData?.temperature_c ?? 0)}°
                  </span>
                  <span className="text-lg text-slate-500 font-semibold">
                    {isFahrenheit ? 'F' : 'C'}
                  </span>
                </div>
                <p className="text-sm font-semibold text-slate-800 mt-0.5">
                  {weatherData?.condition}
                </p>
                <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                  <span className="flex items-center text-rose-600 font-medium">
                    <ArrowUp className="w-3 h-3 mr-0.5" /> High: {formatTemp(weatherData?.high_c ?? 0)}
                  </span>
                  <span className="flex items-center text-blue-600 font-medium">
                    <ArrowDown className="w-3 h-3 mr-0.5" /> Low: {formatTemp(weatherData?.low_c ?? 0)}
                  </span>
                </div>
              </div>
            </div>

            {/* Meteorological Metrics */}
            <div className={`grid grid-cols-2 gap-3 ${showForecast ? 'md:col-span-4 md:border-r border-slate-200 md:pr-6' : 'md:col-span-8'}`}>
              {showHumidity && (
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-1">
                    <Droplets className="w-3.5 h-3.5 text-blue-500" />
                    <span>Humidity</span>
                  </div>
                  <div className="text-base font-bold text-slate-800">{weatherData?.humidity}%</div>
                </div>
              )}
              {showWind && (
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-1">
                    <Wind className="w-3.5 h-3.5 text-teal-500" />
                    <span>Wind Speed</span>
                  </div>
                  <div className="text-base font-bold text-slate-800">{weatherData?.wind_kmh} km/h</div>
                </div>
              )}
              {showAqi && (
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-1">
                    <Activity className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Air Quality</span>
                  </div>
                  <div className="text-xs font-bold text-emerald-700 truncate" title={weatherData?.air_quality}>
                    {weatherData?.air_quality || 'Good'}
                  </div>
                </div>
              )}
              {showPrecip && (
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-1">
                    <Sparkles className="w-3.5 h-3.5 text-purple-500" />
                    <span>Rain Chance</span>
                  </div>
                  <div className="text-base font-bold text-slate-800">{weatherData?.precipitation_chance}%</div>
                </div>
              )}
            </div>

            {/* Forecast Days */}
            {showForecast && (
              <div className="md:col-span-4 space-y-2">
                <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                  <span>{forecastDays}-Day Mountain Outlook</span>
                  {lastUpdated && (
                    <span className="text-[10px] text-slate-400 lowercase font-normal">
                      sync {lastUpdated}
                    </span>
                  )}
                </div>
                <div className={`grid grid-cols-${displayedForecast.length > 4 ? '5' : Math.max(displayedForecast.length, 1)} gap-2 text-center`}>
                  {displayedForecast.map((f, idx) => (
                    <div
                      key={idx}
                      className="bg-slate-50/90 p-2.5 rounded-xl border border-slate-100 flex flex-col items-center justify-center"
                    >
                      <span className="text-[11px] font-bold text-slate-700">{f.day}</span>
                      <div className="my-1.5">
                        {getWeatherIcon(f.condition, 'w-4 h-4 text-amber-500')}
                      </div>
                      <span className="text-xs font-extrabold text-[#0B192C]">
                        {rawTemp(f.high_c)}°
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {rawTemp(f.low_c)}°
                      </span>
                      {f.rain_chance !== undefined && f.rain_chance > 0 && (
                        <span className="text-[9px] font-semibold text-blue-600 mt-0.5">
                          {f.rain_chance}% rain
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Source Attribution footer */}
          {weatherData?.source && (
            <div className="text-[11px] text-slate-400 text-right mt-3 border-t border-slate-100 pt-2 flex items-center justify-between">
              <span className="text-slate-500 font-medium">
                Station Telemetry: {displayLocation}
              </span>
              <span>{weatherData.source}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
