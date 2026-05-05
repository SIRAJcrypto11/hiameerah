/**
 * Test Database Connection Script
 *
 * This script tests the PostgreSQL database connection using Prisma.
 * Run with: npx tsx scripts/test-db-connection.ts
 */

import { prisma } from '../lib/prisma';

async function testConnection() {
  console.log('🔍 Testing database connection...\n');

  try {
    // Test the connection by executing a simple query
    await prisma.$connect();
    console.log('✅ Successfully connected to the database!');

    // Get database version
    const result = await prisma.$queryRaw<Array<{ version: string }>>`
      SELECT version();
    `;

    console.log('\n📊 Database Information:');
    console.log('Version:', result[0].version);

    // Test if we can query (will be empty until schema is migrated)
    console.log('\n🔍 Testing query capabilities...');
    console.log('Note: Tables will be empty until migrations are run (Task 2.3)');

    console.log('\n✨ Database connection test completed successfully!');
    console.log('\n📝 Next steps:');
    console.log('   1. Complete Task 2.2: Implement Prisma schema');
    console.log('   2. Complete Task 2.3: Run database migrations');
    console.log('   3. Start building the application!');
  } catch (error) {
    console.error('\n❌ Database connection failed!');
    console.error('\nError details:', error);
    console.error('\n🔧 Troubleshooting steps:');
    console.error('   1. Ensure PostgreSQL is running');
    console.error('   2. Check DATABASE_URL in .env file');
    console.error('   3. Verify database credentials are correct');
    console.error('   4. See DATABASE_SETUP.md for detailed instructions');
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

testConnection();
