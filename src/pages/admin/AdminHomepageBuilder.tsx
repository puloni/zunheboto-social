import React, { useState } from 'react';
import { useCms } from '../../context/CmsContext';
import {
  Layers,
  Eye,
  EyeOff,
  ArrowUp,
  ArrowDown,
  RotateCcw,
  Sparkles,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Sliders,
  FolderOpen,
  Camera,
  Building,
  Flame,
  BookOpen,
  Share2,
  Newspaper,
  CloudSun,
  Send,
  ShieldAlert,
  HelpCircle
} from 'lucide-react';
import { HomePage } from '../HomePage';
import { FeaturedStoryConfigForm } from '../../components/admin/FeaturedStoryConfigForm';
import { LatestNewsConfigForm } from '../../components/admin/LatestNewsConfigForm';
import { CultureHeritageConfigForm } from '../../components/admin/CultureHeritageConfigForm';
import { GalleryConfigForm } from '../../components/admin/GalleryConfigForm';
import { CommunityCarouselConfigForm } from '../../components/admin/CommunityCarouselConfigForm';
import { DirectoryConfigForm } from '../../components/admin/DirectoryConfigForm';
import { WeatherDeskConfigForm } from '../../components/admin/WeatherDeskConfigForm';
import { NewsTipConfigForm } from '../../components/admin/NewsTipConfigForm';
import { EmergencyHotlinesConfigForm } from '../../components/admin/EmergencyHotlinesConfigForm';
import { MoreStoriesConfigForm } from '../../components/admin/MoreStoriesConfigForm';
import { HomepageSectionConfig } from '../../types';
import {
  resolveSectionType,
  SECTION_TYPE_METADATA,
  PredefinedSectionType
} from '../../utils/sectionTypes';

export const AdminHomepageBuilder: React.FC = () => {
  const {
    homepageSections,
    updateHomepageSection,
    reorderHomepageSections,
    toggleHomepageSection,
    resetHomepageSections,
    articles,
    articleCategories,
    galleryPhotos,
    listings,
    listingCategories,
    emergencyHotlines,
    setFeaturedStory,
    navigateTo
  } = useCms();

  const [expandedSectionId, setExpandedSectionId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'editor' | 'preview'>('editor');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  const handleMoveUp = (index: number) => {
    if (index <= 0) return;
    reorderHomepageSections(index, index - 1);
    showToast('Section moved up in order');
  };

  const handleMoveDown = (index: number) => {
    if (index >= homepageSections.length - 1) return;
    reorderHomepageSections(index, index + 1);
    showToast('Section moved down in order');
  };

  const handleToggle = (id: string) => {
    toggleHomepageSection(id);
    showToast('Section visibility updated');
  };

  const handleResetDefaults = () => {
    if (window.confirm('Reset homepage layout to the standard 10-section Zunheboto Social editorial structure?')) {
      resetHomepageSections();
      showToast('Homepage layout reset to 10 standard sections');
    }
  };

  const getSectionIcon = (type: PredefinedSectionType) => {
    switch (type) {
      case 'FEATURED_STORY':
        return <Flame className="w-4 h-4 text-amber-600" />;
      case 'LATEST_NEWS':
        return <Newspaper className="w-4 h-4 text-blue-600" />;
      case 'CULTURE_HERITAGE':
        return <BookOpen className="w-4 h-4 text-amber-700" />;
      case 'PICTURES':
        return <Camera className="w-4 h-4 text-purple-600" />;
      case 'COMMUNITY_SOCIETY':
        return <Share2 className="w-4 h-4 text-emerald-600" />;
      case 'DIRECTORY':
        return <Building className="w-4 h-4 text-teal-700" />;
      case 'WEATHER':
        return <CloudSun className="w-4 h-4 text-sky-600" />;
      case 'NEWS_TIP':
        return <Send className="w-4 h-4 text-orange-600" />;
      case 'EMERGENCY_HOTLINES':
        return <ShieldAlert className="w-4 h-4 text-rose-600" />;
      case 'MORE_STORIES':
        return <FolderOpen className="w-4 h-4 text-indigo-600" />;
      default:
        return <Layers className="w-4 h-4 text-slate-500" />;
    }
  };

  const getSectionTypeBadge = (type: PredefinedSectionType) => {
    const meta = SECTION_TYPE_METADATA[type];
    if (meta) {
      return {
        label: meta.label,
        color: meta.badgeClass
      };
    }
    return { label: 'Predefined Section', color: 'bg-slate-100 text-slate-900 border-slate-200' };
  };

  // Form Factory Renderer
  const renderSpecializedSectionForm = (section: HomepageSectionConfig) => {
    const type = resolveSectionType(section);
    switch (type) {
      case 'FEATURED_STORY':
        return (
          <FeaturedStoryConfigForm
            section={section}
            articles={articles}
            onUpdate={(data) => updateHomepageSection(section.id, data)}
            onSetFeatured={(artId) => setFeaturedStory(artId)}
          />
        );

      case 'LATEST_NEWS':
        return (
          <LatestNewsConfigForm
            section={section}
            categories={articleCategories}
            onUpdate={(data) => updateHomepageSection(section.id, data)}
          />
        );

      case 'CULTURE_HERITAGE':
        return (
          <CultureHeritageConfigForm
            section={section}
            categories={articleCategories}
            onUpdate={(data) => updateHomepageSection(section.id, data)}
          />
        );

      case 'PICTURES':
        return (
          <GalleryConfigForm
            section={section}
            photos={galleryPhotos}
            onUpdate={(data) => updateHomepageSection(section.id, data)}
          />
        );

      case 'COMMUNITY_SOCIETY':
        return (
          <CommunityCarouselConfigForm
            section={section}
            categories={articleCategories}
            onUpdate={(data) => updateHomepageSection(section.id, data)}
          />
        );

      case 'DIRECTORY':
        return (
          <DirectoryConfigForm
            section={section}
            listingCategories={listingCategories}
            onUpdate={(data) => updateHomepageSection(section.id, data)}
          />
        );

      case 'WEATHER':
        return (
          <WeatherDeskConfigForm
            section={section}
            onUpdate={(data) => updateHomepageSection(section.id, data)}
          />
        );

      case 'NEWS_TIP':
        return (
          <NewsTipConfigForm
            section={section}
            onUpdate={(data) => updateHomepageSection(section.id, data)}
          />
        );

      case 'EMERGENCY_HOTLINES':
        return (
          <EmergencyHotlinesConfigForm
            section={section}
            hotlines={emergencyHotlines}
            onUpdate={(data) => updateHomepageSection(section.id, data)}
          />
        );

      case 'MORE_STORIES':
        return (
          <MoreStoriesConfigForm
            section={section}
            categories={articleCategories}
            onUpdate={(data) => updateHomepageSection(section.id, data)}
          />
        );

      default:
        return (
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600">
            <p className="font-semibold text-slate-800">Section Settings</p>
            <div className="mt-3 grid grid-cols-2 gap-4">
              <div>
                <label className="block font-medium mb-1">Title</label>
                <input
                  type="text"
                  value={section.custom_title || section.title}
                  onChange={(e) => updateHomepageSection(section.id, { custom_title: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg bg-white"
                />
              </div>
              <div>
                <label className="block font-medium mb-1">Subtitle</label>
                <input
                  type="text"
                  value={section.subtitle || ''}
                  onChange={(e) => updateHomepageSection(section.id, { subtitle: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg bg-white"
                />
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Header & Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-serif font-bold text-[#0B192C]">
              Homepage Builder
            </h1>
            <span className="text-[10px] bg-amber-100 text-amber-800 font-bold uppercase px-2.5 py-0.5 rounded-full font-mono border border-amber-200">
              10 Editorial Modules
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Configure specialized editorial interfaces for each section, arrange display sequence, and preview real-time changes.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {toastMessage && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-100 text-emerald-800 rounded-lg text-xs font-bold animate-fade-in shadow-xs">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>{toastMessage}</span>
            </div>
          )}

          {/* Mode Switcher Tabs */}
          <div className="flex items-center p-1 bg-slate-100 border border-slate-200 rounded-xl">
            <button
              type="button"
              onClick={() => setActiveTab('editor')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'editor'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Configure Sections
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('preview')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'preview'
                  ? 'bg-white text-amber-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Eye className="w-3.5 h-3.5 text-amber-600" />
              <span>Live Preview</span>
            </button>
          </div>

          <button
            type="button"
            onClick={handleResetDefaults}
            className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
            title="Reset homepage to the default 10 sections"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset 10 Sections</span>
          </button>

          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 bg-[#0B192C] hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
          >
            <Eye className="w-4 h-4 text-amber-400" />
            <span>Open Live Site</span>
          </a>
        </div>
      </div>

      {activeTab === 'preview' ? (
        /* Live Preview Embedded Container */
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="bg-slate-900 text-white px-5 py-3 flex items-center justify-between text-xs font-medium">
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Live Homepage Preview (Real-time synchronization with active CMS data)</span>
            </span>
            <button
              onClick={() => setActiveTab('editor')}
              className="text-amber-400 hover:underline font-bold"
            >
              ← Return to Section Settings
            </button>
          </div>
          <div className="p-2 sm:p-6 bg-slate-50/50">
            <HomePage />
          </div>
        </div>
      ) : (
        <>
          {/* Info Banner */}
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200/80 rounded-2xl p-4 flex items-start gap-3">
            <Sparkles className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
            <div className="text-xs text-amber-950">
              <p className="font-bold mb-0.5">
                Dedicated Editorial Interface for Each Content Type
              </p>
              <p className="text-slate-600 leading-relaxed">
                Each homepage module features its own dedicated settings panel matching its specific data structure: Featured Story hero picker, Breaking News layout, Photo Gallery grid &amp; lightbox controls, Community Carousel motion timers, Directory verified listings filters, Live Weather station telemetry, Citizen Journalism tips desk, and District Emergency Hotlines.
              </p>
            </div>
          </div>

          {/* Section Accordions List */}
          <div className="space-y-3.5">
            {homepageSections.map((section, index) => {
              const isExpanded = expandedSectionId === section.id;
              const sectionType = resolveSectionType(section);
              const badge = getSectionTypeBadge(sectionType);

              return (
                <div
                  key={section.id}
                  className={`bg-white rounded-2xl border transition-all duration-200 overflow-hidden ${
                    isExpanded
                      ? 'border-amber-400 ring-2 ring-amber-100 shadow-md'
                      : 'border-slate-200 hover:border-slate-300 shadow-2xs'
                  } ${!section.enabled ? 'opacity-65 bg-slate-50/70' : ''}`}
                >
                  {/* Accordion Header Row */}
                  <div className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white">
                    <div className="flex items-center gap-3 min-w-0">
                      {/* Drag / Order Badge */}
                      <div className="w-7 h-7 rounded-xl bg-slate-100 text-slate-700 font-bold text-xs flex items-center justify-center font-mono shrink-0 border border-slate-200">
                        {index + 1}
                      </div>

                      {/* Icon */}
                      <div className="p-2 rounded-xl bg-slate-50 border border-slate-200 shrink-0">
                        {getSectionIcon(sectionType)}
                      </div>

                      {/* Title & Type Badge */}
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-sm font-serif font-bold text-slate-900 truncate">
                            {section.custom_title || section.title}
                          </h3>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase tracking-wider ${badge.color}`}
                          >
                            {badge.label}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 truncate mt-0.5">
                          {section.subtitle || `Key: ${section.section_key}`}
                        </p>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-1.5 self-end sm:self-center shrink-0">
                      {/* Move Up */}
                      <button
                        type="button"
                        onClick={() => handleMoveUp(index)}
                        disabled={index === 0}
                        className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg disabled:opacity-30 disabled:hover:bg-transparent cursor-pointer transition-colors"
                        title="Move Up"
                      >
                        <ArrowUp className="w-4 h-4" />
                      </button>

                      {/* Move Down */}
                      <button
                        type="button"
                        onClick={() => handleMoveDown(index)}
                        disabled={index === homepageSections.length - 1}
                        className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg disabled:opacity-30 disabled:hover:bg-transparent cursor-pointer transition-colors"
                        title="Move Down"
                      >
                        <ArrowDown className="w-4 h-4" />
                      </button>

                      {/* Visibility Toggle */}
                      <button
                        type="button"
                        onClick={() => handleToggle(section.id)}
                        className={`p-2 rounded-lg cursor-pointer transition-colors ${
                          section.enabled
                            ? 'text-emerald-600 hover:bg-emerald-50'
                            : 'text-slate-400 hover:bg-slate-100'
                        }`}
                        title={section.enabled ? 'Section Visible (Click to Hide)' : 'Section Hidden (Click to Show)'}
                      >
                        {section.enabled ? (
                          <Eye className="w-4 h-4" />
                        ) : (
                          <EyeOff className="w-4 h-4" />
                        )}
                      </button>

                      {/* Expand/Collapse Toggle */}
                      <button
                        type="button"
                        onClick={() =>
                          setExpandedSectionId(isExpanded ? null : section.id)
                        }
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ml-1 ${
                          isExpanded
                            ? 'bg-[#0B192C] text-white shadow-xs'
                            : 'bg-slate-100 hover:bg-slate-200 text-slate-800'
                        }`}
                      >
                        <Sliders className="w-3.5 h-3.5" />
                        <span>{isExpanded ? 'Close Config' : 'Configure'}</span>
                        {isExpanded ? (
                          <ChevronUp className="w-3.5 h-3.5" />
                        ) : (
                          <ChevronDown className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Expanded Specialized Configuration Body */}
                  {isExpanded && (
                    <div className="p-4 sm:p-6 bg-slate-50/50 border-t border-slate-200 animate-in fade-in duration-150">
                      {renderSpecializedSectionForm(section)}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
};
