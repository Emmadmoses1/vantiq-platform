import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

async function migrate() {
  console.log('🔄 Running database migrations...\n');

  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  const supabaseKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing Supabase credentials');
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  const migrationsDir = path.join(process.cwd(), 'supabase', 'migrations');
  const files = fs.readdirSync(migrationsDir).sort();

  for (const file of files) {
    if (!file.endsWith('.sql')) continue;

    console.log(`Running: ${file}`);
    const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf8');

    const { error } = await supabase.rpc('exec_sql', { sql });

    if (error) {
      console.error(`❌ Error in ${file}:`, error.message);
      process.exit(1);
    }

    console.log(`✅ ${file} completed`);
  }

  console.log('\n✅ All migrations completed successfully!');
}

migrate().catch(console.error);