import React, { useState } from 'react';
import { useCms } from '../context/CmsContext';
import { Menu, X, Search, Send, ShieldAlert, CloudSun, Phone, ExternalLink } from 'lucide-react';

interface HeaderProps {
  onOpenNewsTip?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenNewsTip }) => {
  const { settings, menuItems, activePath, navigateTo, weather, isLoggedIn } = useCms();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const mainMenus = menuItems
    .filter((m) => m.menu_group === 'main')
    .sort((a, b) => a.order - b.order);

  const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });

  return (
    <header className="w-full bg-white border-b border-slate-200">
      {/* Top Utility Bar */}
      <div className="bg-[#0B192C] text-slate-300 text-xs py-2 px-4 border-b border-slate-800">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1 text-slate-200 font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block animate-pulse"></span>
              {settings.weather_location_name || 'Zunheboto District, Nagaland'}
            </span>
            <span className="hidden sm:inline text-slate-500">|</span>
            <span className="hidden sm:inline text-slate-400">{currentDate}</span>
            {weather && weather.available !== false && weather.temperature_c !== undefined && (
              <>
                <span className="hidden md:inline text-slate-500">|</span>
                <div className="hidden md:flex items-center gap-1.5 text-amber-300">
                  <CloudSun className="w-3.5 h-3.5" />
                  <span>
                    {settings.weather_unit === 'fahrenheit'
                      ? `${Math.round((weather.temperature_c * 9) / 5 + 32)}°F`
                      : `${weather.temperature_c}°C`}{' '}
                    {weather.condition}
                  </span>
                </div>
              </>
            )}
          </div>

          <div className="flex items-center gap-3">
            <a
              href="/classifieds"
              className="hover:text-amber-300 transition-colors cursor-pointer hidden sm:inline"
            >
              Classifieds
            </a>
            <span className="text-slate-600 hidden sm:inline">•</span>
            <a
              href="/search"
              className="flex items-center gap-1 hover:text-white transition-colors cursor-pointer"
              title="Search Archive"
            >
              <Search className="w-3.5 h-3.5" />
              <span className="hidden xs:inline">Search</span>
            </a>
            <span className="text-slate-600">•</span>
            <a
              href="/contact"
              onClick={(e) => {
                if (onOpenNewsTip) {
                  e.preventDefault();
                  onOpenNewsTip();
                }
              }}
              className="flex items-center gap-1 text-amber-400 hover:text-amber-300 font-medium cursor-pointer"
            >
              <Send className="w-3 h-3" />
              <span>Tip News</span>
            </a>
            <span className="text-slate-600">•</span>
            <a
              href={isLoggedIn ? '/admin' : '/admin/login'}
              className="hover:text-white transition-colors cursor-pointer"
            >
              {isLoggedIn ? 'Admin Desk' : 'Sign In'}
            </a>
          </div>
        </div>
      </div>

      {/* Main Branding Masthead */}
      <div className="max-w-7xl mx-auto px-4 py-8 sm:py-10 text-center relative">
        <a
          href="/"
          className="group inline-flex flex-col items-center justify-center cursor-pointer select-none"
        >
          {/* Top Classical Sub-Header */}
          <div className="flex items-center gap-3 text-[10px] sm:text-xs uppercase tracking-[0.25em] text-slate-500 font-sans font-semibold mb-2">
            <span className="w-8 sm:w-16 h-px bg-slate-300"></span>
            <span>Nagaland&apos;s District Chronicle &bull; Est. 2026</span>
            <span className="w-8 sm:w-16 h-px bg-slate-300"></span>
          </div>

          {/* Primary Typographic Wordmark (Pure Text, No Image) */}
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-serif font-black tracking-[0.12em] sm:tracking-[0.16em] text-[#0B192C] uppercase group-hover:text-slate-800 transition-colors drop-shadow-2xs">
            {settings.header_branding_text || settings.site_name || 'ZUNHEBOTO SOCIAL'}
          </h1>

          {/* Elegant Double Hairline Rule Enclosing Tagline */}
          <div className="w-full max-w-xl mx-auto mt-3 pt-2.5 pb-2 border-t-2 border-b border-slate-900/80 flex items-center justify-center">
            <p className="text-[11px] sm:text-xs font-serif italic text-slate-700 tracking-wider text-center">
              {settings.tagline || 'The Independent Digital Publication & Verified District Directory for Zunheboto'}
            </p>
          </div>
        </a>

        {/* Mobile Hamburger Button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="lg:hidden absolute right-4 top-1/2 -translate-y-1/2 p-2.5 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-100 cursor-pointer shadow-2xs"
          aria-label="Toggle navigation menu"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Main Navigation Bar */}
      <nav className="border-t border-b-2 border-slate-200 border-b-[#0B192C] bg-white sticky top-0 z-30 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-between">
          {/* Desktop Nav */}
          <ul className="hidden lg:flex items-center space-x-1">
            {mainMenus.map((item) => {
              const isActive =
                item.url === activePath ||
                (item.url !== '/' && activePath.startsWith(item.url));
              return (
                <li key={item.id}>
                  <a
                    href={item.url}
                    className={`px-4 py-3.5 text-xs font-bold tracking-wider uppercase transition-colors relative cursor-pointer inline-block ${
                      isActive
                        ? 'text-[#0B192C] font-extrabold after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-amber-600'
                        : 'text-slate-600 hover:text-[#0B192C] hover:bg-slate-50'
                    }`}
                  >
                    {item.label}
                  </a>
                </li>
              );
            })}
          </ul>

          {/* Right Action on Desktop */}
          <div className="hidden lg:flex items-center gap-3">
            <a
              href="/directory"
              className="text-xs font-semibold text-slate-600 hover:text-[#0B192C] flex items-center gap-1 cursor-pointer"
            >
              <span>Explore Listings</span>
            </a>
            <a
              href="/contact"
              onClick={(e) => {
                if (onOpenNewsTip) {
                  e.preventDefault();
                  onOpenNewsTip();
                }
              }}
              className="bg-[#0B192C] hover:bg-[#1E2A38] text-white text-xs font-semibold px-4 py-2 rounded shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Send className="w-3.5 h-3.5 text-amber-400" />
              <span>Submit News Tip</span>
            </a>
          </div>
        </div>

        {/* Mobile Slide-down Navigation Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-slate-200 bg-white px-4 py-4 space-y-2 shadow-lg animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="grid grid-cols-1 gap-1">
              {mainMenus.map((item) => {
                const isActive =
                  item.url === activePath ||
                  (item.url !== '/' && activePath.startsWith(item.url));
                return (
                  <a
                    key={item.id}
                    href={item.url}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`text-left px-3 py-2.5 rounded-md text-sm font-semibold tracking-wide uppercase transition-colors cursor-pointer block ${
                      isActive
                        ? 'bg-[#0B192C] text-white font-bold'
                        : 'text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    {item.label}
                  </a>
                );
              })}
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100">
              <a
                href="/classifieds"
                onClick={() => setMobileMenuOpen(false)}
                className="py-2 px-3 text-center rounded-lg bg-amber-50 text-amber-900 text-xs font-bold border border-amber-200 hover:bg-amber-100"
              >
                Local Classifieds
              </a>
              <a
                href="/directory"
                onClick={() => setMobileMenuOpen(false)}
                className="py-2 px-3 text-center rounded-lg bg-slate-100 text-slate-800 text-xs font-bold border border-slate-200 hover:bg-slate-200"
              >
                Directory
              </a>
            </div>

            <div className="pt-3 border-t border-slate-200 flex flex-col gap-2">
              <a
                href="/search"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-md bg-slate-100 text-slate-700 text-sm font-medium hover:bg-slate-200"
              >
                <Search className="w-4 h-4" />
                <span>Search Archive</span>
              </a>
              <a
                href="/contact"
                onClick={(e) => {
                  if (onOpenNewsTip) {
                    e.preventDefault();
                    onOpenNewsTip();
                  }
                  setMobileMenuOpen(false);
                }}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-md bg-amber-600 text-white text-sm font-bold shadow-xs hover:bg-amber-700"
              >
                <Send className="w-4 h-4" />
                <span>Send Local News Tip</span>
              </a>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
};
