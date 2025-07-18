import { pool } from './database';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';

dotenv.config();

async function initializeDatabase() {
  try {
    console.log('Initializing PostgreSQL database...');
    
    // Read and execute schema
    const schemaPath = path.join(__dirname, '..', 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');
    
    // Execute the entire schema (PostgreSQL can handle multiple statements)
    await pool.query(schema);

    console.log('Database initialized successfully!');
  } catch (error) {
    console.error('Database initialization failed:', error);
    if (require.main === module) {
      process.exit(1);
    }
    throw error;
  } finally {
    if (require.main === module) {
      await pool.end();
    }
  }
}

// Run if called directly
if (require.main === module) {
  initializeDatabase();
}

export { initializeDatabase };
