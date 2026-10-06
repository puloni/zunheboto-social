import React, { useState } from 'react';
import { useCms } from '../context/CmsContext';
import { Send, CheckCircle2, AlertCircle, Camera, ShieldCheck, MapPin, User, Phone, Lock } from 'lucide-react';
import { HomepageSectionConfig } from '../types';

interface NewsTipSectionProps {
  config?: HomepageSectionConfig;
}

export const NewsTipSection: React.FC<NewsTipSectionProps> = ({ config }) => {
  const { submitNewsTip } = useCms();
  const [name, setName] = useState('');
  const [contact, setContact] = useState('');
  const [location, setLocation] = useState('');
  const [message, setMessage] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    setLoading(true);
    setTimeout(() => {
      submitNewsTip({
        sender_name: name.trim() || 'Anonymous Citizen',
        sender_contact: contact.trim() || 'Not provided',
        location: location.trim() || 'Zunheboto Town',
        message: message.trim(),
        photo_url: photoUrl.trim()
      });
      setLoading(false);
      setSubmitted(true);
    }, 400);
  };

  const showNameField = config?.news_tip_show_name !== false;
  const showContactField = config?.news_tip_show_contact !== false;
  const showLocationField = config?.news_tip_show_location !== false;
  const showPhotoField = config?.news_tip_show_photo !== false;

  return (
    <div
      id="news-tip"
      className="bg-gradient-to-br from-slate-900 via-[#0B192C] to-slate-900 text-white rounded-3xl p-6 sm:p-10 border border-slate-800 shadow-lg relative overflow-hidden"
    >
      {/* Background Accent */}
      <div className="absolute right-0 top-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="max-w-3xl mx-auto relative z-10">
        <div className="text-center mb-8">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-semibold tracking-wider uppercase mb-3">
            <Send className="w-3.5 h-3.5" /> Citizen Journalism Desk
          </span>
          <h2 className="text-2xl sm:text-3xl font-serif font-bold text-white mb-2">
            {config?.custom_title || config?.title || 'Submit a Local News Tip or Ground Report'}
          </h2>
          <p className="text-sm text-slate-300 max-w-xl mx-auto leading-relaxed">
            {config?.news_tip_instructions ||
              config?.subtitle ||
              'Witnessed a local development, cultural celebration, civic issue, or noteworthy event in your colony or village? Inform our editorial desk.'}
          </p>
        </div>

        {submitted ? (
          <div className="bg-emerald-950/60 border border-emerald-500/50 rounded-2xl p-8 text-center text-emerald-200 animate-in fade-in zoom-in-95 duration-200">
            <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto mb-3" />
            <h3 className="text-xl font-serif font-bold text-white mb-2">
              Thank You for Your News Lead!
            </h3>
            <p className="text-sm text-emerald-200/90 mb-6 max-w-md mx-auto">
              {config?.news_tip_success_message ||
                'Your submission has been securely received by the Zunheboto Social editorial team. If verified, our reporters may follow up.'}
            </p>
            <button
              onClick={() => {
                setSubmitted(false);
                setName('');
                setContact('');
                setLocation('');
                setMessage('');
                setPhotoUrl('');
              }}
              className="bg-white text-slate-900 px-6 py-2.5 rounded-xl text-sm font-bold hover:bg-slate-100 transition-colors cursor-pointer shadow-xs"
            >
              Submit Another Tip
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {showNameField && (
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-amber-400" />
                    <span>Your Name</span>
                    <span className="text-slate-500 font-normal">(Optional)</span>
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Khekato Sumi"
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-amber-500"
                  />
                </div>
              )}

              {showContactField && (
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-amber-400" />
                    <span>Phone / WhatsApp / Email</span>
                    <span className="text-slate-500 font-normal">(Confidential)</span>
                  </label>
                  <input
                    type="text"
                    value={contact}
                    onChange={(e) => setContact(e.target.value)}
                    placeholder="+91 9436... or email"
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-amber-500"
                  />
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {showLocationField && (
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-amber-400" />
                    <span>Colony / Village / Landmark</span>
                    <span className="text-slate-500 font-normal">(Optional)</span>
                  </label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="e.g. Project Colony, Zunheboto"
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-amber-500"
                  />
                </div>
              )}

              {showPhotoField && (
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                    <Camera className="w-3.5 h-3.5 text-amber-400" />
                    <span>Photo or Document URL</span>
                    <span className="text-slate-500 font-normal">(Optional)</span>
                  </label>
                  <input
                    type="url"
                    value={photoUrl}
                    onChange={(e) => setPhotoUrl(e.target.value)}
                    placeholder="https://... image link"
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-amber-500"
                  />
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Ground Report / News Story Details <span className="text-rose-400">*</span>
              </label>
              <textarea
                required
                rows={4}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Describe what happened, where, who was involved, or what needs community attention..."
                className="w-full px-4 py-3 rounded-xl bg-slate-800/80 border border-slate-700 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-amber-500 leading-relaxed"
              />
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
              <div className="flex items-center gap-1.5 text-xs text-slate-400">
                <Lock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span>
                  {config?.news_tip_privacy_note ||
                    'Your identity and contact details remain confidential with our newsroom.'}
                </span>
              </div>

              <button
                type="submit"
                disabled={loading || !message.trim()}
                className="px-6 py-2.5 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-slate-950 font-bold rounded-xl text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md self-start sm:self-auto"
              >
                <Send className="w-3.5 h-3.5" />
                <span>
                  {loading ? 'Submitting...' : config?.button_text || config?.cta_label || 'Send News Lead'}
                </span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
