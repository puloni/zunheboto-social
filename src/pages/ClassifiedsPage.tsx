import React, { useState, useMemo } from 'react';
import { useCms } from '../context/CmsContext';
import { ClassifiedListing, ClassifiedCategory } from '../types';
import {
  Briefcase,
  Home,
  Car,
  ShoppingBag,
  FileQuestion,
  Wrench,
  Plus,
  Search,
  MapPin,
  Phone,
  MessageCircle,
  Mail,
  CheckCircle2,
  Clock,
  Sparkles,
  X,
  Upload,
  Calendar,
  AlertCircle
} from 'lucide-react';

const CATEGORIES: { id: ClassifiedCategory | 'all'; label: string; icon: any; countKey: ClassifiedCategory }[] = [
  { id: 'all', label: 'All Classifieds', icon: Sparkles, countKey: 'jobs' },
  { id: 'jobs', label: 'Jobs & Employment', icon: Briefcase, countKey: 'jobs' },
  { id: 'rentals', label: 'House & Property Rentals', icon: Home, countKey: 'rentals' },
  { id: 'vehicles', label: 'Vehicles & Wheels', icon: Car, countKey: 'vehicles' },
  { id: 'marketplace', label: 'Buy & Sell Market', icon: ShoppingBag, countKey: 'marketplace' },
  { id: 'documents', label: 'Lost & Found / Notices', icon: FileQuestion, countKey: 'documents' },
  { id: 'services', label: 'Local Trades & Services', icon: Wrench, countKey: 'services' }
];

export const ClassifiedsPage: React.FC = () => {
  const { classifieds, incrementClassifiedViews, currentRoute } = useCms();
  const [selectedCat, setSelectedCat] = useState<ClassifiedCategory | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeListing, setActiveListing] = useState<ClassifiedListing | null>(null);
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(() => {
    if (typeof window !== 'undefined') {
      const search = window.location.search;
      const hash = window.location.hash;
      return search.includes('submit=1') || hash === '#post' || hash === '#submit';
    }
    return false;
  });

  // Automatically open modal if navigating to ?submit=1 or #post
  React.useEffect(() => {
    if (
      currentRoute.includes('submit=1') ||
      (typeof window !== 'undefined' && (window.location.search.includes('submit=1') || window.location.hash === '#post'))
    ) {
      setIsSubmitModalOpen(true);
    }
  }, [currentRoute]);

  // Form State for Self-Service Posting
  const [formData, setFormData] = useState({
    title: '',
    category: 'jobs' as ClassifiedCategory,
    listing_type: 'offered' as 'offered' | 'wanted',
    description: '',
    price_or_salary: '',
    location: '',
    contact_name: '',
    contact_phone: '',
    contact_whatsapp: '',
    contact_email: '',
    image_url: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState('');

  // Filter only active listings for public view
  const activeListings = useMemo(() => {
    return classifieds.filter((c) => c.status === 'active');
  }, [classifieds]);

  const filteredListings = useMemo(() => {
    return activeListings.filter((item) => {
      const matchesCat = selectedCat === 'all' || item.category === selectedCat;
      const matchesSearch =
        !searchQuery ||
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.location.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCat && matchesSearch;
    });
  }, [activeListings, selectedCat, searchQuery]);

  const handleOpenDetail = (item: ClassifiedListing) => {
    setActiveListing(item);
    incrementClassifiedViews(item.id);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError('');
    if (!formData.title.trim() || !formData.contact_phone.trim()) {
      setSubmitError('Please provide a listing title and contact phone number.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/classifieds/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setSubmitSuccess(true);
        setFormData({
          title: '',
          category: 'jobs',
          listing_type: 'offered',
          description: '',
          price_or_salary: '',
          location: '',
          contact_name: '',
          contact_phone: '',
          contact_whatsapp: '',
          contact_email: '',
          image_url: ''
        });
      } else {
        setSubmitError(data.error || 'Failed to submit classified listing.');
      }
    } catch (err: any) {
      setSubmitError(err.message || 'Submission failed. Please check network.');
    } finally {
      setSubmitting(false);
    }
  };

  const getCategoryBadge = (cat: ClassifiedCategory) => {
    switch (cat) {
      case 'jobs':
        return <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">Job Opening</span>;
      case 'rentals':
        return <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">Rental &bull; Housing</span>;
      case 'vehicles':
        return <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">Vehicle Sale</span>;
      case 'documents':
        return <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">Notice &bull; Lost &amp; Found</span>;
      case 'services':
        return <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">Service &bull; Trade</span>;
      default:
        return <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-700 bg-slate-50 px-2 py-0.5 rounded border border-slate-200">Marketplace</span>;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full font-sans">
      {/* Page Hero Banner */}
        <div className="bg-[#0B192C] text-white rounded-2xl p-6 sm:p-10 mb-8 shadow-sm relative overflow-hidden">
          <div className="absolute right-0 top-0 bottom-0 w-1/3 opacity-10 pointer-events-none hidden md:block">
            <Briefcase className="w-full h-full text-white" />
          </div>

          <div className="max-w-2xl relative z-10">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-bold uppercase tracking-wider mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Zunheboto District Community Exchange</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-serif font-black tracking-tight mb-3">
              Local Classifieds &amp; Job Board
            </h1>
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed mb-6">
              Connect directly with local employers, property owners, craftsmen, and fellow residents across Zunheboto town and surrounding rural blocks.
            </p>

            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={() => {
                  setSubmitSuccess(false);
                  setSubmitError('');
                  setIsSubmitModalOpen(true);
                }}
                className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold px-5 py-2.5 rounded-xl text-xs sm:text-sm transition-all shadow-sm cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Post a Classified or Job</span>
              </button>
              <div className="text-xs text-slate-400">
                100% Free • Verified Community Noticeboard
              </div>
            </div>
          </div>
        </div>

        {/* Search & Category Filter Strip */}
        <div className="space-y-4 mb-8">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search jobs, houses for rent, vehicles, or lost documents..."
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-hidden focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Category Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            {CATEGORIES.map((cat) => {
              const Icon = cat.icon;
              const isActive = selectedCat === cat.id;
              const count =
                cat.id === 'all'
                  ? activeListings.length
                  : activeListings.filter((c) => c.category === cat.id).length;

              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCat(cat.id)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                    isActive
                      ? 'bg-[#0B192C] text-white shadow-xs'
                      : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-amber-400' : 'text-slate-500'}`} />
                  <span>{cat.label}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                      isActive ? 'bg-amber-400 text-slate-950' : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Listings Grid */}
        {filteredListings.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center max-w-lg mx-auto">
            <FileQuestion className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="font-serif font-bold text-slate-900 text-lg mb-1">
              No Listings Found
            </h3>
            <p className="text-slate-500 text-xs sm:text-sm mb-6">
              {searchQuery
                ? `No postings match "${searchQuery}". Try a different keyword.`
                : 'There are currently no active listings in this category.'}
            </p>
            <button
              onClick={() => {
                setSelectedCat('all');
                setSearchQuery('');
              }}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold transition-colors cursor-pointer"
            >
              Clear Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredListings.map((item) => (
              <div
                key={item.id}
                onClick={() => handleOpenDetail(item)}
                className="bg-white rounded-xl border border-slate-200 hover:border-amber-400 transition-all duration-200 shadow-xs hover:shadow-md overflow-hidden flex flex-col justify-between cursor-pointer group"
              >
                <div>
                  {item.image_url ? (
                    <div className="h-44 w-full relative overflow-hidden bg-slate-100">
                      <img
                        src={item.image_url}
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                      />
                      <div className="absolute top-2.5 left-2.5">
                        {getCategoryBadge(item.category)}
                      </div>
                      {item.featured && (
                        <div className="absolute top-2.5 right-2.5 bg-amber-500 text-slate-950 text-[10px] font-black uppercase px-2 py-0.5 rounded shadow-xs">
                          Featured
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="p-4 pb-0 flex items-center justify-between">
                      {getCategoryBadge(item.category)}
                      {item.featured && (
                        <span className="bg-amber-100 text-amber-900 text-[10px] font-black uppercase px-2 py-0.5 rounded">
                          Featured
                        </span>
                      )}
                    </div>
                  )}

                  <div className="p-4">
                    <h3 className="font-serif font-bold text-slate-900 text-base leading-snug group-hover:text-amber-700 transition-colors line-clamp-2 mb-2">
                      {item.title}
                    </h3>
                    <p className="text-slate-600 text-xs line-clamp-2 mb-3">
                      {item.description}
                    </p>

                    {item.price_or_salary && (
                      <div className="text-sm font-bold text-emerald-700 mb-2">
                        {item.price_or_salary}
                      </div>
                    )}

                    <div className="flex items-center gap-1 text-[11px] text-slate-500">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{item.location}</span>
                    </div>
                  </div>
                </div>

                <div className="px-4 py-3 bg-slate-50/80 border-t border-slate-100 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5 text-slate-500 text-[11px]">
                    <Clock className="w-3 h-3 text-slate-400" />
                    <span>{new Date(item.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                  </div>

                  <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                    {item.contact_whatsapp && (
                      <a
                        href={`https://wa.me/${item.contact_whatsapp.replace(/[^0-9]/g, '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white transition-colors"
                        title="Chat on WhatsApp"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                      </a>
                    )}
                    {item.contact_phone && (
                      <a
                        href={`tel:${item.contact_phone.replace(/[^0-9+]/g, '')}`}
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-900 text-white transition-colors"
                        title="Call Contact"
                      >
                        <Phone className="w-3.5 h-3.5" />
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

      {/* Listing Detail Modal */}
      {activeListing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="p-4 sm:p-6 border-b border-slate-100 flex items-start justify-between">
              <div>
                <div className="mb-1">{getCategoryBadge(activeListing.category)}</div>
                <h2 className="font-serif font-bold text-slate-900 text-lg sm:text-xl">
                  {activeListing.title}
                </h2>
              </div>
              <button
                onClick={() => setActiveListing(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 sm:p-6 space-y-4 max-h-[70vh] overflow-y-auto">
              {activeListing.image_url && (
                <img
                  src={activeListing.image_url}
                  alt={activeListing.title}
                  className="w-full h-56 object-cover rounded-xl border border-slate-200"
                />
              )}

              {activeListing.price_or_salary && (
                <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-xl flex items-center justify-between">
                  <span className="text-xs font-semibold text-emerald-800">Compensation / Price:</span>
                  <span className="font-bold text-emerald-900 text-base">{activeListing.price_or_salary}</span>
                </div>
              )}

              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Details &amp; Description</h4>
                <p className="text-slate-700 text-sm whitespace-pre-wrap leading-relaxed">
                  {activeListing.description}
                </p>
              </div>

              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2 text-xs">
                <div className="flex items-center gap-2 text-slate-700">
                  <MapPin className="w-4 h-4 text-amber-500 shrink-0" />
                  <span className="font-medium">Location:</span> {activeListing.location}
                </div>
                <div className="flex items-center gap-2 text-slate-700">
                  <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
                  <span className="font-medium">Posted:</span> {new Date(activeListing.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                </div>
                <div className="flex items-center gap-2 text-slate-700">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span className="font-medium">Contact Person:</span> {activeListing.contact_name}
                </div>
              </div>

              <div className="pt-2 flex flex-col sm:flex-row gap-2.5">
                {activeListing.contact_whatsapp && (
                  <a
                    href={`https://wa.me/${activeListing.contact_whatsapp.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`Hello, I saw your listing on Zunheboto Social: ${activeListing.title}`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 rounded-xl text-xs transition-colors"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>WhatsApp Contact</span>
                  </a>
                )}
                {activeListing.contact_phone && (
                  <a
                    href={`tel:${activeListing.contact_phone}`}
                    className="flex-1 flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-bold py-2.5 rounded-xl text-xs transition-colors"
                  >
                    <Phone className="w-4 h-4" />
                    <span>Call {activeListing.contact_phone}</span>
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Post a Classified Modal */}
      {isSubmitModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="p-4 sm:p-6 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h2 className="font-serif font-bold text-slate-900 text-lg sm:text-xl">
                  Post a Free Classified or Job
                </h2>
                <p className="text-slate-500 text-xs">
                  Submissions are reviewed by our editorial desk before publishing.
                </p>
              </div>
              <button
                onClick={() => {
                  setIsSubmitModalOpen(false);
                  if (typeof window !== 'undefined' && window.location.search.includes('submit=1')) {
                    try { window.history.replaceState(null, '', '/classifieds'); } catch (e) {}
                  }
                }}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {submitSuccess ? (
              <div className="p-6 text-center space-y-4">
                <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h3 className="font-serif font-bold text-slate-900 text-lg">
                  Listing Submitted Successfully!
                </h3>
                <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
                  Thank you! Your listing has been received and queued for editorial verification. Once approved, it will be published to the community board.
                </p>
                <button
                  onClick={() => {
                    setIsSubmitModalOpen(false);
                    if (typeof window !== 'undefined' && window.location.search.includes('submit=1')) {
                      try { window.history.replaceState(null, '', '/classifieds'); } catch (e) {}
                    }
                  }}
                  className="bg-[#0B192C] text-white font-bold px-6 py-2 rounded-xl text-xs hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  Close
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-3.5 max-h-[75vh] overflow-y-auto">
                {submitError && (
                  <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{submitError}</span>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Listing Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g. Science Teacher Needed / 2BHK Flat For Rent / Lost College Certificates"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Category *
                    </label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value as ClassifiedCategory })}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs bg-white"
                    >
                      <option value="jobs">Jobs &amp; Employment</option>
                      <option value="rentals">House &amp; Property Rentals</option>
                      <option value="vehicles">Vehicles &amp; Auto</option>
                      <option value="marketplace">Buy &amp; Sell</option>
                      <option value="documents">Lost &amp; Found / Notices</option>
                      <option value="services">Local Services &amp; Trades</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Type
                    </label>
                    <select
                      value={formData.listing_type}
                      onChange={(e) => setFormData({ ...formData, listing_type: e.target.value as 'offered' | 'wanted' })}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs bg-white"
                    >
                      <option value="offered">Offered (Providing/Selling/Hiring)</option>
                      <option value="wanted">Wanted (Looking For/Needed)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Price / Salary / Rate
                    </label>
                    <input
                      type="text"
                      value={formData.price_or_salary}
                      onChange={(e) => setFormData({ ...formData, price_or_salary: e.target.value })}
                      placeholder="e.g. ₹20,000/mo or Negotiable"
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Location / Colony *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      placeholder="e.g. DC Hill / Project Colony"
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Full Description &amp; Details
                  </label>
                  <textarea
                    rows={3}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Provide full details, requirements, specifications, or directions..."
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Your Name / Org *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.contact_name}
                      onChange={(e) => setFormData({ ...formData, contact_name: e.target.value })}
                      placeholder="e.g. Khekato C."
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Phone Number *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.contact_phone}
                      onChange={(e) => setFormData({ ...formData, contact_phone: e.target.value })}
                      placeholder="+91 9436..."
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      WhatsApp Number
                    </label>
                    <input
                      type="text"
                      value={formData.contact_whatsapp}
                      onChange={(e) => setFormData({ ...formData, contact_whatsapp: e.target.value })}
                      placeholder="919436..."
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Photo Image URL (Optional)
                    </label>
                    <input
                      type="url"
                      value={formData.image_url}
                      onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                      placeholder="https://..."
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs"
                    />
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsSubmitModalOpen(false)}
                    className="px-4 py-2 border border-slate-200 text-slate-600 rounded-lg text-xs font-semibold hover:bg-slate-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-5 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-lg text-xs font-bold transition-colors disabled:opacity-50 cursor-pointer"
                  >
                    {submitting ? 'Submitting...' : 'Submit Listing'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
