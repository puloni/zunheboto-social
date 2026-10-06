import { getStorageConfig } from '../server/storage/config';
import { MysqlStorageProvider } from '../server/storage/MysqlProvider';
import { MigrationManager } from '../server/storage/migrations';

async function main() {
  console.log('\n===========================================================');
  console.log('       Zunheboto Social — MariaDB Schema Migrator          ');
  console.log('===========================================================\n');

  const config = getStorageConfig();
  if (config.mode !== 'database') {
    console.log(`[Notice] Active storage mode is '${config.mode}'.`);
    console.log('To migrate a MariaDB database, configure DATA_STORAGE=database in .env or provide DB credentials.');
  }

  console.log(`Connecting to database at ${config.database.host}:${config.database.port} (${config.database.database})...`);
  const provider = new MysqlStorageProvider(config.database);

  try {
    const test = await provider.testConnection();
    if (!test.success) {
      console.error(`[Error] Connection failed: ${test.message}`);
      process.exit(1);
    }

    console.log(`[Success] Connected to MariaDB (${test.version}). Running migrations...`);
    const pool = (provider as any).getPool();
    const conn = await pool.getConnection();

    try {
      const result = await MigrationManager.runPendingMigrations(conn);
      console.log('\n-----------------------------------------------------------');
      console.log(`Applied: ${result.applied.length} new migration(s)`);
      console.log(`Total: ${result.alreadyApplied.length + result.applied.length} migration(s) in database`);
      console.log('-----------------------------------------------------------\n');
      console.log('[OK] Database migration completed safely. No data was dropped or modified.');
    } finally {
      conn.release();
    }
  } catch (err: any) {
    console.error('[Migration Error]:', err.message);
    process.exit(1);
  } finally {
    await provider.close();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
