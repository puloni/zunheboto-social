import readline from 'readline';
import { getStorageConfig, saveStorageConfig } from '../server/storage/config';
import { MysqlStorageProvider } from '../server/storage/MysqlProvider';
import { JsonStorageProvider } from '../server/storage/JsonProvider';

function createPrompter() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  const question = (query: string): Promise<string> => {
    return new Promise((resolve) => rl.question(query, resolve));
  };

  const close = () => rl.close();

  return { question, close };
}

async function main() {
  console.log('\n===========================================================');
  console.log('       Zunheboto Social — Storage & Database Setup          ');
  console.log('             CyberPanel & Termius CLI Wizard               ');
  console.log('===========================================================\n');

  const currentConfig = getStorageConfig();
  console.log(`Current active storage: [${currentConfig.mode.toUpperCase()}]`);
  if (currentConfig.mode === 'database') {
    console.log(`Current DB Host: ${currentConfig.database.host}:${currentConfig.database.port}`);
    console.log(`Current DB Name: ${currentConfig.database.database || '(none)'}`);
    console.log(`Current DB User: ${currentConfig.database.user || '(none)'}`);
  }
  console.log('-----------------------------------------------------------\n');

  const prompter = createPrompter();

  try {
    console.log('Select Storage Option:');
    console.log('  1. JSON (Local file storage in data/cms_store.json)');
    console.log('  2. MySQL / MariaDB (CyberPanel / Dedicated Database)');
    const choiceRaw = await prompter.question('\nDatabase type [JSON or MySQL/MariaDB] (Default: JSON): ');
    const choice = choiceRaw.trim().toLowerCase();

    const isMysql = choice === '2' || choice.includes('mysql') || choice.includes('mariadb') || choice === 'db' || choice === 'database';

    if (isMysql) {
      console.log('\n-----------------------------------------------------------');
      console.log(' Enter CyberPanel MySQL / MariaDB Database Details:');
      console.log('-----------------------------------------------------------');

      const hostInput = await prompter.question(`Database host [${currentConfig.database.host || 'localhost'}]: `);
      const host = hostInput.trim() || currentConfig.database.host || 'localhost';

      const portInput = await prompter.question(`Database port [${currentConfig.database.port || 3306}]: `);
      const port = parseInt(portInput.trim() || String(currentConfig.database.port || 3306), 10);

      let database = '';
      while (!database) {
        const dbInput = await prompter.question(`Database name [${currentConfig.database.database || ''}]: `);
        database = dbInput.trim() || currentConfig.database.database || '';
        if (!database) {
          console.log('Database name cannot be empty. Please enter your CyberPanel database name.');
        }
      }

      const userInput = await prompter.question(`Database username [${currentConfig.database.user || 'root'}]: `);
      const user = userInput.trim() || currentConfig.database.user || 'root';

      const passPrompt = currentConfig.database.password ? 'Database password [leave empty to keep current]: ' : 'Database password: ';
      const passInput = await prompter.question(passPrompt);
      const password = passInput !== '' ? passInput : currentConfig.database.password;

      console.log('\nConnecting and testing database credentials...');
      const provider = new MysqlStorageProvider({
        host,
        port,
        database,
        user,
        password
      });

      const testResult = await provider.testConnection();

      if (testResult.success) {
        console.log(`\n[SUCCESS] ${testResult.message}`);

        // Ask to initialize tables
        const initChoice = await prompter.question('\nInitialize/verify database tables now? [Y/n]: ');
        if (!initChoice.trim() || initChoice.trim().toLowerCase() === 'y') {
          console.log('Creating/verifying database tables...');
          const initRes = await provider.initTables();
          console.log(`[OK] ${initRes.message}`);
        }

        // Ask to migrate JSON data
        const migrateChoice = await prompter.question('Import existing JSON content into database? [Y/n]: ');
        if (!migrateChoice.trim() || migrateChoice.trim().toLowerCase() === 'y') {
          console.log('Importing content from data/cms_store.json...');
          const jsonProvider = new JsonStorageProvider();
          const jsonStore = await jsonProvider.loadStore();
          const migRes = await provider.migrateFromJson(jsonStore);
          console.log(`[OK] ${migRes.message}`);
          console.log('Import summary:');
          for (const [key, count] of Object.entries(migRes.counts)) {
            console.log(`  - ${key}: ${count} records`);
          }
        }

        // Save configuration
        saveStorageConfig({
          mode: 'database',
          host,
          port,
          database,
          user,
          password
        });

        console.log('\n===========================================================');
        console.log('   Configuration successfully saved to .env and system!   ');
        console.log('===========================================================');
        console.log(`DATA_STORAGE=database`);
        console.log(`DB_HOST=${host}`);
        console.log(`DB_PORT=${port}`);
        console.log(`DB_NAME=${database}`);
        console.log(`DB_USER=${user}`);
        console.log(`DB_PASSWORD=••••••••\n`);
        console.log('You can now start your application with:');
        console.log('  npm start      (Production mode)');
        console.log('  npm run dev    (Development mode)\n');
      } else {
        console.log(`\n[ERROR] Connection failed: ${testResult.message}`);
        const saveAnyway = await prompter.question('Save configuration anyway? [y/N]: ');
        if (saveAnyway.trim().toLowerCase() === 'y') {
          saveStorageConfig({
            mode: 'database',
            host,
            port,
            database,
            user,
            password
          });
          console.log('\nConfiguration saved with warning. Please verify MySQL/MariaDB server is running.');
        } else {
          console.log('\nSetup cancelled. Previous configuration unchanged.');
        }
      }

      await provider.close();
    } else {
      // JSON Storage Option
      saveStorageConfig({
        mode: 'json'
      });
      console.log('\n===========================================================');
      console.log('   Configuration set to JSON file storage!                ');
      console.log('===========================================================');
      console.log('DATA_STORAGE=json');
      console.log('Data will be stored and read from data/cms_store.json\n');
      console.log('You can start your application with:');
      console.log('  npm start      (Production mode)');
      console.log('  npm run dev    (Development mode)\n');
    }
  } catch (err: any) {
    console.error('\nAn error occurred during setup:', err.message);
  } finally {
    prompter.close();
  }
}

main();
