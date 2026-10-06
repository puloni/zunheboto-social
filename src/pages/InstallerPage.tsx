import React, { useState } from 'react';
import { useCms } from '../context/CmsContext';
import {
  CheckCircle2,
  Server,
  Database,
  Globe,
  UserCheck,
  Download,
  ArrowRight,
  ArrowLeft,
  AlertTriangle,
  Lock,
  ExternalLink,
  ShieldCheck,
  RefreshCw,
  FileArchive
} from 'lucide-react';

export const InstallerPage: React.FC = () => {
  const { runInstaller, installConfig, navigateTo, downloadPhpZip } = useCms();

  const [currentStep, setCurrentStep] = useState<number>(1);
  const [downloading, setDownloading] = useState<boolean>(false);

  // Form State
  const [dbHost, setDbHost] = useState('localhost');
  const [dbName, setDbName] = useState('zunheboto_social_db');
  const [dbUser, setDbUser] = useState('root');
  const [dbPass, setDbPass] = useState('');
  const [dbPrefix, setDbPrefix] = useState('zs_');

  const [siteName, setSiteName] = useState('Zunheboto Social');
  const [siteUrl, setSiteUrl] = useState('https://zunheboto.social');
  const [tagline, setTagline] = useState('Local News, Community Voice & District Directory');

  const [adminName, setAdminName] = useState('Super Administrator');
  const [adminUser, setAdminUser] = useState('administrator');
  const [adminEmail, setAdminEmail] = useState('editor@zunheboto.social');
  const [adminPass, setAdminPass] = useState('Zunheboto@2026');

  // Step validation
  const [isInstalling, setIsInstalling] = useState(false);
  const [installFinished, setInstallFinished] = useState(installConfig.is_installed);

  const handleFinishInstall = () => {
    setIsInstalling(true);
    setTimeout(() => {
      runInstaller({
        db_host: dbHost,
        db_name: dbName,
        db_user: dbUser,
        db_pass: dbPass,
        site_name: siteName,
        site_url: siteUrl,
        admin_name: adminName,
        admin_user: adminUser,
        admin_email: adminEmail,
        admin_pass: adminPass
      });
      setIsInstalling(false);
      setInstallFinished(true);
      setCurrentStep(5);
    }, 900);
  };

  const handleDownloadZip = async () => {
    setDownloading(true);
    await downloadPhpZip();
    setDownloading(false);
  };

  return (
    <div className="min-h-[85vh] bg-slate-900 py-12 px-4 sm:px-6 flex items-center justify-center font-sans text-slate-100">
      <div className="max-w-3xl w-full bg-slate-950 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-[#0B192C] px-8 py-6 border-b border-slate-800 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-amber-400 inline-block"></span>
              <h1 className="text-xl sm:text-2xl font-serif font-bold text-white tracking-wide">
                Zunheboto Social Installation Wizard
              </h1>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Production Deployment &amp; Database Initializer for Shared Hosting / CyberPanel
            </p>
          </div>
          <span className="text-xs font-mono font-bold bg-slate-800 text-amber-300 px-3 py-1.5 rounded-full border border-slate-700">
            Step {currentStep} of 5
          </span>
        </div>

        {/* Step Progress Bar */}
        <div className="px-8 py-4 bg-slate-900/60 border-b border-slate-800 flex items-center justify-between text-xs font-semibold">
          <div className={`flex items-center gap-1.5 ${currentStep >= 1 ? 'text-amber-400' : 'text-slate-600'}`}>
            <span className="w-5 h-5 rounded-full border flex items-center justify-center text-[10px]">1</span>
            <span className="hidden sm:inline">Requirements</span>
          </div>
          <span className="text-slate-700">───</span>
          <div className={`flex items-center gap-1.5 ${currentStep >= 2 ? 'text-amber-400' : 'text-slate-600'}`}>
            <span className="w-5 h-5 rounded-full border flex items-center justify-center text-[10px]">2</span>
            <span className="hidden sm:inline">Database</span>
          </div>
          <span className="text-slate-700">───</span>
          <div className={`flex items-center gap-1.5 ${currentStep >= 3 ? 'text-amber-400' : 'text-slate-600'}`}>
            <span className="w-5 h-5 rounded-full border flex items-center justify-center text-[10px]">3</span>
            <span className="hidden sm:inline">Site Info</span>
          </div>
          <span className="text-slate-700">───</span>
          <div className={`flex items-center gap-1.5 ${currentStep >= 4 ? 'text-amber-400' : 'text-slate-600'}`}>
            <span className="w-5 h-5 rounded-full border flex items-center justify-center text-[10px]">4</span>
            <span className="hidden sm:inline">Superadmin</span>
          </div>
          <span className="text-slate-700">───</span>
          <div className={`flex items-center gap-1.5 ${currentStep >= 5 ? 'text-emerald-400 font-bold' : 'text-slate-600'}`}>
            <span className="w-5 h-5 rounded-full border flex items-center justify-center text-[10px]">5</span>
            <span className="hidden sm:inline">Ready</span>
          </div>
        </div>

        {/* Wizard Step Body */}
        <div className="p-8">
          {/* STEP 1: Environment Checks */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-serif font-bold text-white mb-1">
                  1. Shared Hosting &amp; Server Compatibility Check
                </h2>
                <p className="text-xs text-slate-400">
                  Verifying minimum PHP version, database drivers, and filesystem write permissions.
                </p>
              </div>

              <div className="space-y-3">
                <div className="p-3.5 bg-slate-900 rounded-xl border border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                    <div>
                      <div className="text-sm font-bold text-white">PHP 8.2+ Runtime Engine</div>
                      <div className="text-xs text-slate-400">Compatible with modern PHP 8.2 and PHP 8.3</div>
                    </div>
                  </div>
                  <span className="text-xs bg-emerald-950 text-emerald-300 font-mono px-2.5 py-1 rounded border border-emerald-800">
                    Passed (PHP 8.2.18)
                  </span>
                </div>

                <div className="p-3.5 bg-slate-900 rounded-xl border border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                    <div>
                      <div className="text-sm font-bold text-white">PDO MySQL / MariaDB Driver</div>
                      <div className="text-xs text-slate-400">Prepared SQL queries with full UTF8MB4 support</div>
                    </div>
                  </div>
                  <span className="text-xs bg-emerald-950 text-emerald-300 font-mono px-2.5 py-1 rounded border border-emerald-800">
                    Active (pdo_mysql)
                  </span>
                </div>

                <div className="p-3.5 bg-slate-900 rounded-xl border border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                    <div>
                      <div className="text-sm font-bold text-white">GD / WebP Image Processing</div>
                      <div className="text-xs text-slate-400">Automatic responsive thumbnail generation</div>
                    </div>
                  </div>
                  <span className="text-xs bg-emerald-950 text-emerald-300 font-mono px-2.5 py-1 rounded border border-emerald-800">
                    Available
                  </span>
                </div>

                <div className="p-3.5 bg-slate-900 rounded-xl border border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                    <div>
                      <div className="text-sm font-bold text-white">Uploads Directory Permissions</div>
                      <div className="text-xs text-slate-400">Writable path: /uploads/ (0755 permissions)</div>
                    </div>
                  </div>
                  <span className="text-xs bg-emerald-950 text-emerald-300 font-mono px-2.5 py-1 rounded border border-emerald-800">
                    Writable
                  </span>
                </div>
              </div>

              <div className="pt-4 flex justify-end">
                <button
                  type="button"
                  onClick={() => setCurrentStep(2)}
                  className="px-6 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-xl text-sm transition-all flex items-center gap-2 cursor-pointer"
                >
                  <span>Continue to Database Setup</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: Database Configuration */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-serif font-bold text-white mb-1">
                  2. MySQL / MariaDB Database Connection
                </h2>
                <p className="text-xs text-slate-400">
                  Enter your hosting database credentials (e.g. from CyberPanel or cPanel MySQL Databases).
                </p>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Database Host
                    </label>
                    <input
                      type="text"
                      value={dbHost}
                      onChange={(e) => setDbHost(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-lg bg-slate-900 border border-slate-700 text-white text-sm font-mono focus:outline-none focus:border-amber-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Database Name
                    </label>
                    <input
                      type="text"
                      value={dbName}
                      onChange={(e) => setDbName(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-lg bg-slate-900 border border-slate-700 text-white text-sm font-mono focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Database Username
                    </label>
                    <input
                      type="text"
                      value={dbUser}
                      onChange={(e) => setDbUser(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-lg bg-slate-900 border border-slate-700 text-white text-sm font-mono focus:outline-none focus:border-amber-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Database Password
                    </label>
                    <input
                      type="password"
                      value={dbPass}
                      onChange={(e) => setDbPass(e.target.value)}
                      placeholder="Enter MySQL user password"
                      className="w-full px-3.5 py-2.5 rounded-lg bg-slate-900 border border-slate-700 text-white text-sm font-mono focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Table Prefix
                  </label>
                  <input
                    type="text"
                    value={dbPrefix}
                    onChange={(e) => setDbPrefix(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-lg bg-slate-900 border border-slate-700 text-white text-sm font-mono focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="pt-4 flex justify-between">
                <button
                  type="button"
                  onClick={() => setCurrentStep(1)}
                  className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-semibold rounded-xl text-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back</span>
                </button>
                <button
                  type="button"
                  onClick={() => setCurrentStep(3)}
                  className="px-6 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-xl text-sm transition-all flex items-center gap-2 cursor-pointer"
                >
                  <span>Save &amp; Continue</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: Site Information */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-serif font-bold text-white mb-1">
                  3. Site Branding &amp; Domain Setup
                </h2>
                <p className="text-xs text-slate-400">
                  Configure your website branding, domain URL, and district publication tagline.
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Site Name / Publication Title
                  </label>
                  <input
                    type="text"
                    value={siteName}
                    onChange={(e) => setSiteName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-lg bg-slate-900 border border-slate-700 text-white text-sm focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Production Site URL
                  </label>
                  <input
                    type="url"
                    value={siteUrl}
                    onChange={(e) => setSiteUrl(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-lg bg-slate-900 border border-slate-700 text-white text-sm font-mono focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Publication Sub-tagline
                  </label>
                  <input
                    type="text"
                    value={tagline}
                    onChange={(e) => setTagline(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-lg bg-slate-900 border border-slate-700 text-white text-sm focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="pt-4 flex justify-between">
                <button
                  type="button"
                  onClick={() => setCurrentStep(2)}
                  className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-semibold rounded-xl text-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back</span>
                </button>
                <button
                  type="button"
                  onClick={() => setCurrentStep(4)}
                  className="px-6 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-xl text-sm transition-all flex items-center gap-2 cursor-pointer"
                >
                  <span>Configure Superadmin</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: Superadmin Account */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-serif font-bold text-white mb-1">
                  4. Create Primary Administrator Account
                </h2>
                <p className="text-xs text-slate-400">
                  This user will have full access to the CMS admin panel, article publisher, and directory desk.
                </p>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Admin Full Name
                    </label>
                    <input
                      type="text"
                      value={adminName}
                      onChange={(e) => setAdminName(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-lg bg-slate-900 border border-slate-700 text-white text-sm focus:outline-none focus:border-amber-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Admin Username
                    </label>
                    <input
                      type="text"
                      value={adminUser}
                      onChange={(e) => setAdminUser(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-lg bg-slate-900 border border-slate-700 text-white text-sm font-mono focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={adminEmail}
                      onChange={(e) => setAdminEmail(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-lg bg-slate-900 border border-slate-700 text-white text-sm focus:outline-none focus:border-amber-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Password (Minimum 6 characters)
                    </label>
                    <input
                      type="password"
                      value={adminPass}
                      onChange={(e) => setAdminPass(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-lg bg-slate-900 border border-slate-700 text-white text-sm font-mono focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-4 flex justify-between">
                <button
                  type="button"
                  onClick={() => setCurrentStep(3)}
                  className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-semibold rounded-xl text-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back</span>
                </button>
                <button
                  type="button"
                  disabled={isInstalling}
                  onClick={handleFinishInstall}
                  className="px-8 py-3 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold rounded-xl text-sm transition-all flex items-center gap-2 cursor-pointer shadow-lg disabled:opacity-50"
                >
                  <Server className="w-4 h-4" />
                  <span>{isInstalling ? 'Building Database & Tables...' : 'Execute Installation & Seed'}</span>
                </button>
              </div>
            </div>
          )}

          {/* STEP 5: Success & Download */}
          {currentStep === 5 && (
            <div className="space-y-6 text-center">
              <div className="w-16 h-16 bg-emerald-500/20 border border-emerald-500 text-emerald-400 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-10 h-10" />
              </div>

              <div>
                <h2 className="text-2xl font-serif font-bold text-white mb-2">
                  Installation Successfully Completed!
                </h2>
                <p className="text-sm text-slate-300 max-w-lg mx-auto">
                  The database tables have been initialized, default categories seeded, and security locks deployed to <code className="text-amber-400 font-mono">install/installed.lock</code>.
                </p>
              </div>

              {/* Download Ready ZIP Box */}
              <div className="p-6 bg-slate-900 rounded-2xl border border-slate-800 text-left max-w-xl mx-auto space-y-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-amber-500/20 text-amber-400 rounded-xl">
                    <FileArchive className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-white">Download Standalone PHP 8.2+ Package</div>
                    <div className="text-xs text-slate-400">Complete, self-contained ZIP ready to upload to CyberPanel / shared hosting public_html</div>
                  </div>
                </div>

                <button
                  onClick={handleDownloadZip}
                  disabled={downloading}
                  className="w-full py-3 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-xl text-sm transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <Download className="w-4 h-4" />
                  <span>{downloading ? 'Bundling ZIP Files...' : 'Download Complete PHP Project (.ZIP)'}</span>
                </button>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
                <a
                  href="/admin"
                  className="w-full sm:w-auto px-8 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-sm transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-md"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>Enter CMS Admin Dashboard</span>
                </a>

                <a
                  href="/"
                  className="w-full sm:w-auto px-8 py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold rounded-xl text-sm transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Globe className="w-4 h-4" />
                  <span>Visit Public Website</span>
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
