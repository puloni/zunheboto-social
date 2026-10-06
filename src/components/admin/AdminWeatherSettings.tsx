import React, { useState, useEffect } from 'react';
import { useCms } from '../../context/CmsContext';
import {
  CloudSun,
  Search,
  Key,
  MapPin,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  ExternalLink,
  Save,
  Radio,
  Eye,
  EyeOff,
  Navigation
} from 'lucide-react';
import { WeatherProviderType } from '../../../server/weatherService';

export const AdminWeatherSettings: React.FC = () => {
  const { settings, updateSettings, refreshWeather } = useCms();

  // Configuration state
  const [provider, setProvider] = useState<WeatherProviderType>(
    (settings.weather_provider as WeatherProviderType) || 'open-meteo'
  );
  const [locationName, setLocationName] = useState(
    settings.weather_location_name || 'Zunheboto, Nagaland'
  );
  const [latitude, setLatitude] = useState<number>(
    settings.weather_latitude !== undefined ? Number(settings.weather_latitude) : 25.9667
  );
  const [longitude, setLongitude] = useState<number>(
    settings.weather_longitude !== undefined ? Number(settings.weather_longitude) : 94.5167
  );
  const [locationKey, setLocationKey] = useState(settings.weather_location_key || '');
  const [apiKey, setApiKey] = useState('');
  const [showApiKey, setShowApiKey] = useState(false);
  const [apiKeyConfigured, setApiKeyConfigured] = useState(!!settings.weather_api_key_configured);
  const [unit, setUnit] = useState<'celsius' | 'fahrenheit'>(settings.weather_unit || 'celsius');

  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searchError, setSearchError] = useState<string | null>(null);

  // Test state
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<any | null>(null);
  const [testError, setTestError] = useState<string | null>(null);

  // Save state
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    if (settings.weather_provider) setProvider(settings.weather_provider as WeatherProviderType);
    if (settings.weather_location_name) setLocationName(settings.weather_location_name);
    if (settings.weather_latitude !== undefined) setLatitude(Number(settings.weather_latitude));
    if (settings.weather_longitude !== undefined) setLongitude(Number(settings.weather_longitude));
    if (settings.weather_location_key !== undefined) setLocationKey(settings.weather_location_key);
    if (settings.weather_api_key_configured !== undefined) setApiKeyConfigured(!!settings.weather_api_key_configured);
    if (settings.weather_unit) setUnit(settings.weather_unit);
  }, [settings]);

  // Execute location search via backend
  const handleSearchLocation = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const query = searchQuery.trim();
    if (!query || query.length < 2) {
      setSearchError('Please enter at least 2 characters to search.');
      return;
    }

    setIsSearching(true);
    setSearchError(null);
    setSearchResults([]);

    try {
      const params = new URLSearchParams({
        query,
        provider,
        ...(apiKey ? { apiKey } : {})
      });
      const res = await fetch(`/api/weather/search-location?${params.toString()}`);
      const json = await res.json();

      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Failed to search locations');
      }

      if (!json.locations || json.locations.length === 0) {
        setSearchError(`No locations found matching "${query}". Try adding a state or country name.`);
      } else {
        setSearchResults(json.locations);
      }
    } catch (err: any) {
      setSearchError(err.message || 'Error searching locations');
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelectLocation = (loc: any) => {
    setLocationName(loc.label || loc.name);
    if (loc.latitude) setLatitude(Number(loc.latitude));
    if (loc.longitude) setLongitude(Number(loc.longitude));
    if (loc.location_key) setLocationKey(loc.location_key);
    setSearchResults([]);
    setSearchQuery('');
  };

  // Test live weather retrieval
  const handleTestConnection = async () => {
    setIsTesting(true);
    setTestResult(null);
    setTestError(null);

    try {
      const res = await fetch('/api/admin/weather/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider,
          locationName,
          latitude,
          longitude,
          locationKey,
          apiKey
        })
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Connection test failed. Provider could not deliver real weather data.');
      }

      setTestResult(json.weather);
    } catch (err: any) {
      setTestError(err.message || 'Weather test failed');
    } finally {
      setIsTesting(false);
    }
  };

  // Save changes to backend
  const handleSaveSettings = async () => {
    setIsSaving(true);
    setSaveSuccess(false);
    setSaveError(null);

    try {
      const payload: any = {
        weather_provider: provider,
        weather_location_name: locationName,
        weather_latitude: latitude,
        weather_longitude: longitude,
        weather_location_key: locationKey,
        weather_unit: unit
      };

      if (apiKey.trim()) {
        payload.weather_api_key = apiKey.trim();
      }

      const res = await fetch('/api/admin/weather/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Failed to save weather settings');
      }

      // Update CMS context settings
      await updateSettings(json.settings);
      setApiKeyConfigured(!!json.settings.weather_api_key_configured);
      setApiKey(''); // Clear raw key from state for security
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 4000);

      // Trigger immediate live refresh on the frontend
      if (refreshWeather) {
        await refreshWeather(true);
      }
    } catch (err: any) {
      setSaveError(err.message || 'Failed to save settings');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 shrink-0">
              <CloudSun className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900 font-serif">
                Weather Desk &amp; Location Control
              </h2>
              <p className="text-sm text-slate-600 mt-0.5">
                Configure legitimate real-time meteorological data, choose your weather provider, and search/select the publication's station location.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleSaveSettings}
            disabled={isSaving}
            className="hidden sm:inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#0B192C] hover:bg-slate-800 text-white font-bold text-xs transition-colors shadow-2xs cursor-pointer disabled:opacity-50"
          >
            {isSaving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            <span>Save Weather Settings</span>
          </button>
        </div>

        {saveSuccess && (
          <div className="mt-4 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Weather settings and location saved successfully! Live weather data updated.</span>
          </div>
        )}

        {saveError && (
          <div className="mt-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs font-semibold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{saveError}</span>
          </div>
        )}
      </div>

      {/* 1. Provider Selection */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div>
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Radio className="w-4 h-4 text-amber-600" />
            <span>1. Weather Data Provider</span>
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Choose a verified, legitimate meteorological API. All weather numbers displayed on the portal come strictly from this provider.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          {/* Open-Meteo */}
          <div
            onClick={() => setProvider('open-meteo')}
            className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
              provider === 'open-meteo'
                ? 'border-[#0B192C] bg-slate-50 ring-1 ring-[#0B192C]'
                : 'border-slate-200 hover:border-slate-300 bg-white'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="font-bold text-sm text-slate-900">Open-Meteo</span>
              <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                Universal &amp; Free
              </span>
            </div>
            <p className="text-xs text-slate-600 mt-2">
              National meteorological model &amp; Copernicus satellite data. Accurate high-altitude telemetry, air quality (AQI), and 7-day genuine forecasts with zero API key required.
            </p>
          </div>

          {/* AccuWeather */}
          <div
            onClick={() => setProvider('accuweather')}
            className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
              provider === 'accuweather'
                ? 'border-[#0B192C] bg-slate-50 ring-1 ring-[#0B192C]'
                : 'border-slate-200 hover:border-slate-300 bg-white'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="font-bold text-sm text-slate-900">AccuWeather</span>
              <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
                API Key Required
              </span>
            </div>
            <p className="text-xs text-slate-600 mt-2">
              Enterprise meteorological network. Delivers localized MinuteCast®, current conditions, and 5-day daily forecasts via AccuWeather Core API.
            </p>
          </div>

          {/* OpenWeatherMap */}
          <div
            onClick={() => setProvider('openweathermap')}
            className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
              provider === 'openweathermap'
                ? 'border-[#0B192C] bg-slate-50 ring-1 ring-[#0B192C]'
                : 'border-slate-200 hover:border-slate-300 bg-white'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="font-bold text-sm text-slate-900">OpenWeatherMap</span>
              <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800">
                API Key Required
              </span>
            </div>
            <p className="text-xs text-slate-600 mt-2">
              Global weather data covering 200,000+ cities. Provides real-time conditions, 5-day / 3-hour forecasts, and air pollution indices.
            </p>
          </div>
        </div>

        {/* API Key Management (Server-Side Protected) */}
        {(provider === 'accuweather' || provider === 'openweathermap') && (
          <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200 space-y-3 mt-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <Key className="w-3.5 h-3.5 text-amber-700" />
                <span>{provider === 'accuweather' ? 'AccuWeather Developer API Key' : 'OpenWeatherMap API Key'}</span>
              </label>
              {apiKeyConfigured && (
                <span className="text-[11px] font-semibold text-emerald-700 flex items-center gap-1 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                  <CheckCircle2 className="w-3 h-3" />
                  API Key configured on server
                </span>
              )}
            </div>

            <div className="relative">
              <input
                type={showApiKey ? 'text' : 'password'}
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder={apiKeyConfigured ? '•••••••••••••••••••••••• (Leave blank to keep existing key)' : 'Enter your developer API key'}
                className="w-full px-3.5 py-2.5 pr-10 rounded-xl border border-slate-300 bg-white text-xs font-mono focus:outline-none focus:border-amber-600"
              />
              <button
                type="button"
                onClick={() => setShowApiKey(!showApiKey)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            <div className="flex flex-wrap items-center justify-between text-[11px] text-slate-500 gap-2">
              <span>
                {provider === 'accuweather' ? (
                  <a
                    href="https://developer.accuweather.com/"
                    target="_blank"
                    rel="noreferrer"
                    className="text-amber-700 underline flex items-center gap-1 font-semibold"
                  >
                    Get a free AccuWeather developer key <ExternalLink className="w-3 h-3" />
                  </a>
                ) : (
                  <a
                    href="https://openweathermap.org/api"
                    target="_blank"
                    rel="noreferrer"
                    className="text-indigo-700 underline flex items-center gap-1 font-semibold"
                  >
                    Get an OpenWeatherMap API key <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </span>
              <span className="text-slate-500 italic">
                Handled securely server-side. Never exposed to browser or client code.
              </span>
            </div>
          </div>
        )}
      </div>

      {/* 2. Admin-Controlled Location Search */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-5">
        <div>
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <MapPin className="w-4 h-4 text-rose-600" />
            <span>2. Station Location Search &amp; Coordinates</span>
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Search for any city, district, or town. The selected location controls all weather information and forecasts across the portal.
          </p>
        </div>

        {/* Location Search Input */}
        <form onSubmit={handleSearchLocation} className="space-y-3">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search location (e.g. Zunheboto, Kohima, Mokokchung, Dimapur, New Delhi...)"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 bg-white text-xs font-semibold focus:outline-none focus:border-[#0B192C]"
              />
            </div>
            <button
              type="submit"
              disabled={isSearching}
              className="px-5 py-2.5 rounded-xl bg-[#0B192C] hover:bg-slate-800 text-white font-bold text-xs transition-colors cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
            >
              {isSearching ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Search className="w-3.5 h-3.5" />}
              <span>Search Location</span>
            </button>
          </div>

          {searchError && (
            <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium">
              {searchError}
            </div>
          )}

          {/* Search Results Dropdown/List */}
          {searchResults.length > 0 && (
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                Matched Locations ({searchResults.length}) — Click to select:
              </span>
              <div className="space-y-1.5 max-h-48 overflow-y-auto">
                {searchResults.map((loc, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSelectLocation(loc)}
                    className="w-full text-left px-3 py-2 rounded-lg bg-white border border-slate-200 hover:border-[#0B192C] hover:bg-slate-100/80 transition-colors flex items-center justify-between group cursor-pointer"
                  >
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 group-hover:text-rose-600 shrink-0" />
                      <span className="text-xs font-bold text-slate-800">{loc.label || loc.name}</span>
                    </div>
                    <span className="text-[10px] text-slate-500 font-mono">
                      {loc.latitude ? `${Number(loc.latitude).toFixed(4)}°N, ${Number(loc.longitude).toFixed(4)}°E` : ''}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </form>

        {/* Current Active Location Info */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
          <div className="sm:col-span-3">
            <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1.5">
              Active Station Location Name
            </label>
            <input
              type="text"
              value={locationName}
              onChange={(e) => setLocationName(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-xs font-bold text-slate-900 focus:outline-none focus:border-[#0B192C]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1.5">
              Latitude (°N)
            </label>
            <input
              type="number"
              step="any"
              value={latitude}
              onChange={(e) => setLatitude(parseFloat(e.target.value) || 0)}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-300 bg-white text-xs font-mono font-semibold focus:outline-none focus:border-[#0B192C]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1.5">
              Longitude (°E)
            </label>
            <input
              type="number"
              step="any"
              value={longitude}
              onChange={(e) => setLongitude(parseFloat(e.target.value) || 0)}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-300 bg-white text-xs font-mono font-semibold focus:outline-none focus:border-[#0B192C]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1.5">
              Temperature Unit
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setUnit('celsius')}
                className={`py-2 rounded-xl border text-xs font-bold transition-colors cursor-pointer ${
                  unit === 'celsius'
                    ? 'bg-[#0B192C] text-white border-[#0B192C]'
                    : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                }`}
              >
                Celsius (°C)
              </button>
              <button
                type="button"
                onClick={() => setUnit('fahrenheit')}
                className={`py-2 rounded-xl border text-xs font-bold transition-colors cursor-pointer ${
                  unit === 'fahrenheit'
                    ? 'bg-[#0B192C] text-white border-[#0B192C]'
                    : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                }`}
              >
                Fahrenheit (°F)
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Live Connection Test & Telemetry Preview */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Navigation className="w-4 h-4 text-emerald-600" />
              <span>3. Live Connection Test</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Verify that the configured provider responds with genuine real-time meteorological observations for this exact location.
            </p>
          </div>
          <button
            type="button"
            onClick={handleTestConnection}
            disabled={isTesting}
            className="px-4 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs transition-colors flex items-center gap-2 cursor-pointer disabled:opacity-50 self-start sm:self-auto"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isTesting ? 'animate-spin' : ''}`} />
            <span>{isTesting ? 'Verifying Station...' : 'Test Weather Connection'}</span>
          </button>
        </div>

        {testError && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-900 text-xs flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Provider Connection Test Failed</p>
              <p className="text-[11px] text-rose-700 mt-0.5">{testError}</p>
            </div>
          </div>
        )}

        {testResult && testResult.available && (
          <div className="p-4 bg-emerald-50/60 border border-emerald-200 rounded-xl space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-emerald-900 font-bold text-xs">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Verified Real-time Meteorological Observation</span>
              </div>
              <span className="text-[11px] text-slate-600 font-medium">
                Source: <strong>{testResult.source || testResult.provider_name}</strong>
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs pt-1">
              <div className="bg-white p-3 rounded-lg border border-emerald-100 shadow-2xs">
                <span className="text-slate-400 text-[10px] uppercase font-bold">Current Temp</span>
                <p className="text-lg font-extrabold text-[#0B192C]">
                  {unit === 'fahrenheit' ? Math.round((testResult.temperature_c * 9) / 5 + 32) : testResult.temperature_c}°{unit === 'fahrenheit' ? 'F' : 'C'}
                </p>
                <span className="text-slate-600 font-semibold">{testResult.condition}</span>
              </div>

              <div className="bg-white p-3 rounded-lg border border-emerald-100 shadow-2xs">
                <span className="text-slate-400 text-[10px] uppercase font-bold">High / Low</span>
                <p className="text-sm font-bold text-slate-800 mt-1">
                  High: {testResult.high_c}°C • Low: {testResult.low_c}°C
                </p>
                <span className="text-[11px] text-slate-500">Rain chance: {testResult.precipitation_chance}%</span>
              </div>

              <div className="bg-white p-3 rounded-lg border border-emerald-100 shadow-2xs">
                <span className="text-slate-400 text-[10px] uppercase font-bold">Atmosphere</span>
                <p className="text-sm font-bold text-slate-800 mt-1">
                  Humidity: {testResult.humidity}%
                </p>
                <span className="text-[11px] text-slate-500">Wind: {testResult.wind_kmh} km/h</span>
              </div>

              <div className="bg-white p-3 rounded-lg border border-emerald-100 shadow-2xs">
                <span className="text-slate-400 text-[10px] uppercase font-bold">Air Quality</span>
                <p className="text-xs font-bold text-emerald-700 mt-1 truncate">
                  {testResult.air_quality || 'Good'}
                </p>
                <span className="text-[10px] text-slate-400">Sync: {new Date(testResult.updated_at).toLocaleTimeString()}</span>
              </div>
            </div>

            {testResult.forecast && testResult.forecast.length > 0 && (
              <div className="pt-2 border-t border-emerald-100">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  {testResult.forecast.length}-Day Genuine Forecast:
                </span>
                <div className="grid grid-cols-4 sm:grid-cols-7 gap-2 mt-1.5 text-center">
                  {testResult.forecast.slice(0, 7).map((f: any, i: number) => (
                    <div key={i} className="bg-white p-2 rounded-lg border border-emerald-100 text-[11px]">
                      <span className="font-bold text-slate-700 block">{f.day}</span>
                      <span className="font-extrabold text-[#0B192C]">{f.high_c}°</span>
                      <span className="text-slate-400 text-[10px] block">{f.low_c}°</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        <div className="flex justify-end pt-2">
          <button
            type="button"
            onClick={handleSaveSettings}
            disabled={isSaving}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-[#0B192C] hover:bg-slate-800 text-white font-bold text-xs transition-colors shadow-2xs cursor-pointer disabled:opacity-50"
          >
            {isSaving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            <span>Save &amp; Apply All Weather Settings</span>
          </button>
        </div>
      </div>
    </div>
  );
};
