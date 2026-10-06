import { PoolConnection } from 'mysql2/promise';
import { Migration } from './types';
import { migration001CoreSchema } from './001_core_schema';
import { migration002ExtensionsAndIndexes } from './002_add_extensions_and_indexes';

export * from './types';

export const ALL_MIGRATIONS: Migration[] = [
  migration001CoreSchema,
  migration002ExtensionsAndIndexes
];

export class MigrationManager {
  /**
   * Creates the zs_migrations tracking table if it does not already exist.
   */
  static async ensureMigrationsTable(conn: PoolConnection): Promise<void> {
    await conn.query(`
      CREATE TABLE IF NOT EXISTS \`zs_migrations\` (
        \`id\` INT AUTO_INCREMENT PRIMARY KEY,
        \`migration_name\` VARCHAR(255) NOT NULL UNIQUE,
        \`batch\` INT NOT NULL DEFAULT 1,
        \`applied_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
  }

  /**
   * Returns a list of migration names that have already been applied to this database.
   */
  static async getAppliedMigrations(conn: PoolConnection): Promise<string[]> {
    await this.ensureMigrationsTable(conn);
    try {
      const [rows]: any = await conn.query('SELECT `migration_name` FROM `zs_migrations` ORDER BY `id` ASC');
      return (rows || []).map((r: any) => r.migration_name);
    } catch (e) {
      return [];
    }
  }

  /**
   * Applies any pending migrations in sequential order.
   * Never drops tables, never deletes content, and tracks applied migrations.
   */
  static async runPendingMigrations(conn: PoolConnection): Promise<{
    applied: string[];
    alreadyApplied: string[];
  }> {
    await this.ensureMigrationsTable(conn);
    const applied = await this.getAppliedMigrations(conn);
    const appliedSet = new Set(applied);

    // Determine current batch number
    let currentBatch = 1;
    try {
      const [batchRows]: any = await conn.query('SELECT MAX(`batch`) AS max_batch FROM `zs_migrations`');
      if (batchRows && batchRows[0]?.max_batch !== null && batchRows[0]?.max_batch !== undefined) {
        currentBatch = Number(batchRows[0].max_batch) + 1;
      }
    } catch (e) {}

    const newlyApplied: string[] = [];

    for (const mig of ALL_MIGRATIONS) {
      if (!appliedSet.has(mig.name)) {
        console.log(`[Migration] Applying migration: '${mig.name}' - ${mig.description}...`);
        try {
          await mig.up(conn);
          await conn.query(
            'INSERT INTO `zs_migrations` (`migration_name`, `batch`) VALUES (?, ?)',
            [mig.name, currentBatch]
          );
          newlyApplied.push(mig.name);
          console.log(`[Migration] Successfully applied: '${mig.name}'.`);
        } catch (err: any) {
          console.error(`[Migration] Failed to apply '${mig.name}':`, err.message);
          throw new Error(`Database migration failed on '${mig.name}': ${err.message}`);
        }
      }
    }

    if (newlyApplied.length === 0) {
      console.log(`[Migration] Database schema is up to date (${applied.length} migrations applied).`);
    } else {
      console.log(`[Migration] Successfully executed ${newlyApplied.length} new migration(s).`);
    }

    return {
      applied: newlyApplied,
      alreadyApplied: applied
    };
  }
}
