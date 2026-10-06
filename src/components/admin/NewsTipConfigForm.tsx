import React from 'react';
import { HomepageSectionConfig } from '../../types';
import { Send, Lock } from 'lucide-react';

interface Props {
  section: HomepageSectionConfig;
  onUpdate: (data: Partial<HomepageSectionConfig>) => void;
}

export const NewsTipConfigForm: React.FC<Props> = ({
  section,
  onUpdate
}) => {
  return (
    <div className="space-y-6 bg-slate-50/70 p-6 rounded-2xl border border-slate-200 text-xs">
      <div className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 font-medium">
        <Send className="w-4 h-4 text-amber-600 shrink-0" />
        <span>
          <strong>Citizen Journalism News Tip Desk:</strong> Allows residents to submit ground reports, event photos, and colony updates directly to the editorial team.
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left Column: Form Text & Fields */}
        <div className="space-y-4">
          <div>
            <label className="block font-bold text-slate-800 uppercase tracking-wider mb-1.5">
              Form Instructions &amp; Callout
            </label>
            <textarea
              rows={3}
              value={section.news_tip_instructions || section.subtitle || ''}
              onChange={(e) =>
                onUpdate({
                  news_tip_instructions: e.target.value,
                  subtitle: e.target.value
                })
              }
              placeholder="Witnessed a local development, cultural celebration, or civic issue in your colony? Inform our editorial desk."
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-xs leading-relaxed focus:outline-none focus:border-amber-600"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-800 uppercase tracking-wider mb-1.5">
              Submit Button Text
            </label>
            <input
              type="text"
              value={section.button_text || section.cta_label || 'Send News Lead'}
              onChange={(e) =>
                onUpdate({
                  button_text: e.target.value,
                  cta_label: e.target.value
                })
              }
              className="w-full px-3.5 py-2 rounded-xl border border-slate-300 bg-white text-xs font-semibold focus:outline-none focus:border-amber-600"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-800 uppercase tracking-wider mb-1.5">
              Submission Success Notification Text
            </label>
            <input
              type="text"
              value={
                section.news_tip_success_message ||
                'Thank you! Your news tip has been securely received by the Zunheboto Social editorial desk.'
              }
              onChange={(e) => onUpdate({ news_tip_success_message: e.target.value })}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-300 bg-white text-xs focus:outline-none focus:border-amber-600"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-800 uppercase tracking-wider mb-1.5">
              Container Background
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'dark', label: 'Dark Navy (Default)' },
                { id: 'slate', label: 'Soft Slate' },
                { id: 'default', label: 'Clean White' }
              ].map((b) => (
                <button
                  key={b.id}
                  type="button"
                  onClick={() => onUpdate({ background_style: b.id as any })}
                  className={`px-3 py-2 rounded-lg border text-center font-bold cursor-pointer transition-colors ${
                    (section.background_style || 'dark') === b.id
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

        {/* Right Column: Active Form Fields & Privacy */}
        <div className="space-y-4">
          <div>
            <label className="block font-bold text-slate-800 uppercase tracking-wider mb-2">
              Form Fields to Request
            </label>
            <div className="space-y-2 bg-white p-3.5 rounded-xl border border-slate-200">
              <label className="flex items-center gap-2 p-1.5 rounded hover:bg-slate-50 cursor-pointer">
                <input
                  type="checkbox"
                  checked={section.news_tip_show_name !== false}
                  onChange={(e) => onUpdate({ news_tip_show_name: e.target.checked })}
                  className="w-4 h-4 rounded border-slate-300 text-amber-600 focus:ring-amber-500"
                />
                <span className="font-bold text-slate-700">Name Input Field (Optional for anonymous tips)</span>
              </label>

              <label className="flex items-center gap-2 p-1.5 rounded hover:bg-slate-50 cursor-pointer">
                <input
                  type="checkbox"
                  checked={section.news_tip_show_contact !== false}
                  onChange={(e) => onUpdate({ news_tip_show_contact: e.target.checked })}
                  className="w-4 h-4 rounded border-slate-300 text-amber-600 focus:ring-amber-500"
                />
                <span className="font-bold text-slate-700">Phone / WhatsApp / Email Verification Field</span>
              </label>

              <label className="flex items-center gap-2 p-1.5 rounded hover:bg-slate-50 cursor-pointer">
                <input
                  type="checkbox"
                  checked={section.news_tip_show_location !== false}
                  onChange={(e) => onUpdate({ news_tip_show_location: e.target.checked })}
                  className="w-4 h-4 rounded border-slate-300 text-amber-600 focus:ring-amber-500"
                />
                <span className="font-bold text-slate-700">Colony / Village Location Field</span>
              </label>

              <label className="flex items-center gap-2 p-1.5 rounded hover:bg-slate-50 cursor-pointer">
                <input
                  type="checkbox"
                  checked={section.news_tip_show_photo !== false}
                  onChange={(e) => onUpdate({ news_tip_show_photo: e.target.checked })}
                  className="w-4 h-4 rounded border-slate-300 text-amber-600 focus:ring-amber-500"
                />
                <span className="font-bold text-slate-700">Photo / Proof URL Attachment Field</span>
              </label>
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-800 uppercase tracking-wider mb-1.5">
              Privacy &amp; Source Protection Note
            </label>
            <input
              type="text"
              value={
                section.news_tip_privacy_note ||
                'Your contact information remains confidential with our newsroom reporters.'
              }
              onChange={(e) => onUpdate({ news_tip_privacy_note: e.target.value })}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-300 bg-white text-xs focus:outline-none focus:border-amber-600"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-800 uppercase tracking-wider mb-1.5">
              Section Title
            </label>
            <input
              type="text"
              value={section.custom_title || section.title}
              onChange={(e) => onUpdate({ custom_title: e.target.value, title: e.target.value })}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-300 bg-white text-xs font-semibold focus:outline-none focus:border-amber-600"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
