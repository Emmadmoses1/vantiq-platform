import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

const isMissingEnv = !supabaseUrl || 
  !supabaseAnonKey || 
  supabaseUrl === 'YOUR_REAL_SUPABASE_URL';

let supabase;

if (isMissingEnv) {
  console.warn('⚠️ Supabase env vars missing — running in offline/dev mode');
  // Mock client so imports don't crash
  supabase = {
    from: () => ({ select: () => Promise.resolve({ data: [], error: null }) }),
    auth: { getSession: () => Promise.resolve({ data: null }) },
    rpc: () => Promise.resolve({ data: null, error: null }),
    channel: () => ({ on: () => ({}) }),
  };
} else {
  supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: { persistSession: true, autoRefreshToken: true },
    realtime: { params: { eventsPerSecond: 10 } },
  });
}

export { supabase };

export const setUserContext = async (telegramId) => {
  if (isMissingEnv) return;
  await supabase.rpc('set_config', {
    name: 'app.telegram_id',
    value: telegramId.toString(),
  });
};
