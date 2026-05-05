#!/usr/bin/env tsx

/**
 * Database Migration Runner
 *
 * This script helps run the initial database migration for the Hiameerah e-commerce website.
 * It checks if the database is accessible before attempting to run migrations.
 */

import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

// ANSI color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(message: string, color: keyof typeof colors = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function checkDatabaseConnection(): Promise<boolean> {
  log('\n🔍 Checking database connection...', 'cyan');

  try {
    // Try to connect using Prisma
    const { stdout, stderr } = await execAsync('pnpm prisma db execute --stdin', {
      input: 'SELECT 1;',
    });

    log('✅ Database connection successful!', 'green');
    return true;
  } catch (error) {
    log('❌ Cannot connect to database', 'red');

    if (error instanceof Error) {
      const errorMessage = error.message.toLowerCase();

      if (errorMessage.includes('econnrefused') || errorMessage.includes("can't reach")) {
        log('\n💡 Possible solutions:', 'yellow');
        log('   1. Start Docker Desktop and run: docker-compose up -d postgres', 'yellow');
        log('   2. If using local PostgreSQL, ensure the service is running', 'yellow');
        log('   3. Check your DATABASE_URL in the .env file', 'yellow');
      } else if (errorMessage.includes('authentication failed')) {
        log('\n💡 Authentication issue:', 'yellow');
        log('   - Verify your DATABASE_URL credentials in .env', 'yellow');
        log('   - For Docker: hiameerah_user / hiameerah_password', 'yellow');
      } else if (errorMessage.includes('database') && errorMessage.includes('does not exist')) {
        log('\n💡 Database does not exist:', 'yellow');
        log('   - For Docker: Run docker-compose up -d postgres', 'yellow');
        log('   - For local PostgreSQL: Create the database manually', 'yellow');
      }
    }

    return false;
  }
}

async function runMigration(): Promise<boolean> {
  log('\n🚀 Running database migration...', 'cyan');

  try {
    const { stdout, stderr } = await execAsync('pnpm prisma migrate dev --name initial_schema');

    log('\n📝 Migration output:', 'blue');
    console.log(stdout);

    if (stderr && !stderr.includes('warn')) {
      console.error(stderr);
    }

    log('\n✅ Migration completed successfully!', 'green');
    return true;
  } catch (error) {
    log('\n❌ Migration failed', 'red');

    if (error instanceof Error) {
      console.error(error.message);
    }

    return false;
  }
}

async function verifyMigration(): Promise<void> {
  log('\n🔍 Verifying migration...', 'cyan');

  try {
    const { stdout } = await execAsync('pnpm prisma db execute --stdin', {
      input: `
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        ORDER BY table_name;
      `,
    });

    log('\n📊 Database tables created:', 'green');
    console.log(stdout);
  } catch (error) {
    log('⚠️  Could not verify tables (this is optional)', 'yellow');
  }
}

async function main() {
  log('═══════════════════════════════════════════════════════', 'cyan');
  log('  Hiameerah E-Commerce - Database Migration Runner', 'cyan');
  log('═══════════════════════════════════════════════════════', 'cyan');

  // Step 1: Check database connection
  const isConnected = await checkDatabaseConnection();

  if (!isConnected) {
    log('\n❌ Cannot proceed without database connection', 'red');
    log('📖 See TASK-2.3-MIGRATION-INSTRUCTIONS.md for setup help', 'yellow');
    process.exit(1);
  }

  // Step 2: Run migration
  const migrationSuccess = await runMigration();

  if (!migrationSuccess) {
    log('\n❌ Migration failed', 'red');
    process.exit(1);
  }

  // Step 3: Verify migration
  await verifyMigration();

  // Success!
  log('\n═══════════════════════════════════════════════════════', 'green');
  log('  ✅ Database migration completed successfully!', 'green');
  log('═══════════════════════════════════════════════════════', 'green');

  log('\n📝 Next steps:', 'cyan');
  log('   1. Run: pnpm prisma:studio (to view your database)', 'cyan');
  log('   2. Run: pnpm db:test (to test the connection)', 'cyan');
  log('   3. Continue with Task 2.4 (Write unit tests)', 'cyan');

  log('\n✨ Happy coding!', 'green');
}

// Run the script
main().catch((error) => {
  log('\n❌ Unexpected error:', 'red');
  console.error(error);
  process.exit(1);
});
