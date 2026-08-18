import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcrypt';
import readline from 'readline';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const question = (query) => new Promise((resolve) => rl.question(query, resolve));

async function setupAdmin() {
  console.log('🔐 VANTIQ Admin Setup\n');

  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  const supabaseKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing Supabase credentials in .env');
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  const email = await question('Admin Email: ');
  const password = await question('Admin Password: ');
  const name = await question('Admin Name: ');

  const passwordHash = await bcrypt.hash(password, 10);

  const { data, error } = await supabase.from('admin_users').insert({
    email: email.toLowerCase(),
    password_hash: passwordHash,
    name,
    role: 'super_admin',
    permissions: ['all'],
    active: true,
    created_at: new Date().toISOString(),
  }).select();

  if (error) {
    console.error('❌ Error creating admin:', error.message);
    process.exit(1);
  }

  console.log('\n✅ Admin user created successfully!');
  console.log(`📧 Email: ${email}`);
  console.log(`🔑 Login at: https://your-domain.com/admin/login\n`);

  rl.close();
}

setupAdmin().catch(console.error);