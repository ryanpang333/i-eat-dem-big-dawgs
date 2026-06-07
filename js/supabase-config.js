// Replace these two values with your real Supabase project details
// Get them from: supabase.com → your project → Settings → API
const SUPABASE_URL = 'https://tmspniubnvjdbmudvovb.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_1NFX1tbc8wUbeDtLAbx44Q_-YyvxBby';

const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
const DB_READY = SUPABASE_URL !== 'YOUR_SUPABASE_URL';
