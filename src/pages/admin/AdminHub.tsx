import React, { useState } from 'react';
import { useCms } from '../../context/CmsContext';
import { AdminLogin } from './AdminLogin';
import { AdminLayout } from './AdminLayout';
import { AdminDashboard } from './AdminDashboard';
import { AdminArticles } from './AdminArticles';
import { AdminArticleCategories } from './AdminArticleCategories';
import { AdminListings } from './AdminListings';
import { AdminListingCategories } from './AdminListingCategories';
import { AdminPages } from './AdminPages';
import { AdminMedia } from './AdminMedia';
import { AdminGallery } from './AdminGallery';
import { AdminHomepageBuilder } from './AdminHomepageBuilder';
import { AdminMenus } from './AdminMenus';
import { AdminHotlines } from './AdminHotlines';
import { AdminNewsTips } from './AdminNewsTips';
import { AdminNewsletter } from './AdminNewsletter';
import { AdminFooter } from './AdminFooter';
import { AdminSettings } from './AdminSettings';
import { AdminStorageSettings } from './AdminStorageSettings';
import { AdminProfile } from './AdminProfile';
import { AdminUsers } from './AdminUsers';
import { AdminClassifieds } from './AdminClassifieds';
import { AdminSponsoredAds } from './AdminSponsoredAds';

export const AdminHub: React.FC = () => {
  const { isAuthenticated } = useCms();
  const [activeTab, setActiveTab] = useState<string>('dashboard');

  if (!isAuthenticated) {
    return <AdminLogin />;
  }

  return (
    <AdminLayout activeTab={activeTab} onSelectTab={setActiveTab}>
      {activeTab === 'dashboard' && <AdminDashboard onNavigateTab={setActiveTab} />}
      {activeTab === 'articles' && <AdminArticles />}
      {activeTab === 'article_categories' && <AdminArticleCategories />}
      {activeTab === 'classifieds' && <AdminClassifieds />}
      {activeTab === 'sponsored_ads' && <AdminSponsoredAds />}
      {activeTab === 'users' && <AdminUsers />}
      {activeTab === 'listings' && <AdminListings />}
      {activeTab === 'listing_categories' && <AdminListingCategories />}
      {activeTab === 'pages' && <AdminPages />}
      {activeTab === 'media' && <AdminMedia />}
      {activeTab === 'gallery' && <AdminGallery />}
      {activeTab === 'homepage_builder' && <AdminHomepageBuilder />}
      {activeTab === 'footer' && <AdminFooter />}
      {activeTab === 'menus' && <AdminMenus />}
      {activeTab === 'hotlines' && <AdminHotlines />}
      {activeTab === 'news_tips' && <AdminNewsTips />}
      {activeTab === 'newsletter' && <AdminNewsletter />}
      {activeTab === 'settings' && <AdminSettings />}
      {activeTab === 'storage' && <AdminStorageSettings />}
      {activeTab === 'profile' && <AdminProfile />}
    </AdminLayout>
  );
};
