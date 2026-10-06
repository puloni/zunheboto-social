import React, { useState, useEffect } from 'react';
import {
  Mail,
  CheckCircle2,
  Bell,
  Sparkles,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  Send,
  Users,
  AlertCircle,
  FileText,
  MapPin,
  RefreshCw,
  SlidersHorizontal,
  BookmarkCheck
} from 'lucide-react';
import {
  captureSubscriberEmail,
  getStoredSubscribers,
  DEFAULT_NEWSLETTER_PREFERENCES,
  NewsletterPreferences
} from '../data/newsletterStorage';

export interface NewsletterSubscribeProps {
  variant?: 'banner' | 'card' | 'compact' | 'inline';
  title?: string;
  subtitle?: string;
  source?: string;
  className?: string;
  showColonySelector?: boolean;
  showPreferences?: boolean;
  onSubscribed?: (email: string) => void;
}

const ZUNHEBOTO_COLONIES = [
  'DC Hill',
  'Old Town Colony',
  'South Point',
  'Project Colony',
  'Laghilato Colony',
  'Alahuto Colony',
  'Amiphoto Colony',
  'Natha Colony',
  'Aizuto / Suruhuto Road',
  'Non-Resident / Diaspora'
];

export const NewsletterSubscribe: React.FC<NewsletterSubscribeProps> = ({
  variant = 'banner',
  title,
  subtitle,
  source = 'newsletter_component',
  className = '',
  showColonySelector = true,
  showPreferences = true,
  onSubscribed
}) => {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [colony, setColony] = useState('');
  const [preferences, setPreferences] = useState<NewsletterPreferences>(DEFAULT_NEWSLETTER_PREFERENCES);
  const [showAdvanced, setShowAdvanced] = useState(false);
  
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successData, setSuccessData] = useState<{
    email: string;
    message: string;
    isNew: boolean;
    preferences: NewsletterPreferences;
  } | null>(null);

  const [subscriberCount, setSubscriberCount] = useState(1420);

  useEffect(() => {
    try {
      const stored = getStoredSubscribers();
      setSubscriberCount(1420 + stored.length);
    } catch {
      // ignore
    }
  }, [successData]);

  const handleTogglePreference = (key: keyof NewsletterPreferences) => {
    setPreferences((prev) => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const trimmed = email.trim();
    if (!trimmed) {
      setErrorMsg('Please enter your email address.');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      setErrorMsg('Please enter a valid email address (e.g. name@example.com).');
      return;
    }

    setLoading(true);

    // Simulate natural network turnaround before writing to mock storage
    setTimeout(() => {
      try {
        const result = captureSubscriberEmail(trimmed, {
          name: name.trim() || undefined,
          colony: colony || undefined,
          source,
          preferences
        });

        setLoading(false);
        setSuccessData({
          email: trimmed,
          message: result.message,
          isNew: result.isNew,
          preferences: result.subscriber.preferences
        });

        if (onSubscribed) {
          onSubscribed(trimmed);
        }
      } catch (err: any) {
        setLoading(false);
        setErrorMsg(err.message || 'An error occurred while saving subscription.');
      }
    }, 450);
  };

  const handleResetForm = () => {
    setEmail('');
    setName('');
    setColony('');
    setSuccessData(null);
    setErrorMsg(null);
    setShowAdvanced(false);
  };

  // Compact Variant
  if (variant === 'compact') {
    return (
      <div className={`bg-slate-900 text-white p-4 rounded-xl border border-slate-800 ${className}`}>
        <div className="flex items-center gap-2 mb-2 text-amber-400">
          <Mail className="w-4 h-4" />
          <h4 className="text-xs font-bold uppercase tracking-wider">
            {title || 'Zunheboto Dispatch'}
          </h4>
        </div>
        <p className="text-xs text-slate-300 mb-3">
          {subtitle || 'Get weekly district news and cultural updates in your inbox.'}
        </p>

        {successData ? (
          <div className="bg-emerald-950/80 border border-emerald-700/60 p-3 rounded-lg text-xs text-emerald-200">
            <div className="flex items-center gap-1.5 font-semibold text-emerald-300 mb-1">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              Subscribed!
            </div>
            <p className="text-[11px] text-emerald-300/80">{successData.email}</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-2">
            <div className="relative">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                disabled={loading}
                className="w-full pl-3 pr-8 py-2 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-amber-500"
              />
            </div>
            {errorMsg && <p className="text-[11px] text-rose-400">{errorMsg}</p>}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2 bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold text-xs rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  <span>Subscribe Free</span>
                </>
              )}
            </button>
          </form>
        )}
      </div>
    );
  }

  // Inline Variant
  if (variant === 'inline') {
    return (
      <div className={`w-full ${className}`}>
        {successData ? (
          <div className="flex items-center gap-2 text-xs text-emerald-700 bg-emerald-50 px-3 py-2 rounded-lg border border-emerald-200">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Thank you for subscribing! ({successData.email})</span>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email address..."
              disabled={loading}
              className="flex-1 px-4 py-2.5 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
            />
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-bold text-sm rounded-lg transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 shrink-0"
            >
              {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              <span>Subscribe</span>
            </button>
          </form>
        )}
        {errorMsg && <p className="text-xs text-rose-600 mt-1.5">{errorMsg}</p>}
      </div>
    );
  }

  // Card Variant
  if (variant === 'card') {
    return (
      <div className={`bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-xs ${className}`}>
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
            <Mail className="w-6 h-6" />
          </div>
          <div className="flex items-center gap-1.5 bg-slate-100 px-3 py-1 rounded-full text-xs font-semibold text-slate-700">
            <Users className="w-3.5 h-3.5 text-amber-600" />
            <span>{subscriberCount.toLocaleString()}+ Subscribed</span>
          </div>
        </div>

        <h3 className="text-xl font-display font-bold text-slate-900 mb-2">
          {title || 'Zunheboto Morning Dispatch'}
        </h3>
        <p className="text-sm text-slate-600 mb-6 leading-relaxed">
          {subtitle ||
            'Receive hand-curated headlines, Sumi cultural chronicles, and verified district announcements straight to your mailbox every morning.'}
        </p>

        {successData ? (
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-5 text-center">
            <div className="w-10 h-10 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto mb-3">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <h4 className="text-base font-bold text-emerald-900 mb-1">
              {successData.isNew ? 'Welcome to the Community!' : 'Subscription Updated!'}
            </h4>
            <p className="text-xs text-emerald-800 mb-4">{successData.message}</p>
            <div className="bg-white/80 p-2.5 rounded-lg border border-emerald-100 text-xs text-slate-600 mb-4">
              Saved email: <span className="font-semibold text-slate-900">{successData.email}</span>
            </div>
            <button
              onClick={handleResetForm}
              className="text-xs text-emerald-800 font-semibold underline hover:text-emerald-950 cursor-pointer"
            >
              Subscribe another email or edit preferences
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Email Address <span className="text-rose-500">*</span>
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your.email@example.com"
                disabled={loading}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white transition-colors"
              />
            </div>

            {showColonySelector && (
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Colony / Area (Optional)
                </label>
                <select
                  value={colony}
                  onChange={(e) => setColony(e.target.value)}
                  disabled={loading}
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white"
                >
                  <option value="">Select your colony...</option>
                  {ZUNHEBOTO_COLONIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {errorMsg && (
              <div className="flex items-center gap-2 text-xs text-rose-700 bg-rose-50 p-2.5 rounded-lg border border-rose-200">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-amber-600 hover:bg-amber-700 text-white font-bold text-sm rounded-xl transition-colors shadow-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Capturing Email...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Subscribe to Newsletters</span>
                </>
              )}
            </button>

            <div className="flex items-center justify-center gap-4 text-[11px] text-slate-500 pt-1">
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> No spam guaranteed
              </span>
              <span>•</span>
              <span>One-click unsubscribe</span>
            </div>
          </form>
        )}
      </div>
    );
  }

  // Default: Full Editorial Banner Variant
  return (
    <div
      className={`relative overflow-hidden bg-gradient-to-br from-[#0B192C] via-[#12243d] to-[#0A1626] text-white rounded-3xl border-2 border-amber-600/30 p-8 sm:p-12 shadow-xl ${className}`}
    >
      {/* Background Decorative Pattern */}
      <div className="absolute top-0 right-0 -mt-12 -mr-12 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 -mb-12 -ml-12 w-64 h-64 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 max-w-4xl mx-auto">
        {/* Header Badges */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
          <div className="inline-flex items-center gap-2 bg-amber-500/20 text-amber-300 border border-amber-500/30 px-3.5 py-1.5 rounded-full text-xs font-semibold tracking-wide uppercase">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Community Dispatch</span>
          </div>

          <div className="flex items-center gap-2 text-xs font-medium text-slate-300 bg-slate-800/80 px-3 py-1.5 rounded-full border border-slate-700">
            <Users className="w-3.5 h-3.5 text-amber-400" />
            <span>
              <strong className="text-white">{subscriberCount.toLocaleString()}+</strong> readers in Zunheboto & diaspora
            </span>
          </div>
        </div>

        {/* Headline & Description */}
        <div className="text-center sm:text-left mb-8">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-display font-bold text-white tracking-tight leading-tight">
            {title || 'Stay Informed with the Zunheboto Social Newsletter'}
          </h2>
          <p className="mt-3 text-sm sm:text-base text-slate-300 max-w-2xl leading-relaxed">
            {subtitle ||
              'Direct delivery of verified town council updates, breaking district headlines, cultural chronicles of the Sumi people, and local directory additions straight to your inbox.'}
          </p>
        </div>

        {/* Subscription Flow */}
        {successData ? (
          <div className="bg-emerald-950/80 border-2 border-emerald-600/50 rounded-2xl p-6 sm:p-8 text-white backdrop-blur-xs">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-5">
              <div className="w-12 h-12 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-emerald-400 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-emerald-200">
                  {successData.isNew ? 'You are subscribed!' : 'Preferences Updated!'}
                </h3>
                <p className="text-xs sm:text-sm text-emerald-300/90 mt-0.5">{successData.message}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-900/80 rounded-xl p-4 border border-slate-800 text-xs mb-5">
              <div>
                <span className="text-slate-400 block text-[11px] uppercase tracking-wider">Registered Email:</span>
                <span className="font-semibold text-white break-all">{successData.email}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px] uppercase tracking-wider">Storage Target:</span>
                <span className="text-amber-300 font-mono text-[11px]">Mock Storage (Persistent Local Data)</span>
              </div>
              <div className="sm:col-span-2 pt-2 border-t border-slate-800/80">
                <span className="text-slate-400 block text-[11px] uppercase tracking-wider mb-1.5">
                  Subscribed Topics:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {successData.preferences.breaking_news && (
                    <span className="bg-rose-950/80 text-rose-300 border border-rose-800/60 px-2 py-0.5 rounded text-[10px]">
                      Breaking News
                    </span>
                  )}
                  {successData.preferences.weekly_digest && (
                    <span className="bg-sky-950/80 text-sky-300 border border-sky-800/60 px-2 py-0.5 rounded text-[10px]">
                      Weekly Digest
                    </span>
                  )}
                  {successData.preferences.culture_heritage && (
                    <span className="bg-amber-950/80 text-amber-300 border border-amber-800/60 px-2 py-0.5 rounded text-[10px]">
                      Sumi Culture & Festivals
                    </span>
                  )}
                  {successData.preferences.local_directory && (
                    <span className="bg-emerald-950/80 text-emerald-300 border border-emerald-800/60 px-2 py-0.5 rounded text-[10px]">
                      Directory Updates
                    </span>
                  )}
                  {successData.preferences.emergency_alerts && (
                    <span className="bg-indigo-950/80 text-indigo-300 border border-indigo-800/60 px-2 py-0.5 rounded text-[10px]">
                      Emergency Bulletins
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
              <button
                onClick={handleResetForm}
                className="text-xs text-amber-400 hover:text-amber-300 font-semibold underline cursor-pointer"
              >
                ← Register another email address
              </button>
              <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
                <BookmarkCheck className="w-4 h-4 text-emerald-400" />
                <span>Saved to mock storage record database</span>
              </div>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Primary Inputs */}
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
              <div className="sm:col-span-6 relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-5 h-5 text-amber-500" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email address..."
                  disabled={loading}
                  className="w-full pl-11 pr-4 py-3.5 bg-slate-900/90 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-colors shadow-inner"
                />
              </div>

              {showColonySelector ? (
                <div className="sm:col-span-3 relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <MapPin className="w-4 h-4 text-amber-500" />
                  </div>
                  <select
                    value={colony}
                    onChange={(e) => setColony(e.target.value)}
                    disabled={loading}
                    className="w-full pl-10 pr-4 py-3.5 bg-slate-900/90 border border-slate-700 rounded-xl text-xs sm:text-sm text-white focus:outline-none focus:ring-2 focus:ring-amber-500 transition-colors appearance-none cursor-pointer"
                  >
                    <option value="" className="bg-slate-900 text-slate-400">
                      Colony (Optional)
                    </option>
                    {ZUNHEBOTO_COLONIES.map((c) => (
                      <option key={c} value={c} className="bg-slate-900 text-white">
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
              ) : null}

              <div className={showColonySelector ? 'sm:col-span-3' : 'sm:col-span-6'}>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full h-full py-3.5 px-6 bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold text-sm rounded-xl transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                >
                  {loading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin text-slate-950" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 text-slate-950" />
                      <span>Subscribe Free</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Optional Preferences & Customization Toggle */}
            {showPreferences && (
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => setShowAdvanced(!showAdvanced)}
                  className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-amber-400 transition-colors cursor-pointer"
                >
                  <SlidersHorizontal className="w-3.5 h-3.5" />
                  <span>{showAdvanced ? 'Hide Newsletter Preferences' : 'Customize Topic Preferences & Name'}</span>
                  {showAdvanced ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                </button>

                {showAdvanced && (
                  <div className="mt-3 bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-5 text-xs space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                          Subscriber Name (Optional)
                        </label>
                        <input
                          type="text"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="e.g. Kivika Yeptho"
                          className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                          Delivery Frequency
                        </label>
                        <div className="px-3 py-2 bg-slate-800/60 border border-slate-700/60 rounded-lg text-xs text-slate-300">
                          Instant Alerts & Sunday Morning Digest
                        </div>
                      </div>
                    </div>

                    <div>
                      <span className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                        Select Topics of Interest:
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                        <label className="flex items-center gap-2 p-2 bg-slate-800/80 rounded-lg border border-slate-700 cursor-pointer hover:bg-slate-800">
                          <input
                            type="checkbox"
                            checked={preferences.breaking_news}
                            onChange={() => handleTogglePreference('breaking_news')}
                            className="rounded text-amber-600 focus:ring-amber-500"
                          />
                          <span className="text-slate-200">Breaking District News</span>
                        </label>

                        <label className="flex items-center gap-2 p-2 bg-slate-800/80 rounded-lg border border-slate-700 cursor-pointer hover:bg-slate-800">
                          <input
                            type="checkbox"
                            checked={preferences.weekly_digest}
                            onChange={() => handleTogglePreference('weekly_digest')}
                            className="rounded text-amber-600 focus:ring-amber-500"
                          />
                          <span className="text-slate-200">Weekly Town Digest</span>
                        </label>

                        <label className="flex items-center gap-2 p-2 bg-slate-800/80 rounded-lg border border-slate-700 cursor-pointer hover:bg-slate-800">
                          <input
                            type="checkbox"
                            checked={preferences.culture_heritage}
                            onChange={() => handleTogglePreference('culture_heritage')}
                            className="rounded text-amber-600 focus:ring-amber-500"
                          />
                          <span className="text-slate-200">Sumi Culture & Festivals</span>
                        </label>

                        <label className="flex items-center gap-2 p-2 bg-slate-800/80 rounded-lg border border-slate-700 cursor-pointer hover:bg-slate-800">
                          <input
                            type="checkbox"
                            checked={preferences.local_directory}
                            onChange={() => handleTogglePreference('local_directory')}
                            className="rounded text-amber-600 focus:ring-amber-500"
                          />
                          <span className="text-slate-200">Business & Service Directory</span>
                        </label>

                        <label className="flex items-center gap-2 p-2 bg-slate-800/80 rounded-lg border border-slate-700 cursor-pointer hover:bg-slate-800">
                          <input
                            type="checkbox"
                            checked={preferences.emergency_alerts}
                            onChange={() => handleTogglePreference('emergency_alerts')}
                            className="rounded text-amber-600 focus:ring-amber-500"
                          />
                          <span className="text-slate-200">Emergency & Weather Bulletins</span>
                        </label>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Error Message */}
            {errorMsg && (
              <div className="flex items-center gap-2 text-xs text-rose-300 bg-rose-950/80 p-3 rounded-xl border border-rose-800">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Footer Trust Markers */}
            <div className="flex flex-wrap items-center justify-between gap-4 pt-3 border-t border-slate-800 text-[11px] text-slate-400">
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Free & privacy-protected
                </span>
                <span>•</span>
                <span>One-click unsubscribe anytime</span>
              </div>
              <div className="flex items-center gap-1 text-slate-500">
                <FileText className="w-3 h-3 text-amber-500" />
                <span>Saved locally to mock storage file</span>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
