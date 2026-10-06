import { PoolConnection } from 'mysql2/promise';

export interface Migration {
  name: string;
  description: string;
  up: (conn: PoolConnection) => Promise<void>;
  down?: (conn: PoolConnection) => Promise<void>;
}
