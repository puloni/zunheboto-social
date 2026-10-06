import React, { useState, useEffect } from 'react';
import {
  Database,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Server,
  HardDrive,
  FileCode,
  ShieldCheck,
  ArrowRight,
  Eye,
  EyeOff,
  Layers,
  Terminal,
  ExternalLink
} from 'lucide-react';
import { useCms } from '../../context/CmsContext';

interface StorageStatusResponse {
  mode: 'json' | 'database';
  isConnected: boolean;
  message: string;
  config: {
    mode: 'json' | 'database';
    host: string;
    port: number;
    database: string;
    user: string;
    passwordMasked: string;
    hasPassword: boolean;
  };
  jsonFileSize: number;
  jsonRecordCounts: Record<string, number>;
  dbRecordCounts?: Record<string, number>;
  lastUpdated: string;
}

export const AdminStorageSettings: React.FC = () => {
  const { reloadFromStorage } = useCms();

  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<StorageStatusResponse | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  // Form State
  const [selectedMode, setSelectedMode] = useState<'json' | 'database'>('json');
  const [dbHost, setDbHost] = useState('localhost');
  const [dbPort, setDbPort] = useState('3306');
  const [dbName, setDbName] = useState('');
  const [dbUser, setDbUser] = useState('');
  const [dbPassword, setDbPassword] = useState('');

  // Action states
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string; version?: string } | null>(null);

  const [saving, setSaving] = useState(false);
  const [saveResult, setSaveResult] = useState<{ success: boolean; message: string } | null>(null);

  const [initializing, setInitializing] = useState(false);
  const [initResult, setInitResult] = useState<{ success: boolean; message: string } | null>(null);

  const [migrating, setMigrating] = useState(false);
  const [migrateResult, setMigrateResult] = useState<{ success: boolean; message: string; counts?: Record<string, number> } | null>(null);

  const fetchStatus = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/storage/status');
      const data = await res.json();
      if (data.success && data.status) {
        setStatus(data.status);
        setSelectedMode(data.status.mode);
        if (data.status.config) {
          setDbHost(data.status.config.host || 'localhost');
          setDbPort(String(data.status.config.port || 3306));
          setDbName(data.status.config.database || '');
          setDbUser(data.status.config.user || '');
        }
      }
    } catch (err) {
      console.error('Failed to load storage status:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  const handleTestConnection = async () => {
    setTesting(true);
    setTestResult(null);
    try {
      const res = await fetch('/api/admin/storage/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          host: dbHost,
          port: parseInt(dbPort, 10) || 3306,
          database: dbName,
          user: dbUser,
          password: dbPassword
        })
      });
      const data = await res.json();
      setTestResult(data);
    } catch (err: any) {
      setTestResult({ success: false, message: err.message || 'Connection test request failed' });
    } finally {
      setTesting(false);
    }
  };

  const handleSaveConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaveResult(null);
    try {
      const res = await fetch('/api/admin/storage/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: selectedMode,
          host: dbHost,
          port: parseInt(dbPort, 10) || 3306,
          database: dbName,
          user: dbUser,
          password: dbPassword
        })
      });
      const data = await res.json();
      setSaveResult({ success: data.success, message: data.message });
      if (data.status) {
        setStatus(data.status);
      }
      // Reload CMS Context with fresh store from new active provider
      if (reloadFromStorage) {
        await reloadFromStorage();
      }
    } catch (err: any) {
      setSaveResult({ success: false, message: err.message || 'Failed to save configuration' });
    } finally {
      setSaving(false);
    }
  };

  const handleInitTables = async () => {
    if (!window.confirm('Initialize all necessary tables in the MySQL/MariaDB database? This will create missing tables safely without overwriting existing tables.')) {
      return;
    }
    setInitializing(true);
    setInitResult(null);
    try {
      const res = await fetch('/api/admin/storage/init-tables', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          host: dbHost,
          port: parseInt(dbPort, 10) || 3306,
          database: dbName,
          user: dbUser,
          password: dbPassword
        })
      });
      const data = await res.json();
      setInitResult(data);
      await fetchStatus();
    } catch (err: any) {
      setInitResult({ success: false, message: err.message || 'Failed to initialize database tables' });
    } finally {
      setInitializing(false);
    }
  };

  const handleMigrateJsonToDb = async () => {
    if (!window.confirm('Import all content from data/cms_store.json into the MySQL/MariaDB database? Existing records in the database will be updated. The local JSON file will be preserved untouched.')) {
      return;
    }
    setMigrating(true);
    setMigrateResult(null);
    try {
      const res = await fetch('/api/admin/storage/migrate-json-to-db', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          host: dbHost,
          port: parseInt(dbPort, 10) || 3306,
          database: dbName,
          user: dbUser,
          password: dbPassword
        })
      });
      const data = await res.json();
      setMigrateResult(data);
      await fetchStatus();
      if (reloadFromStorage) {
        await reloadFromStorage();
      }
    } catch (err: any) {
      setMigrateResult({ success: false, message: err.message || 'Data migration failed' });
    } finally {
      setMigrating(false);
    }
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-serif font-bold text-[#0B192C]">
              Database &amp; Storage Architecture
            </h1>
            <span className="px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider rounded-full bg-indigo-100 text-indigo-800">
              CyberPanel Ready
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Switch between zero-setup JSON file storage and production MySQL/MariaDB database with live sync and data migration.
          </p>
        </div>

        <button
          onClick={fetchStatus}
          disabled={loading}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold cursor-pointer transition-colors"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Status</span>
        </button>
      </div>

      {/* Status Card */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className={`p-3 rounded-xl ${status?.mode === 'database' && status?.isConnected ? 'bg-emerald-50 text-emerald-600' : 'bg-blue-50 text-blue-600'}`}>
              {status?.mode === 'database' ? <Database className="w-6 h-6" /> : <HardDrive className="w-6 h-6" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Active Storage Engine
                </span>
                <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold ${
                  status?.mode === 'database'
                    ? status.isConnected ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                    : 'bg-blue-100 text-blue-800'
                }`}>
                  {status?.mode === 'database' ? (
                    <>
                      <span className={`w-1.5 h-1.5 rounded-full ${status.isConnected ? 'bg-emerald-500' : 'bg-amber-500 animate-pulse'}`} />
                      MySQL / MariaDB ({status.isConnected ? 'Connected' : 'Fallback active'})
                    </>
                  ) : (
                    <>
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                      JSON File Storage
                    </>
                  )}
                </span>
              </div>
              <p className="text-sm text-slate-700 font-medium mt-1">
                {status?.message || 'Storage engine is running smoothly.'}
              </p>
              <p className="text-[11px] text-slate-400 mt-1">
                Local JSON Store: <code className="bg-slate-100 px-1 py-0.5 rounded text-slate-600">data/cms_store.json</code>
                {status?.jsonFileSize ? ` (${(status.jsonFileSize / 1024).toFixed(1)} KB)` : ''}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 self-end md:self-center">
            {status?.mode === 'database' && (
              <div className="text-right">
                <div className="text-xs text-slate-500">Database Target</div>
                <div className="text-xs font-bold text-slate-800">
                  {status.config?.user}@{status.config?.host}:{status.config?.port}/{status.config?.database}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Record count summary */}
        {status?.jsonRecordCounts && (
          <div className="mt-4 pt-4 border-t border-slate-100">
            <div className="text-xs font-bold text-slate-600 mb-2 flex items-center justify-between">
              <span>CMS Record Inventory</span>
              <span className="text-[11px] font-normal text-slate-400">
                JSON vs MySQL records are tracked independently
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-2">
              {[
                { label: 'Articles', key: 'articles' },
                { label: 'Listings', key: 'listings' },
                { label: 'Pages', key: 'pages' },
                { label: 'Media', key: 'mediaItems' },
                { label: 'Gallery', key: 'galleryPhotos' },
                { label: 'Hotlines', key: 'emergencyHotlines' }
              ].map(({ label, key }) => (
                <div key={key} className="bg-slate-50 rounded-lg p-2.5 border border-slate-100 text-center">
                  <div className="text-[11px] text-slate-500">{label}</div>
                  <div className="text-base font-bold text-[#0B192C] mt-0.5">
                    {status.jsonRecordCounts[key] ?? 0}
                    {status.dbRecordCounts && (
                      <span className="text-[11px] text-emerald-600 font-semibold ml-1">
                        / {status.dbRecordCounts[key] ?? 0} DB
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Main Configuration Form */}
      <form onSubmit={handleSaveConfig} className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-6">
        <div>
          <h2 className="text-base font-bold text-[#0B192C] flex items-center gap-2">
            <Server className="w-5 h-5 text-indigo-600" />
            Storage Engine Selection
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Select how Zunheboto Social reads and writes data. You can switch engines at any time without losing content.
          </p>
        </div>

        {/* Engine Selector Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <label
            onClick={() => setSelectedMode('json')}
            className={`flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${
              selectedMode === 'json'
                ? 'border-blue-600 bg-blue-50/40 ring-2 ring-blue-100'
                : 'border-slate-200 hover:border-slate-300 bg-white'
            }`}
          >
            <input
              type="radio"
              name="storage_mode"
              value="json"
              checked={selectedMode === 'json'}
              onChange={() => setSelectedMode('json')}
              className="mt-1 text-blue-600 focus:ring-blue-500"
            />
            <div className="space-y-1">
              <div className="font-bold text-sm text-[#0B192C] flex items-center gap-1.5">
                <HardDrive className="w-4 h-4 text-blue-600" />
                Option 1 — JSON Storage (Default)
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">
                Uses the local <code className="bg-slate-100 px-1 py-0.5 rounded text-slate-700">data/cms_store.json</code> file. Zero database configuration required, perfectly self-contained, and great for rapid staging or file-based hosting.
              </p>
            </div>
          </label>

          <label
            onClick={() => setSelectedMode('database')}
            className={`flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${
              selectedMode === 'database'
                ? 'border-indigo-600 bg-indigo-50/40 ring-2 ring-indigo-100'
                : 'border-slate-200 hover:border-slate-300 bg-white'
            }`}
          >
            <input
              type="radio"
              name="storage_mode"
              value="database"
              checked={selectedMode === 'database'}
              onChange={() => setSelectedMode('database')}
              className="mt-1 text-indigo-600 focus:ring-indigo-500"
            />
            <div className="space-y-1">
              <div className="font-bold text-sm text-[#0B192C] flex items-center gap-1.5">
                <Database className="w-4 h-4 text-indigo-600" />
                Option 2 — MySQL / MariaDB (CyberPanel)
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">
                Connects to a MySQL or MariaDB database instance created in CyberPanel or cPanel. Tables are stored using InnoDB with full UTF-8 Unicode support.
              </p>
            </div>
          </label>
        </div>

        {/* Database Credentials Section (Active when database option selected) */}
        <div className={`space-y-4 pt-4 border-t border-slate-200 transition-opacity ${selectedMode === 'database' ? 'opacity-100' : 'opacity-70'}`}>
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <Database className="w-4 h-4 text-indigo-600" />
              CyberPanel MySQL / MariaDB Credentials
            </h3>
            <span className="text-[11px] text-slate-500">
              Settings are saved to <code className="bg-slate-100 px-1 py-0.5 rounded">.env</code> and <code className="bg-slate-100 px-1 py-0.5 rounded">data/storage_config.json</code>
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Database Host
              </label>
              <input
                type="text"
                value={dbHost}
                onChange={(e) => setDbHost(e.target.value)}
                placeholder="localhost (or 127.0.0.1)"
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <p className="text-[11px] text-slate-400 mt-1">
                For CyberPanel running on the same VPS, use <code className="text-slate-600">localhost</code>.
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Database Port
              </label>
              <input
                type="number"
                value={dbPort}
                onChange={(e) => setDbPort(e.target.value)}
                placeholder="3306"
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <p className="text-[11px] text-slate-400 mt-1">Default MySQL port: 3306</p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Database Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={dbName}
                onChange={(e) => setDbName(e.target.value)}
                placeholder="e.g. zunheboto_db"
                required={selectedMode === 'database'}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <p className="text-[11px] text-slate-400 mt-1">Created in CyberPanel &gt; Databases</p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Database Username <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={dbUser}
                onChange={(e) => setDbUser(e.target.value)}
                placeholder="e.g. zunheboto_user"
                required={selectedMode === 'database'}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <p className="text-[11px] text-slate-400 mt-1">MySQL user with GRANT ALL permissions</p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Database Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={dbPassword}
                  onChange={(e) => setDbPassword(e.target.value)}
                  placeholder={status?.config?.hasPassword ? '•••••••• (leave empty to keep current)' : 'Enter password'}
                  className="w-full px-3 py-2 pr-10 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                {status?.config?.hasPassword ? 'Password is saved on server' : 'Password for MySQL user'}
              </p>
            </div>
          </div>

          {/* Test connection & Save Action Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-3">
            <button
              type="button"
              onClick={handleTestConnection}
              disabled={testing || !dbName || !dbUser}
              className="inline-flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-900 disabled:opacity-50 text-white rounded-lg text-xs font-bold cursor-pointer transition-colors"
            >
              {testing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4 text-emerald-400" />}
              <span>Test Connection</span>
            </button>

            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-lg text-xs font-bold cursor-pointer shadow-sm transition-colors"
            >
              {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
              <span>Save Configuration</span>
            </button>
          </div>

          {/* Feedback banners */}
          {testResult && (
            <div className={`p-3.5 rounded-lg text-xs flex items-start gap-2.5 ${
              testResult.success ? 'bg-emerald-50 text-emerald-900 border border-emerald-200' : 'bg-rose-50 text-rose-900 border border-rose-200'
            }`}>
              {testResult.success ? <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" /> : <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />}
              <div>
                <p className="font-bold">{testResult.success ? 'Connection Successful!' : 'Connection Failed'}</p>
                <p className="mt-0.5">{testResult.message}</p>
                {testResult.version && <p className="text-[11px] font-mono mt-1 text-emerald-700">Database Engine: {testResult.version}</p>}
              </div>
            </div>
          )}

          {saveResult && (
            <div className={`p-3.5 rounded-lg text-xs flex items-start gap-2.5 ${
              saveResult.success ? 'bg-emerald-50 text-emerald-900 border border-emerald-200' : 'bg-rose-50 text-rose-900 border border-rose-200'
            }`}>
              {saveResult.success ? <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" /> : <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />}
              <div>
                <p className="font-bold">{saveResult.success ? 'Settings Saved' : 'Save Warning'}</p>
                <p className="mt-0.5">{saveResult.message}</p>
              </div>
            </div>
          )}
        </div>
      </form>

      {/* Database Maintenance & Migration Utilities */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-5">
        <div>
          <h2 className="text-base font-bold text-[#0B192C] flex items-center gap-2">
            <Layers className="w-5 h-5 text-indigo-600" />
            Database Setup &amp; JSON Migration Tools
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Initialize schema tables and copy all existing articles, listings, pages, and media from JSON into MySQL/MariaDB.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Tool 1: Init Tables */}
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 flex flex-col justify-between gap-3">
            <div>
              <div className="font-bold text-sm text-[#0B192C] flex items-center gap-1.5">
                <Database className="w-4 h-4 text-indigo-600" />
                Initialize Schema Tables
              </div>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                Creates the required 13 tables (<code className="bg-white px-1 py-0.5 rounded border border-slate-200">articles</code>, <code className="bg-white px-1 py-0.5 rounded border border-slate-200">listings</code>, <code className="bg-white px-1 py-0.5 rounded border border-slate-200">media_items</code>, etc.) with utf8mb4 encoding if they do not exist.
              </p>
            </div>

            <button
              type="button"
              onClick={handleInitTables}
              disabled={initializing || !dbName || !dbUser}
              className="self-start inline-flex items-center gap-2 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-lg text-xs font-bold cursor-pointer transition-colors"
            >
              {initializing ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
              <span>Initialize Tables</span>
            </button>
          </div>

          {/* Tool 2: Migrate JSON to DB */}
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 flex flex-col justify-between gap-3">
            <div>
              <div className="font-bold text-sm text-[#0B192C] flex items-center gap-1.5">
                <ArrowRight className="w-4 h-4 text-emerald-600" />
                Migrate JSON Data into MySQL
              </div>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                Reads all current data from <code className="bg-white px-1 py-0.5 rounded border border-slate-200">data/cms_store.json</code> and populates your MySQL database tables. The original JSON file remains 100% untouched as a safe backup.
              </p>
            </div>

            <button
              type="button"
              onClick={handleMigrateJsonToDb}
              disabled={migrating || !dbName || !dbUser}
              className="self-start inline-flex items-center gap-2 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-lg text-xs font-bold cursor-pointer transition-colors"
            >
              {migrating ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <HardDrive className="w-3.5 h-3.5" />}
              <span>Import JSON to Database</span>
            </button>
          </div>
        </div>

        {/* Init result */}
        {initResult && (
          <div className={`p-3.5 rounded-lg text-xs flex items-start gap-2.5 ${
            initResult.success ? 'bg-emerald-50 text-emerald-900 border border-emerald-200' : 'bg-rose-50 text-rose-900 border border-rose-200'
          }`}>
            {initResult.success ? <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" /> : <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />}
            <div>
              <p className="font-bold">{initResult.success ? 'Tables Initialized' : 'Initialization Error'}</p>
              <p className="mt-0.5">{initResult.message}</p>
            </div>
          </div>
        )}

        {/* Migration result */}
        {migrateResult && (
          <div className={`p-3.5 rounded-lg text-xs flex items-start gap-2.5 ${
            migrateResult.success ? 'bg-emerald-50 text-emerald-900 border border-emerald-200' : 'bg-rose-50 text-rose-900 border border-rose-200'
          }`}>
            {migrateResult.success ? <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" /> : <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />}
            <div className="space-y-1">
              <p className="font-bold">{migrateResult.success ? 'Migration Complete!' : 'Migration Error'}</p>
              <p>{migrateResult.message}</p>
              {migrateResult.counts && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 pt-1.5 font-mono text-[11px]">
                  {Object.entries(migrateResult.counts).map(([k, v]) => (
                    <div key={k} className="bg-white/80 px-2 py-1 rounded border border-emerald-200">
                      {k}: <strong>{v}</strong>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* CyberPanel & Termius Deployment Guide Box */}
      <div className="bg-slate-900 text-white rounded-xl p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Terminal className="w-5 h-5 text-emerald-400" />
            <h3 className="text-sm font-bold tracking-wide">
              CyberPanel &amp; Termius Command-Line Deployment
            </h3>
          </div>
          <span className="text-[11px] font-mono text-slate-400 bg-slate-800 px-2 py-1 rounded">
            SSH / CLI
          </span>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed">
          When uploading this project ZIP to CyberPanel via File Manager and accessing your VPS through Termius, you can configure everything in seconds directly from the command line:
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
          <div className="bg-slate-950 p-3.5 rounded-lg border border-slate-800 font-mono space-y-1">
            <div className="text-slate-400 text-[11px] font-sans font-semibold">1. Interactive Database Setup Wizard</div>
            <div className="text-emerald-400">npm run setup</div>
            <div className="text-slate-400 text-[11px] font-sans pt-1">
              Prompts for JSON vs MySQL, asks for host, port, DB name, and credentials, tests the connection, initializes tables, and updates your <code className="text-slate-300">.env</code> automatically.
            </div>
          </div>

          <div className="bg-slate-950 p-3.5 rounded-lg border border-slate-800 font-mono space-y-1">
            <div className="text-slate-400 text-[11px] font-sans font-semibold">2. JSON to Database Migration Command</div>
            <div className="text-emerald-400">npm run migrate:json-to-db</div>
            <div className="text-slate-400 text-[11px] font-sans pt-1">
              Imports all existing JSON content into your MySQL database with one command, keeping your JSON files safe as backup.
            </div>
          </div>
        </div>

        <div className="text-[11px] text-slate-400 border-t border-slate-800 pt-3 flex flex-wrap items-center justify-between gap-2">
          <span>Production start: <code className="text-slate-200">npm start</code> | Development mode: <code className="text-slate-200">npm run dev</code></span>
          <span className="text-emerald-400 font-semibold">CyberPanel NodeJS App Manager compatible</span>
        </div>
      </div>
    </div>
  );
};
