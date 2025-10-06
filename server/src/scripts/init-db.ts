#!/usr/bin/env ts-node

import { dbConnection } from '../database/connection';
import { config } from '../config';

async function initializeDatabase() {
  console.log('🚀 Initializing Flowence database...');
  console.log(`📊 Environment: ${config.server.nodeEnv}`);
  console.log(`🗄️  Database: ${config.database.database}`);
  
  try {
    // Connect to database
    await dbConnection.connect();
    
    // Run migrations
    console.log('🔄 Running database migrations...');
    await dbConnection.runMigrations();
    
    // Seed database (only in development)
    if (config.server.nodeEnv === 'development') {
      console.log('🌱 Seeding database...');
      await dbConnection.seedDatabase();
    }
    
    console.log('✅ Database initialization completed successfully!');
    
    // Show migration status
    const migrations = await dbConnection.getMigrationStatus();
    console.log('\n📋 Migration Status:');
    migrations.forEach(migration => {
      console.log(`  ✅ ${migration.filename} - ${migration.executed_at}`);
    });
    
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    process.exit(1);
  } finally {
    await dbConnection.disconnect();
  }
}

// Run if called directly
if (require.main === module) {
  initializeDatabase();
}

export { initializeDatabase };

