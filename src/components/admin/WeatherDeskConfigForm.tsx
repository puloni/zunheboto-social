import React from 'react';
import { HomepageSectionConfig } from '../../types';
import { CloudSun, Settings, ExternalLink } from 'lucide-react';
import { useCms } from '../../context/CmsContext';

interface Props {
  section: HomepageSectionConfig;
  onUpdate: (data: Partial<HomepageSectionConfig>) => void;
}

export const WeatherDeskConfigForm: React.FC<Props> = ({
  section,
  onUpdate
}) => {
  const { settings, navigateTo } = useCms();

  const activeLocation = settings.weather_location_name || section.weather_location || 'Zunheboto, Nagaland';
  const providerLabel =
    settings.weather_provider === 'accuweather'
      ? 'AccuWeather Real-Time API'
      : settings.weather_provider === 'openweathermap'
      ? 'OpenWeatherMap API'
      : 'Open-Meteo Global (WMO / Copernicus)';

  return (
    <div className="space-y-6 bg-slate-50/70 p-6 rounded-2xl border border-slate-200 text-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 bg-sky-50 border border-sky-200 rounded-xl text-sky-900 font-medium">
        <div className="flex items-center gap-2.5">
          <CloudSun className="w-5 h-5 text-sky-600 shrink-0" />
          <div>
            <div className="font-bold text-slate-900">
              Station Provider: <span className="text-sky-700">{providerLabel}</span>
            </div>
            <div className="text-[11px] text-slate-600">
              Active Station: <strong>{activeLocation}</strong>
              {settings.weather_latitude ? ` • ${settings.weather_latitude}°N, ${settings.weather_longitude}°E` : ''}
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={() => navigateTo('/admin/settings')}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-sky-300 text-sky-800 hover:bg-sky-100 font-bold text-[11px] transition-colors cursor-pointer self-start sm:self-auto shrink-0 shadow-2xs"
        >
          <Settings className="w-3.5 h-3.5" />
          <span>Manage Provider &amp; API Keys</span>
          <ExternalLink className="w-3 h-3 text-sky-600" />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left Column: Location & Forecast Config */}
        <div className="space-y-4">
          <div>
            <label className="block font-bold text-slate-800 uppercase tracking-wider mb-1.5">
              Homepage Station Display Title
            </label>
            <input
              type="text"
              value={section.weather_location || activeLocation}
              onChange={(e) => onUpdate({ weather_location: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-xs font-semibold focus:outline-none focus:border-sky-600"
            />
            <p className="text-[11px] text-slate-500 mt-1">
              Controls the badge label shown in the homepage header bar.
            </p>
          </div>

          <div>
            <label className="block font-bold text-slate-800 uppercase tracking-wider mb-1.5">
              Forecast Days Outlook
            </label>
            <div className="grid grid-cols-4 gap-2">
              {[3, 4, 5, 7].map((days) => (
                <button
                  key={days}
                  type="button"
                  onClick={() => onUpdate({ weather_days: days })}
                  className={`py-2 rounded-lg border font-bold text-center cursor-pointer transition-colors ${
                    (section.weather_days || 4) === days
                      ? 'bg-[#0B192C] text-white border-[#0B192C]'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {days} Days
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-800 uppercase tracking-wider mb-1.5">
              Temperature Unit
            </label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: 'celsius', label: 'Celsius (°C)' },
                { id: 'fahrenheit', label: 'Fahrenheit (°F)' }
              ].map((u) => (
                <button
                  key={u.id}
                  type="button"
                  onClick={() => onUpdate({ weather_unit: u.id as any })}
                  className={`py-2 rounded-lg border font-bold text-center cursor-pointer transition-colors ${
                    (section.weather_unit || 'celsius') === u.id
                      ? 'bg-[#0B192C] text-white border-[#0B192C]'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {u.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-800 uppercase tracking-wider mb-1.5">
              Container Background
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'default', label: 'Clean White' },
                { id: 'slate', label: 'Soft Slate' },
                { id: 'dark', label: 'Deep Navy' }
              ].map((b) => (
                <button
                  key={b.id}
                  type="button"
                  onClick={() => onUpdate({ background_style: b.id as any })}
                  className={`px-3 py-2 rounded-lg border text-center font-bold cursor-pointer transition-colors ${
                    (section.background_style || 'default') === b.id
                      ? 'bg-[#0B192C] text-white border-[#0B192C]'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {b.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Meteorological Metrics */}
        <div className="space-y-4">
          <div>
            <label className="block font-bold text-slate-800 uppercase tracking-wider mb-2">
              Display Metrics &amp; Telemetry
            </label>
            <div className="space-y-2 bg-white p-3.5 rounded-xl border border-slate-200">
              <label className="flex items-center gap-2 p-1.5 rounded hover:bg-slate-50 cursor-pointer">
                <input
                  type="checkbox"
                  checked={section.weather_show_forecast !== false}
                  onChange={(e) => onUpdate({ weather_show_forecast: e.target.checked })}
                  className="w-4 h-4 rounded border-slate-300 text-sky-600 focus:ring-sky-500"
                />
                <span className="font-bold text-slate-700">Display Multi-Day District Forecast</span>
              </label>

              <label className="flex items-center gap-2 p-1.5 rounded hover:bg-slate-50 cursor-pointer">
                <input
                  type="checkbox"
                  checked={section.weather_show_humidity !== false}
                  onChange={(e) => onUpdate({ weather_show_humidity: e.target.checked })}
                  className="w-4 h-4 rounded border-slate-300 text-sky-600 focus:ring-sky-500"
                />
                <span className="font-bold text-slate-700">Humidity &amp; Moisture Index</span>
              </label>

              <label className="flex items-center gap-2 p-1.5 rounded hover:bg-slate-50 cursor-pointer">
                <input
                  type="checkbox"
                  checked={section.weather_show_wind !== false}
                  onChange={(e) => onUpdate({ weather_show_wind: e.target.checked })}
                  className="w-4 h-4 rounded border-slate-300 text-sky-600 focus:ring-sky-500"
                />
                <span className="font-bold text-slate-700">Mountain Wind Speed (km/h)</span>
              </label>

              <label className="flex items-center gap-2 p-1.5 rounded hover:bg-slate-50 cursor-pointer">
                <input
                  type="checkbox"
                  checked={section.weather_show_air_quality !== false}
                  onChange={(e) => onUpdate({ weather_show_air_quality: e.target.checked })}
                  className="w-4 h-4 rounded border-slate-300 text-sky-600 focus:ring-sky-500"
                />
                <span className="font-bold text-slate-700">Hill Air Quality (AQI)</span>
              </label>

              <label className="flex items-center gap-2 p-1.5 rounded hover:bg-slate-50 cursor-pointer">
                <input
                  type="checkbox"
                  checked={section.weather_show_precipitation !== false}
                  onChange={(e) => onUpdate({ weather_show_precipitation: e.target.checked })}
                  className="w-4 h-4 rounded border-slate-300 text-sky-600 focus:ring-sky-500"
                />
                <span className="font-bold text-slate-700">Precipitation &amp; Rain Probability</span>
              </label>
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-800 uppercase tracking-wider mb-1.5">
              Section Title &amp; Subtitle
            </label>
            <div className="space-y-2">
              <input
                type="text"
                value={section.custom_title || section.title}
                onChange={(e) => onUpdate({ custom_title: e.target.value, title: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 bg-white text-xs font-semibold focus:outline-none focus:border-sky-600"
              />
              <input
                type="text"
                value={section.subtitle || ''}
                onChange={(e) => onUpdate({ subtitle: e.target.value })}
                placeholder="Live altitude meteorological readings, hill forecasts..."
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 bg-white text-xs focus:outline-none focus:border-sky-600"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
