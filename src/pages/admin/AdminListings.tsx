import React, { useState } from 'react';
import { useCms } from '../../context/CmsContext';
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  RefreshCw,
  Eye,
  ShieldCheck,
  Building,
  MapPin,
  Phone,
  ArrowLeft,
  Upload,
  CheckCircle2,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { Listing } from '../../types';
import { MediaPickerModal } from '../../components/MediaPickerModal';
import { RichTextEditor } from '../../components/RichTextEditor';
import { DraftPreviewModal } from '../../components/admin/DraftPreviewModal';

export const AdminListings: React.FC = () => {
  const {
    listings,
    listingCategories,
    createListing,
    updateListing,
    trashListing,
    restoreListing,
    deleteListingPermanent,
    navigateTo
  } = useCms();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCat, setSelectedCat] = useState('all');
  const [selectedArea, setSelectedArea] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'published' | 'draft' | 'trash'>('all');

  // Form Mode
  const [editingListing, setEditingListing] = useState<Listing | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [mediaPickerOpen, setMediaPickerOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Form Fields
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [categoryId, setCategoryId] = useState(listingCategories[0]?.id || '');
  const [description, setDescription] = useState('');
  const [featuredImage, setFeaturedImage] = useState('');
  const [address, setAddress] = useState('');
  const [selectedAreaType, setSelectedAreaType] = useState('DC Hill');
  const [customAreaName, setCustomAreaName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [website, setWebsite] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [openingHours, setOpeningHours] = useState('Mon - Sat: 9:00 AM - 4:00 PM');
  const [mapUrl, setMapUrl] = useState('');
  const [verified, setVerified] = useState(true);
  const [featured, setFeatured] = useState(false);
  const [status, setStatus] = useState<'published' | 'draft' | 'trash'>('published');
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewData, setPreviewData] = useState<Listing | null>(null);

  const standardAreasList = [
    'DC Hill',
    'North Point',
    'South Point East',
    'South Point West',
    'Amiphoto',
    'Old Town',
    'New Colony',
    'Project Colony',
    'Laghilato',
    'Khuwoboto',
    'Alahuto'
  ];

  const cleanContentForEditor = (str?: string): string => {
    if (!str) return '';
    return str.split('\n').map((l) => l.replace(/^[ \t]{2,}/, '')).join('\n').trim();
  };

  const startCreate = () => {
    setSaveError(null);
    setName('');
    setSlug('');
    setCategoryId(listingCategories[0]?.id || '');
    setDescription('');
    setFeaturedImage('https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80');
    setAddress('Main Road, Zunheboto, Nagaland');
    setSelectedAreaType('DC Hill');
    setCustomAreaName('');
    setPhone('');
    setEmail('');
    setWebsite('');
    setWhatsapp('');
    setOpeningHours('Mon - Sat: 9:00 AM - 4:00 PM');
    setMapUrl('');
    setVerified(true);
    setFeatured(false);
    setStatus('published');
    setEditingListing(null);
    setIsCreating(true);
  };

  const startEdit = (item: Listing) => {
    setSaveError(null);
    setName(item.name);
    setSlug(item.slug);
    setCategoryId(item.category_id);
    setDescription(cleanContentForEditor(item.description));
    setFeaturedImage(item.featured_image);
    setAddress(item.address);
    const itemArea = item.location_area || 'DC Hill';
    if (standardAreasList.includes(itemArea)) {
      setSelectedAreaType(itemArea);
      setCustomAreaName('');
    } else {
      setSelectedAreaType('Others');
      setCustomAreaName(itemArea);
    }
    setPhone(item.phone || '');
    setEmail(item.email || '');
    setWebsite(item.website || '');
    setWhatsapp(item.whatsapp || '');
    setOpeningHours(item.opening_hours || '');
    setMapUrl(item.map_url || '');
    setVerified(item.verified);
    setFeatured(item.featured || false);
    setStatus(item.status);
    setEditingListing(item);
    setIsCreating(false);
  };

  const handleSave = async (e: React.FormEvent, overrideStatus?: 'published' | 'draft') => {
    e.preventDefault();
    if (!name.trim()) return;

    const targetStatus = overrideStatus || status;
    const finalArea = selectedAreaType === 'Others' ? customAreaName.trim() : selectedAreaType;
    if (!finalArea) {
      setSaveError('Please enter a custom area or select a colony.');
      return;
    }

    setSaveError(null);
    setIsSaving(true);

    const cleanSlug =
      slug.trim() ||
      name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '');

    try {
      if (editingListing) {
        await updateListing(editingListing.id, {
          name: name.trim(),
          slug: cleanSlug,
          category_id: categoryId,
          description: description.trim(),
          featured_image: featuredImage.trim(),
          address: address.trim(),
          location_area: finalArea,
          phone: phone.trim(),
          email: email.trim(),
          website: website.trim(),
          whatsapp: whatsapp.trim(),
          opening_hours: openingHours.trim(),
          map_url: mapUrl.trim(),
          verified,
          featured,
          status: targetStatus
        });
        setEditingListing(null);
      } else {
        await createListing({
          name: name.trim(),
          slug: cleanSlug,
          category_id: categoryId,
          description: description.trim(),
          featured_image: featuredImage.trim(),
          address: address.trim(),
          location_area: finalArea,
          phone: phone.trim(),
          email: email.trim(),
          website: website.trim(),
          whatsapp: whatsapp.trim(),
          opening_hours: openingHours.trim(),
          map_url: mapUrl.trim(),
          verified,
          featured,
          status: targetStatus
        });
        setIsCreating(false);
      }
    } catch (err: any) {
      console.error('Failed to save listing:', err);
      setSaveError(err.message || 'Failed to save listing to server.');
    } finally {
      setIsSaving(false);
    }
  };

  const allFilterAreas = Array.from(
    new Set([
      ...standardAreasList,
      ...listings.map((l) => l.location_area).filter(Boolean)
    ])
  );

  const filteredListings = listings.filter((item) => {
    const q = (searchQuery || '').toLowerCase();
    const matchesSearch =
      (item.name || '').toLowerCase().includes(q) ||
      (item.address || '').toLowerCase().includes(q) ||
      (item.phone || '').includes(searchQuery);
    const matchesCat = selectedCat === 'all' || item.category_id === selectedCat;
    const matchesArea = selectedArea === 'all' || item.location_area === selectedArea;
    const matchesStatus = selectedStatus === 'all' || item.status === selectedStatus;
    return matchesSearch && matchesCat && matchesArea && matchesStatus;
  });

  if (isCreating || editingListing) {
    return (
      <div className="space-y-6 font-sans">
        <div className="flex items-center justify-between pb-4 border-b border-slate-200">
          <button
            type="button"
            onClick={() => {
              setIsCreating(false);
              setEditingListing(null);
            }}
            className="flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Directory List</span>
          </button>
          <h2 className="text-xl font-serif font-bold text-[#0B192C]">
            {editingListing ? 'Edit Directory Listing' : 'Add New District Listing'}
          </h2>
        </div>

        {saveError && (
          <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2 text-xs font-semibold text-rose-700">
            <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
            <span>{saveError}</span>
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Col */}
            <div className="lg:col-span-8 space-y-6">
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Organization / Business Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);
                      if (!editingListing) {
                        setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, ''));
                      }
                    }}
                    placeholder="e.g. District Hospital Zunheboto"
                    className="w-full px-4 py-2.5 text-base font-bold text-[#0B192C] rounded-xl border border-slate-300 focus:outline-none focus:border-amber-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    Slug (URL Key)
                  </label>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-400 font-mono">/listing/</span>
                    <input
                      type="text"
                      value={slug}
                      onChange={(e) => setSlug(e.target.value)}
                      className="flex-1 px-3 py-1.5 text-xs font-mono rounded-lg border border-slate-300 focus:outline-none focus:border-amber-600"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Description &amp; Services Overview <span className="text-slate-400 font-normal">(Supports Plain Text, Markdown &amp; HTML)</span>
                  </label>
                  <RichTextEditor
                    value={description}
                    onChange={setDescription}
                    placeholder="Describe services, departments, facilities, or offerings (Plain text, Markdown, or HTML supported)..."
                    minHeight="220px"
                    id="listing-description-editor"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Full Street Address <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="e.g. Hospital Colony, Main Road"
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs focus:outline-none focus:border-amber-600"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Colony / Location Area <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={selectedAreaType}
                      onChange={(e) => setSelectedAreaType(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs font-semibold text-slate-800 focus:outline-none focus:border-amber-600"
                    >
                      {standardAreasList.map((a) => (
                        <option key={a} value={a}>
                          {a}
                        </option>
                      ))}
                      <option value="Others">Others (Enter Custom Area)</option>
                    </select>

                    {selectedAreaType === 'Others' && (
                      <div className="mt-2">
                        <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                          Custom Colony / Area Name <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={customAreaName}
                          onChange={(e) => setCustomAreaName(e.target.value)}
                          placeholder="Type custom colony / area name..."
                          className="w-full px-3 py-2 rounded-lg border border-amber-300 bg-amber-50/40 text-xs text-slate-900 focus:outline-none focus:border-amber-600 font-medium"
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Contact & Hours Card */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
                <h3 className="text-sm font-serif font-bold text-[#0B192C] pb-2 border-b border-slate-100">
                  Contact Coordinates
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Phone Number <span className="text-slate-400 font-normal">(Optional)</span>
                    </label>
                    <input
                      type="text"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+91 3867 220000 (Optional)"
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs focus:outline-none focus:border-amber-600"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      WhatsApp Number
                    </label>
                    <input
                      type="text"
                      value={whatsapp}
                      onChange={(e) => setWhatsapp(e.target.value)}
                      placeholder="+91 9436..."
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs focus:outline-none focus:border-amber-600"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="office@department.org"
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs focus:outline-none focus:border-amber-600"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Website URL
                    </label>
                    <input
                      type="url"
                      value={website}
                      onChange={(e) => setWebsite(e.target.value)}
                      placeholder="https://..."
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs font-mono focus:outline-none focus:border-amber-600"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Visiting / Opening Hours
                    </label>
                    <input
                      type="text"
                      value={openingHours}
                      onChange={(e) => setOpeningHours(e.target.value)}
                      placeholder="Mon - Sat: 9:00 AM - 4:00 PM"
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs focus:outline-none focus:border-amber-600"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Google Maps Link (Directions)
                    </label>
                    <input
                      type="url"
                      value={mapUrl}
                      onChange={(e) => setMapUrl(e.target.value)}
                      placeholder="https://maps.google.com/..."
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs font-mono focus:outline-none focus:border-amber-600"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Right Col */}
            <div className="lg:col-span-4 space-y-6">
              {/* Publishing & Badges */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
                <h3 className="text-sm font-serif font-bold text-[#0B192C] pb-2 border-b border-slate-100">
                  Directory Settings
                </h3>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Category <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs font-semibold text-slate-800 focus:outline-none focus:border-amber-600"
                  >
                    {listingCategories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Status
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs font-semibold text-slate-800 focus:outline-none focus:border-amber-600"
                  >
                    <option value="published">Published</option>
                    <option value="draft">Draft</option>
                    <option value="trash">Trash</option>
                  </select>
                </div>

                <div className="space-y-2 pt-2 border-t border-slate-100">
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-800">
                    <input
                      type="checkbox"
                      checked={verified}
                      onChange={(e) => setVerified(e.target.checked)}
                      className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
                    />
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span>Mark as Verified District Record</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-800">
                    <input
                      type="checkbox"
                      checked={featured}
                      onChange={(e) => setFeatured(e.target.checked)}
                      className="w-4 h-4 rounded text-amber-600 focus:ring-amber-500"
                    />
                    <span>Highlight as Featured Listing</span>
                  </label>
                </div>

                <div className="pt-4 border-t border-slate-100 flex flex-col gap-2">
                  <div className="flex gap-2">
                    <button
                      type="submit"
                      disabled={isSaving}
                      className="flex-1 py-3 bg-[#0B192C] hover:bg-[#1E2A38] text-white font-bold rounded-xl text-xs transition-colors cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {isSaving ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin text-amber-400" />
                          <span>Saving Listing...</span>
                        </>
                      ) : (
                        <span>{editingListing ? 'Save Changes' : 'Publish Listing'}</span>
                      )}
                    </button>
                    <button
                      type="button"
                      disabled={isSaving}
                      onClick={(e) => handleSave(e, 'draft')}
                      className="px-4 py-3 bg-amber-50 hover:bg-amber-100 border border-amber-300 text-amber-900 font-bold rounded-xl text-xs transition-colors cursor-pointer disabled:opacity-50"
                      title="Save as unpublished draft"
                    >
                      Save as Draft
                    </button>
                  </div>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        const finalArea = selectedAreaType === 'Others' ? customAreaName.trim() : selectedAreaType;
                        setPreviewData({
                          id: editingListing?.id || 'temp_preview',
                          name: name.trim() || 'Untitled Listing',
                          slug: slug.trim() || 'preview-listing',
                          category_id: categoryId,
                          category_name: listingCategories.find((c) => c.id === categoryId)?.name || 'General',
                          description,
                          featured_image: featuredImage,
                          address,
                          location_area: finalArea || 'DC Hill',
                          phone,
                          email,
                          website,
                          whatsapp,
                          opening_hours: openingHours,
                          map_url: mapUrl,
                          verified,
                          featured,
                          status,
                          views: editingListing?.views || 1
                        });
                        setPreviewOpen(true);
                      }}
                      className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-xl text-xs transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <Eye className="w-3.5 h-3.5 text-slate-600" />
                      <span>Preview Draft</span>
                    </button>
                    <button
                      type="button"
                      disabled={isSaving}
                      onClick={() => {
                        setIsCreating(false);
                        setEditingListing(null);
                      }}
                      className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs transition-colors cursor-pointer disabled:opacity-50"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>

              {/* Photo Card */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <h3 className="text-sm font-serif font-bold text-[#0B192C]">
                    Listing Photo
                  </h3>
                  <button
                    type="button"
                    onClick={() => setMediaPickerOpen(true)}
                    className="text-xs text-amber-700 font-bold hover:underline"
                  >
                    Select Photo
                  </button>
                </div>

                {featuredImage ? (
                  <div className="space-y-2">
                    <img
                      src={featuredImage}
                      alt="Listing"
                      className="w-full h-36 object-cover rounded-lg border border-slate-200"
                    />
                    <button
                      type="button"
                      onClick={() => setFeaturedImage('')}
                      className="text-[11px] text-rose-600 font-semibold hover:underline"
                    >
                      Remove photo
                    </button>
                  </div>
                ) : (
                  <div
                    onClick={() => setMediaPickerOpen(true)}
                    className="border-2 border-dashed border-slate-300 hover:border-amber-500 rounded-xl p-6 text-center cursor-pointer bg-slate-50 text-slate-500 text-xs"
                  >
                    <Upload className="w-6 h-6 mx-auto mb-1 text-slate-400" />
                    <span>Upload facade or office photo</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </form>

        <MediaPickerModal
          isOpen={mediaPickerOpen}
          onClose={() => setMediaPickerOpen(false)}
          onSelect={(url) => setFeaturedImage(url)}
          title="Select Photo for Directory Listing"
        />
      </div>
    );
  }

  return (
    <div className="space-y-6 font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-serif font-bold text-[#0B192C]">
            Directory Listings
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage commercial businesses, civic centers, clinics, and government services.
          </p>
        </div>

        <button
          onClick={startCreate}
          className="px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-bold rounded-xl transition-all shadow-xs flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Listing</span>
        </button>
      </div>

      {/* Filter bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative flex-1 w-full">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search listings by name, address, or phone..."
            className="w-full px-3.5 py-2 pl-9 rounded-lg border border-slate-300 text-xs focus:outline-none focus:border-amber-600"
          />
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <select
            value={selectedCat}
            onChange={(e) => setSelectedCat(e.target.value)}
            className="px-3 py-2 rounded-lg border border-slate-300 text-xs font-semibold text-slate-700 bg-white"
          >
            <option value="all">All Categories</option>
            {listingCategories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          <select
            value={selectedArea}
            onChange={(e) => setSelectedArea(e.target.value)}
            className="px-3 py-2 rounded-lg border border-slate-300 text-xs font-semibold text-slate-700 bg-white"
          >
            <option value="all">All Areas</option>
            {allFilterAreas.map((a) => (
              <option key={a} value={a}>
                {a}
              </option>
            ))}
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value as any)}
            className="px-3 py-2 rounded-lg border border-slate-300 text-xs font-semibold text-slate-700 bg-white"
          >
            <option value="all">All Statuses</option>
            <option value="published">Published</option>
            <option value="draft">Drafts</option>
            <option value="trash">Trash</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-500">
              <tr>
                <th className="px-5 py-3">Listing Name</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Area</th>
                <th className="px-4 py-3">Phone</th>
                <th className="px-4 py-3">Verified</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredListings.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-slate-400">
                    No directory records found.
                  </td>
                </tr>
              ) : (
                filteredListings.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg overflow-hidden bg-slate-100 shrink-0 border border-slate-200">
                          <img src={item.featured_image} alt={item.name} className="w-full h-full object-cover" />
                        </div>
                        <div className="min-w-0 max-w-xs">
                          <div className="font-bold text-slate-900 truncate hover:text-amber-700 cursor-pointer" onClick={() => startEdit(item)}>
                            {item.name}
                          </div>
                          <div className="text-[11px] text-slate-400 truncate">
                            {item.address}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <span className="bg-slate-100 text-slate-700 font-semibold px-2 py-0.5 rounded text-[10px] uppercase">
                        {item.category_name}
                      </span>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-slate-700 font-medium">
                      {item.location_area}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-slate-600 font-mono text-[11px]">
                      {item.phone || <span className="text-slate-400 italic">None</span>}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      {item.verified ? (
                        <span className="flex items-center gap-1 text-emerald-700 font-bold text-[11px]">
                          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> Verified
                        </span>
                      ) : (
                        <span className="text-slate-400 text-[11px]">Unverified</span>
                      )}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-0.5 rounded font-bold text-[10px] uppercase ${
                          item.status === 'published'
                            ? 'bg-emerald-100 text-emerald-800'
                            : item.status === 'draft'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {item.status}
                      </span>
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap text-right space-x-1">
                      <button
                        onClick={() => startEdit(item)}
                        className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded transition-colors cursor-pointer"
                        title="Edit Listing"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          setPreviewData(item);
                          setPreviewOpen(true);
                        }}
                        className="p-1.5 text-slate-600 hover:text-amber-700 hover:bg-slate-100 rounded transition-colors cursor-pointer"
                        title={item.status === 'draft' ? 'Preview Draft' : 'Preview Listing'}
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                      {item.status === 'trash' ? (
                        <>
                          <button
                            onClick={async () => {
                              try {
                                await restoreListing(item.id);
                              } catch (err) {
                                alert('Failed to restore listing');
                              }
                            }}
                            className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded"
                            title="Restore"
                          >
                            <RefreshCw className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={async () => {
                              if (confirm('Permanently delete listing? This cannot be undone.')) {
                                try {
                                  await deleteListingPermanent(item.id);
                                } catch (err) {
                                  alert('Failed to delete listing');
                                }
                              }
                            }}
                            className="p-1.5 text-rose-600 hover:bg-rose-50 rounded"
                            title="Delete Permanent"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={async () => {
                            try {
                              await trashListing(item.id);
                            } catch (err) {
                              alert('Failed to move listing to trash');
                            }
                          }}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"
                          title="Move to Trash"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <DraftPreviewModal
        isOpen={previewOpen}
        onClose={() => {
          setPreviewOpen(false);
          setPreviewData(null);
        }}
        type="listing"
        data={
          previewData || {
            name,
            slug,
            address,
            location_area: selectedAreaType === 'Others' ? customAreaName.trim() : selectedAreaType,
            phone,
            email,
            website,
            whatsapp,
            opening_hours: openingHours,
            description,
            featured_image: featuredImage,
            verified,
            status
          }
        }
      />
    </div>
  );
};
