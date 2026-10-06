import { getStorageConfig } from '../server/storage/config';
import { MysqlStorageProvider } from '../server/storage/MysqlProvider';
import { JsonStorageProvider } from '../server/storage/JsonProvider';

async function main() {
  console.log('\n===========================================================');
  console.log('   Zunheboto Social — JSON to MySQL / MariaDB Migration    ');
  console.log('===========================================================\n');

  const config = getStorageConfig();

  if (!config.database.database || !config.database.user) {
    console.error('[ERROR] Database configuration is incomplete.');
    console.error('Please run "npm run setup" first to configure your database host, name, and credentials.');
    process.exit(1);
  }

  console.log(`Connecting to database ${config.database.database} on ${config.database.host}:${config.database.port}...`);
  const provider = new MysqlStorageProvider(config.database);

  try {
    const testResult = await provider.testConnection();
    if (!testResult.success) {
      console.error(`[ERROR] Database connection failed: ${testResult.message}`);
      process.exit(1);
    }

    console.log(`[OK] Connected to ${testResult.version || 'MySQL/MariaDB'}`);
    console.log('Ensuring database schema & tables exist...');
    await provider.initTables();

    console.log('Reading data from data/cms_store.json...');
    const jsonProvider = new JsonStorageProvider();
    const jsonStore = await jsonProvider.loadStore();

    console.log('Importing records into database tables...');
    const result = await provider.migrateFromJson(jsonStore);

    console.log('\n===========================================================');
    console.log('                  Migration Completed!                     ');
    console.log('===========================================================');
    console.log(result.message);
    console.log('\nRecords migrated:');
    for (const [key, count] of Object.entries(result.counts)) {
      console.log(`  - ${key}: ${count} records`);
    }

    console.log('\nNotice: Source file data/cms_store.json was preserved untouched.');
    console.log('You can switch between JSON and database anytime.\n');
  } catch (err: any) {
    console.error('\n[ERROR] Migration failed:', err.message);
    process.exit(1);
  } finally {
    await provider.close();
  }
}

main();
