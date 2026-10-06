export type StorageMode = 'json' | 'database';

export interface DatabaseConfig {
  host: string;
  port: number;
  database: string;
  user: string;
  password: string;
  ssl?: boolean | Record<string, any>;
  connectionLimit?: number;
}

export interface StorageConfig {
  mode: StorageMode;
  database: DatabaseConfig;
}

export interface MaskedStorageConfig {
  mode: StorageMode;
  database: {
    host: string;
    port: number;
    database: string;
    user: string;
    hasPassword: boolean;
    passwordMasked: string;
  };
}

export interface ConnectionTestResult {
  success: boolean;
  message: string;
  version?: string;
  latencyMs?: number;
  details?: Record<string, any>;
}

export interface TableInitResult {
  success: boolean;
  message: string;
  tablesCreated?: string[];
  tablesExisting?: string[];
}

export interface MigrationResult {
  success: boolean;
  message: string;
  counts: Record<string, number>;
  timestamp: string;
}

export interface StorageStatus {
  mode: StorageMode;
  isConnected: boolean;
  message: string;
  config: MaskedStorageConfig;
  jsonFileSize?: number;
  jsonRecordCounts?: Record<string, number>;
  dbRecordCounts?: Record<string, number>;
  lastUpdated?: string;
}

export interface IStorageProvider {
  getName(): StorageMode;
  init(): Promise<void>;
  loadStore(): Promise<any>;
  saveStore(store: any): Promise<boolean>;
  saveKey(key: string, data: any): Promise<boolean>;
  deleteArticle?(id: string): Promise<boolean>;
  testConnection(): Promise<ConnectionTestResult>;
  initTables(): Promise<TableInitResult>;
  migrateFromJson(jsonStore: any): Promise<MigrationResult>;
  close(): Promise<void>;
}
